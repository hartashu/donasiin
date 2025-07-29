"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { IPost } from "@/types/types";
import DeletePostButton from "@/components/donations/DeletePostButton";
import RequestPostButton from "@/components/donations/RequestPostButton";
import { Calendar, Tag, Leaf, CheckCircle, BookImage } from "lucide-react";
import ImageGallery from "@/components/donations/ImageGallery";
import { toTitleCase } from "@/lib/titleCase";
import DonationDetailSkeleton from "@/components/donations/DonationDetailSkeleton";

export default function DonationDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");

  const [post, setPost] = useState<IPost>();
  const [loading, setLoading] = useState(true);
  const [sessionUserId, setSessionUserId] = useState<string>("");
  const [chatLoading, setChatLoading] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/posts/${slug}`);
        const json = await res.json();
        setPost(json?.data || null);
        setHasRequested(json?.data?.hasRequested || false);
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
        setSessionUserId(json?.user?.id || "");
      } catch (err) {
        console.error("Failed to fetch session", err);
      }
    };

    if (slug) {
      fetchPost();
      fetchSession();
    }
  }, [slug]);

  const handleStartChat = async (title: string) => {
    if (!post?.author?._id) return;
    setChatLoading(true);
    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: post.author._id,
          text: `Hi, I'm interested in your item: "${title}"`,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result?.error || "Failed to start chat.");

      router.push(`/chat/${result.conversationId}`);
    } catch (err) {
      console.error("Could not start chat.", err);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) return <DonationDetailSkeleton />;
  if (!post) return <p className="text-center py-10">Post not found.</p>;

  const isOwner = post.userId.toString() === sessionUserId;

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="grid md:grid-cols-2 gap-8">
        <ImageGallery imageUrls={post.imageUrls || []} />

        {/* Info Section */}
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold text-[#1c695f]">{post.title}</h1>
          <p className="text-[#0e3430] text-lg">{post.description}</p>

          <div className="space-y-2 text-sm text-gray-700 mt-2">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#1c695f]" />
              <span>
                <span className="font-semibold text-[#1c695f]">Category:</span>{" "}
                {toTitleCase(post.category)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#1c695f]" />
              <span>
                <span className="font-semibold text-[#1c695f]">Posted On:</span>{" "}
                {new Date(post.createdAt ?? new Date()).toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Leaf className="w-4 h-4 text-[#1c695f]" />
              <span>
                <span className="font-semibold text-[#1c695f]">
                  Carbon Saved:
                </span>{" "}
                {post.carbonKg} kg CO₂
              </span>
            </div>

            <div className="flex items-center gap-2">
              <BookImage className="w-4 h-4 text-[#1c695f] mt-0.5" />
              <span>
                <span className="font-semibold text-[#1c695f]">Images:</span>{" "}
                {post.imageUrls.length} photos
              </span>
            </div>
          </div>

          {/* Author */}
          <div className="flex items-center gap-3 mt-4">
            <Image
              src={post.author?.avatarUrl || "/placeholder.svg"}
              alt={post.author?.fullName || "User"}
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
            <div>
              <p className="font-semibold">
                {toTitleCase(post.author?.fullName || "")}
              </p>
              <p className="text-sm text-gray-500">
                {toTitleCase(post.author?.address || "")}
              </p>
            </div>
          </div>

          {/* Status */}
          {post.isAvailable && (
            <div className="flex items-center gap-2 bg-[#d0f2ee] text-[#1c695f] px-3 py-1 rounded-full w-fit mt-2 font-medium shadow-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-[#1c695f] animate-pulse" />
              Available
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-2 space-y-3">
            {!sessionUserId ? (
              <div className="p-4 bg-yellow-50 text-yellow-700 border rounded">
                You must{" "}
                <Link href="/login" className="underline font-medium">
                  log in
                </Link>{" "}
                to request or contact the donator.
              </div>
            ) : isOwner ? (
              <>
                <div className="text-sm text-gray-500">
                  You are the owner of this post.
                </div>
                <DeletePostButton slug={slug!} />
              </>
            ) : (
              <>
                {hasRequested ? (
                  <div className="flex items-center justify-center gap-2 px-4 py-3 border border-[#2a9d8f] bg-[#e6f7f6] text-[#1c695f] rounded-md font-medium shadow-sm">
                    <CheckCircle className="w-5 h-5 text-[#2a9d8f]" />
                    <span>You have already requested this item.</span>
                  </div>
                ) : (
                  <RequestPostButton
                    postId={post._id.toString()}
                    onSuccess={() => setHasRequested(true)}
                  />
                )}

                <button
                  onClick={() => handleStartChat(post.title)}
                  disabled={chatLoading}
                  className="w-full border border-[#2a9d8f] text-[#2a9d8f] hover:bg-[#f1f8f8] font-semibold py-2 rounded transition-colors duration-200 disabled:opacity-50"
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
