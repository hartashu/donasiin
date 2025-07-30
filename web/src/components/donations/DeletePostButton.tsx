"use client";

import { deletePostAction } from "@/actions/action";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";

interface DeletePostButtonProps {
  slug: string;
  title: string;
}

export default function DeletePostButton({
  slug,
  title,
}: DeletePostButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [inputTitle, setInputTitle] = useState("");
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (inputTitle !== title) {
      setError("Title does not match.");
      return;
    }

    setLoading(true);
    setError("");

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
    setShowConfirm(false);
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition disabled:opacity-50"
      >
        <Trash2 size={18} />
        {loading ? "Deleting..." : "Delete Post"}
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center">
          <div className="bg-white rounded-2xl w-[90%] max-w-md p-6 shadow-2xl animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-200 text-red-700 rounded-full p-2">
                <Trash2 size={22} />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Confirm Delete
              </h2>
            </div>

            <p className="text-sm text-gray-700 mb-4 leading-relaxed">
              This action{" "}
              <span className="font-semibold text-red-700">
                cannot be undone
              </span>
              . To permanently delete this post, type the exact title:
              <span className="font-semibold text-red-600">
                {" "}
                &quot;{title}&quot;
              </span>
            </p>

            <input
              type="text"
              value={inputTitle}
              onChange={(e) => {
                setInputTitle(e.target.value);
                setError("");
              }}
              placeholder="Type post title here"
              className={`w-full px-4 py-2 rounded-md border text-sm mb-2 focus:outline-none transition-all duration-200 ${
                error
                  ? "border-red-500 focus:ring-2 focus:ring-red-400"
                  : "border-gray-300 focus:ring-2 focus:ring-gray-200"
              }`}
            />

            {error && <p className="text-sm text-red-500 mb-2">{error}</p>}

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setShowConfirm(false);
                  setInputTitle("");
                  setError("");
                }}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 rounded-md bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-700 hover:to-red-600 transition disabled:opacity-50"
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
