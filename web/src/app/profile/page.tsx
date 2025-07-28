"use client";

import { useEffect, useState } from "react";
import {
  IPostWithRequests,
  IRequestWithPostDetails,
  IUser,
  RequestStatus,
} from "@/types/types";
import {
  getMyUser,
  getMyPostsAction,
  getMyRequestsAction,
  updateRequestStatus,
} from "@/actions/action";
import { motion } from "framer-motion";
import UploadReceiptModal from "@/components/profile/UploadReceiptModal";

export default function ProfilePage() {
  const [user, setUser] = useState<IUser | null>(null);
  const [myPosts, setMyPosts] = useState<IPostWithRequests[]>([]);
  const [myRequests, setMyRequests] = useState<IRequestWithPostDetails[]>([]);
  const [tab, setTab] = useState<"posts" | "requests">("posts");
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null
  );

  const handleReceiptUploaded = async (
    trackingNumber: string,
    imageUrl: string
  ) => {
    if (!selectedRequestId) return;
    await handleStatusUpdate(
      selectedRequestId,
      RequestStatus.SHIPPED,
      trackingNumber,
      imageUrl
    );
    setShowReceiptModal(false);
    setSelectedRequestId(null);
  };

  useEffect(() => {
    (async () => {
      const [user, posts, requests] = await Promise.all([
        getMyUser(),
        getMyPostsAction(),
        getMyRequestsAction(),
      ]);
      setUser(user.profile);
      setMyPosts(posts);
      setMyRequests(requests);
    })();
  }, []);
  console.log(user);

  const handleStatusUpdate = async (
    id: string,
    status: RequestStatus,
    trackingNumber?: string,
    receiptUrl?: string
  ) => {
    try {
      await updateRequestStatus(id, {
        status,
        trackingNumber, // ← kamu bisa gunakan ini di backend jika dibutuhkan
        receiptUrl, // ← opsional, simpan URL bukti resi
      });

      const [posts, requests] = await Promise.all([
        getMyPostsAction(),
        getMyRequestsAction(),
      ]);
      setMyPosts(posts);
      setMyRequests(requests);
    } catch (error) {
      console.error("Failed to update request status", error);
    }
  };

  if (!user)
    return (
      <div className="p-6 text-center text-gray-500 animate-pulse">
        Loading profile...
      </div>
    );

  return (
    <>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* LEFT: User Info */}
        <div className="md:col-span-1 bg-white shadow rounded-xl p-4">
          <div className="text-center">
            <img
              src={user.avatarUrl || "/default-avatar.png"}
              width={100}
              height={100}
              alt="avatar"
              className="rounded-full mx-auto"
            />
            <h2 className="mt-4 text-lg font-semibold">{user.fullName}</h2>
            <p className="text-gray-500">@{user.username}</p>
            <p className="mt-2 text-sm">{user.email}</p>
            <p className="text-sm text-gray-600">{user.address}</p>
          </div>
          <div className="mt-6 text-center">
            <p className="font-medium">Total Posts: {myPosts.length}</p>
            <p className="font-medium">Total Requests: {myRequests.length}</p>
          </div>
        </div>

        {/* RIGHT: Posts & Requests */}
        <div className="md:col-span-3 space-y-4">
          {/* Tab Switch */}
          <div className="flex gap-4">
            {["posts", "requests"].map((type) => (
              <button
                key={type}
                className={`px-4 py-2 rounded transition duration-200 font-medium ${
                  tab === type
                    ? "bg-[#2a9d8f] text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-[#21867b] hover:text-white"
                }`}
                onClick={() => setTab(type as "posts" | "requests")}
              >
                {type === "posts" ? "My Posts" : "My Requests"}
              </button>
            ))}
          </div>

          {/* Tab: My Posts */}
          {tab === "posts" ? (
            <div className="space-y-6">
              {myPosts.map((post) => (
                <motion.div
                  key={post._id.toString()}
                  className="border p-4 rounded-xl shadow-sm hover:shadow-md transition"
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <img
                      src={post.thumbnailUrl}
                      className="w-full h-32 object-cover rounded-md md:col-span-1"
                      alt="post"
                    />
                    <div className="md:col-span-3">
                      <h3 className="text-lg font-semibold">{post.title}</h3>
                      <p className="text-sm text-gray-600">{post.category}</p>
                      <p className="text-xs">
                        Status:{" "}
                        <span
                          className={`font-medium ${
                            post.isAvailable ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {post.isAvailable ? "Available" : "Unavailable"}
                        </span>
                      </p>

                      {/* Requests */}
                      {post.requests.length > 0 && (
                        <div className="mt-4 space-y-4">
                          <h4 className="text-sm font-semibold">Requests:</h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            {post.requests.map((req) => (
                              <div
                                key={req._id.toString()}
                                className="p-4 border rounded-md bg-gray-50 space-y-2"
                              >
                                <div className="flex items-center gap-3">
                                  <img
                                    src={
                                      req.requester?.avatarUrl ||
                                      "/default-avatar.png"
                                    }
                                    width={36}
                                    height={36}
                                    alt="user"
                                    className="rounded-full"
                                  />
                                  <div>
                                    <p className="font-medium">
                                      {req.requester?.fullName}
                                    </p>
                                    <span
                                      className={`text-xs font-semibold inline-block mt-1 px-2 py-1 rounded ${
                                        req.status === RequestStatus.ACCEPTED
                                          ? "bg-green-100 text-green-700"
                                          : req.status ===
                                            RequestStatus.REJECTED
                                          ? "bg-red-100 text-red-700"
                                          : req.status === RequestStatus.PENDING
                                          ? "bg-yellow-100 text-yellow-700"
                                          : req.status === RequestStatus.SHIPPED
                                          ? "bg-blue-100 text-blue-700"
                                          : "bg-gray-100 text-gray-700"
                                      }`}
                                    >
                                      {req.status}
                                    </span>
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {req.status === RequestStatus.PENDING && (
                                    <>
                                      <button
                                        className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                                        onClick={() =>
                                          handleStatusUpdate(
                                            req._id.toString(),
                                            RequestStatus.ACCEPTED
                                          )
                                        }
                                      >
                                        Accept
                                      </button>
                                      <button
                                        className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                                        onClick={() =>
                                          handleStatusUpdate(
                                            req._id.toString(),
                                            RequestStatus.REJECTED
                                          )
                                        }
                                      >
                                        Reject
                                      </button>
                                    </>
                                  )}
                                </div>

                                {req.status === RequestStatus.ACCEPTED && (
                                  <div className="pt-2 border-t mt-3 text-right">
                                    <button
                                      className="text-sm bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1 rounded"
                                      onClick={() => {
                                        setSelectedRequestId(
                                          req._id.toString()
                                        );
                                        setShowReceiptModal(true);
                                      }}
                                    >
                                      📦 Mark as Shipped
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            // Tab: My Requests
            <div className="space-y-4">
              {myRequests.map((req) => (
                <motion.div
                  key={req._id?.toString()}
                  className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 border rounded-xl shadow-sm hover:shadow-md transition"
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={req.postDetails.thumbnailUrl}
                      width={100}
                      height={80}
                      alt="requested item"
                      className="rounded-md object-cover"
                    />
                    <div>
                      <h3 className="font-semibold">{req.postDetails.title}</h3>
                      <p className="text-sm text-gray-600">{req.status}</p>
                    </div>
                  </div>

                  {req.status === RequestStatus.SHIPPED && (
                    <button
                      className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                      onClick={() =>
                        handleStatusUpdate(
                          req._id.toString(),
                          RequestStatus.COMPLETED
                        )
                      }
                    >
                      ✔️ Mark as Completed
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {showReceiptModal && selectedRequestId && (
        <UploadReceiptModal
          onClose={() => {
            setShowReceiptModal(false);
            setSelectedRequestId(null);
          }}
          onSuccess={async (trackingNumber, imageUrl) => {
            await handleReceiptUploaded(trackingNumber, imageUrl);
          }}
        />
      )}
    </>
  );
}
