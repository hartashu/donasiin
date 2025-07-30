// @/components/profile/DeletePostButton.tsx

"use client";

import { deletePostAction } from "@/actions/action";
import { useState, useTransition } from "react";
import { Trash2, LoaderCircle } from "lucide-react";
import toast from "react-hot-toast";

interface DeletePostButtonProps {
    slug: string;
    isDeletable: boolean;
}

export default function DeletePostButton({
    slug,
    isDeletable,
}: DeletePostButtonProps) {
    const [isPending, startTransition] = useTransition();

    const handleDeletePost = () => {
        if (!isDeletable) {
            toast.error("Cannot delete posts with completed requests.");
            return;
        }

        if (!window.confirm("Are you sure you want to delete this post?")) return;

        startTransition(async () => {
            const result = await deletePostAction(slug);
            if (result.success) {
                toast.success("Post deleted successfully!");
            } else {
                toast.error(result.error || "Failed to delete post.");
            }
        });
    };

    const buttonTitle = isDeletable
        ? "Delete this post"
        : "This post cannot be deleted because it has a completed request.";

    return (
        <button
            onClick={handleDeletePost}
            disabled={isPending || !isDeletable}
            title={buttonTitle}
            className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
        >
            {isPending ? (
                <LoaderCircle className="w-4 h-4 animate-spin" />
            ) : (
                <Trash2 size={14} />
            )}
            {isPending ? "Deleting..." : "Delete"}
        </button>
    );
}