"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface UserRecommendation {
  _id: string;
  fullName: string;
  username: string;
  distance: number;
  avatarUrl?: string;
}

interface Props {
  users: UserRecommendation[];
  onClose: () => void;
}

export default function RecommendationModal({ users, onClose }: Props) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10); // fade-in effect
  }, []);

  const handleChat = async (receiverId: string) => {
    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ receiverId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start chat.");

      router.push(`/chat/${data.conversationId}`);
    } catch (err) {
      console.error("Chat Error", err);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all duration-300 ${
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
      }`}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">
            🎉 Pengguna yang butuh barangmu!
          </h2>
          <button
            onClick={onClose}
            className="text-2xl text-gray-400 hover:text-red-500 transition"
          >
            &times;
          </button>
        </div>

        {/* User List */}
        <div className="overflow-y-auto px-6 py-4 space-y-4">
          {users.map((user) => (
            <div
              key={user._id}
              className="flex items-center justify-between p-4 bg-gray-100 hover:bg-gray-200 transition rounded-xl border shadow-sm"
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
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-800">{user.fullName}</p>
                  <p className="text-sm text-gray-500">@{user.username}</p>
                  <p className="text-xs text-gray-400">
                    {(user.distance / 1000).toFixed(1)} km dari kamu
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleChat(user._id)}
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition"
              >
                Chat
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t p-4 text-center">
          <button
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-800 underline transition"
          >
            Lanjut tanpa chat
          </button>
        </div>
      </div>
    </div>
  );
}
