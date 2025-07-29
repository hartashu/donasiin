"use client";

import { deletePostAction } from "@/actions/action";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";

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
      className="w-full flex items-center justify-center gap-2 bg-[#f9423a] hover:bg-[#d32f2f] text-white font-medium py-2 px-4 rounded transition duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
    >
      <Trash2 size={18} />
      {loading ? "Deleting..." : "Delete Post"}
    </button>
  );
}
