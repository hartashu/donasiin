"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Bell, MapPin, Send, Users, X, Navigation, Mail } from "lucide-react";
import { mainAddress } from "@/lib/address";
import { toTitleCase } from "@/lib/titleCase";
import { motion } from "framer-motion";

interface UserRecommendation {
  _id: string;
  fullName: string;
  username: string;
  distance: number;
  avatarUrl?: string;
  address?: string;
}

interface Props {
  users: UserRecommendation[];
  category: string;
  onClose: () => void;
  noRecommendations?: boolean;
}

export default function RecommendationModal({
  users,
  category,
  onClose,
  noRecommendations = false,
}: Props) {
  const [loadingTo, setLoadingTo] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [sendingAll, setSendingAll] = useState(false);
  const [sentTo, setSentTo] = useState<string[]>([]);

  useEffect(() => {
    const timeout = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timeout);
  }, []);

  const sendMessage = async (receiverId: string) => {
    try {
      setLoadingTo(receiverId);
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          receiverId,
          text: `Hi! There's a new donation posted under "${category}" — it matches something you were looking for earlier. Check it out!`,
        }),
      });

      if (!res.ok) throw new Error("Failed to send message.");
      setSentTo((prev) => [...prev, receiverId]);
    } catch (err) {
      console.error("Message sending error:", err);
    } finally {
      setLoadingTo(null);
    }
  };

  const sendAll = async () => {
    setSendingAll(true);
    for (const user of users) {
      if (!sentTo.includes(user._id)) {
        await sendMessage(user._id);
      }
    }
    setSendingAll(false);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all duration-300 ${
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
      }`}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 relative">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800 mx-auto flex items-center gap-2">
            <Users className="w-6 h-6 text-gray-700" />
            Suggested Recipients
          </h2>
          <button
            onClick={onClose}
            className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User List */}
        <div className="overflow-y-auto px-6 py-4 space-y-4">
          {noRecommendations ? (
            <div className="text-center text-gray-600 py-12">
              <p className="text-lg font-medium mb-2">
                Tidak ada user yang direkomendasikan
              </p>
              <p className="text-sm">
                Kami tidak menemukan pengguna yang sesuai dengan kategori{" "}
                <strong>{category}</strong>.
              </p>
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user._id}
                className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition rounded-xl border border-gray-200 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <Image
                    src={
                      user.avatarUrl ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        user.fullName
                      )}`
                    }
                    alt={user.fullName}
                    width={52}
                    height={52}
                    className="rounded-full object-cover"
                  />

                  <div>
                    <p className="font-semibold text-gray-800">
                      {user.fullName}
                    </p>
                    <p className="text-sm text-gray-500">@{user.username}</p>

                    <div className="flex flex-col gap-1 text-xs text-gray-500 pt-1">
                      <div className="flex items-center w-full gap-4">
                        {/* Jarak */}
                        <div className="flex items-center gap-1 flex-shrink-0 min-w-fit mr-1">
                          <Navigation className="w-3 h-3 text-gray-400" />
                          <span>{(user.distance / 1000).toFixed(1)} km</span>
                        </div>

                        {/* Jalur, mobil, dan Jarak */}
                        <div className="flex items-center flex-1 gap-24">
                          {/* Rel / Jalan */}
                          <div className="relative flex-1 h-6">
                            {/* Mobil animasi */}
                            <motion.div
                              className="absolute top-1/2 -translate-y-1/2 z-10 text-gray-600"
                              initial={{ left: "-20px", opacity: 0 }}
                              animate={{
                                left: ["-20px", "82px"], // Gerakan halus dari luar ke dalam
                                opacity: [0, 1, 1, 0], // Fade in → stay → fade out
                                scale: [0.9, 1, 1, 0.9], // Smooth zoom in/out
                              }}
                              transition={{
                                duration: 3, // Sedikit lebih panjang untuk kelihatan smooth
                                ease: "easeInOut",
                                repeat: Infinity,
                                repeatType: "loop",
                              }}
                            >
                              <Mail className="w-4 h-4" />
                            </motion.div>
                          </div>

                          {/* Alamat */}
                          <div className="flex items-center gap-1 min-w-0">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            {user.address && (
                              <span className="truncate max-w-[130px] sm:max-w-[160px]">
                                {toTitleCase(mainAddress(user.address))}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => sendMessage(user._id)}
                  disabled={sentTo.includes(user._id) || loadingTo === user._id}
                  className={`p-2 rounded-full shadow-sm transition ${
                    sentTo.includes(user._id)
                      ? "text-teal-600 bg-transparent border border-teal-600"
                      : "bg-teal-600 hover:bg-teal-700 text-white"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loadingTo === user._id ? (
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      ></path>
                    </svg>
                  ) : sentTo.includes(user._id) ? (
                    <span className="text-sm font-medium px-2 text-teal-600">
                      Sent
                    </span>
                  ) : (
                    <Bell className="w-5 h-5" />
                  )}
                </button>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-4 gap-2 sm:gap-0">
          <button
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-800 underline transition"
          >
            {noRecommendations ? "Kembali" : "Continue without sending"}
          </button>

          <div className="flex flex-col items-start sm:items-end">
            {!noRecommendations && (
              <>
                <button
                  onClick={sendAll}
                  disabled={sendingAll || sentTo.length === users.length}
                  className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium transition shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingAll ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        ></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send All
                    </>
                  )}
                </button>

                {/* ✅ Status message */}
                {sentTo.length === users.length && users.length > 0 && (
                  <p className="text-xs text-gray-400 mt-1 italic">
                    All messages have been sent.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
