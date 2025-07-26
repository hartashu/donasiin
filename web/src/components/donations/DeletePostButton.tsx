"use client";

import { deletePostAction } from "@/actions/action";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface DeletePostButtonProps {
  slug: string;
}

export default function DeletePostButton({ slug }: DeletePostButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDeletePost = async () => {
    const confirmDelete = confirm("Are you sure you want to delete this post?");
    if (!confirmDelete) return;

    setLoading(true);
    const result = await deletePostAction(slug);

    if (result.success) {
      router.push("/donations");
      router.refresh();
    } else {
      router.push(
        `/donations?error=${encodeURIComponent(
          result.error ?? "Delete failed"
        )}`
      );
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleDeletePost}
      disabled={loading}
      className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded"
    >
      {loading ? "Deleting..." : "Delete Post"}
    </button>
  );
}
