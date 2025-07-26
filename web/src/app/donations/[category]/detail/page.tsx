"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function DonationDetailPage() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");

  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/posts/${slug}`);
        const json = await res.json();
        setPost(json?.data);
      } catch (err) {
        console.error("Failed to fetch post", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchSession = async () => {
      try {
        const res = await fetch("/api/auth/session");
        const json = await res.json();
        setSessionUserId(json?.user?.id || null);
      } catch (err) {
        console.error("Failed to fetch session", err);
      }
    };

    if (slug) {
      fetchPost();
      fetchSession();
    }
  }, [slug]);

  const nextImage = () => {
    if (!post?.imageUrls) return;
    setCurrentImage((prev) => (prev + 1) % post.imageUrls.length);
  };

  const prevImage = () => {
    if (!post?.imageUrls) return;
    setCurrentImage((prev) =>
      prev === 0 ? post.imageUrls.length - 1 : prev - 1
    );
  };

  const handleStartChat = async () => {
    if (!post?.author?._id) return;
    setChatLoading(true);
    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: post.author._id,
          text: "Hi, I'm interested in your donation.",
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result?.error || "Failed to start chat.");

      window.location.href = `/chat/${result.conversationId}`;
    } catch (err) {
      alert("Could not start chat.");
      console.error(err);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) return <p className="text-center py-10">Loading...</p>;
  if (!post) return <p className="text-center py-10">Post not found.</p>;

  const isOwner = post.userId === sessionUserId;

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Carousel Image */}
        <div className="relative w-full h-80 md:h-[400px] rounded-lg overflow-hidden">
          <Image
            src={post.imageUrls?.[currentImage] || "/placeholder.svg"}
            alt={`Image ${currentImage + 1}`}
            layout="fill"
            objectFit="cover"
            className="object-center"
          />
          {post.imageUrls?.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2"
              >
                ‹
              </button>
              <button
                onClick={nextImage}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2"
              >
                ›
              </button>
            </>
          )}
        </div>

        {/* Info Section */}
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold text-green-800">{post.title}</h1>
          <p className="text-gray-700 text-lg">{post.description}</p>

          {/* Author */}
          <div className="flex items-center gap-3 mt-4">
            <Image
              src={post.author?.avatarUrl || "/placeholder.svg"}
              alt={post.author?.fullName}
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
            <div>
              <p className="font-semibold">{post.author?.fullName}</p>
              <p className="text-sm text-gray-500">{post.author?.address}</p>
            </div>
          </div>

          {/* Status */}
          {post.isAvailable && (
            <div className="bg-green-100 text-green-700 px-3 py-1 rounded w-fit mt-2 font-medium">
              Available
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 space-y-3">
            {!sessionUserId ? (
              <div className="p-4 bg-yellow-50 text-yellow-700 border rounded">
                You must{" "}
                <Link href="/login" className="underline font-medium">
                  log in
                </Link>{" "}
                to contact the donor.
              </div>
            ) : isOwner ? (
              <div className="text-sm text-gray-500">
                You are the owner of this post.
              </div>
            ) : (
              <>
                {/* Request Item */}
                <button
                  onClick={() => alert("Request item feature triggered")}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
                >
                  Request This Item
                </button>

                {/* Chat Owner */}
                <button
                  onClick={handleStartChat}
                  disabled={chatLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
                >
                  {chatLoading ? "Starting Chat..." : "Chat with Owner"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
