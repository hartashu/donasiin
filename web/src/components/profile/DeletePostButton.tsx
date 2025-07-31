"use client";

import { deletePostAction } from "@/actions/action";
import { useState, useTransition } from "react";
import { Trash2, LoaderCircle } from "lucide-react";
import toast from "react-hot-toast";

interface DeletePostButtonProps {
    slug: string;
    isDeletable: boolean;
    title: string;
}

export default function DeletePostButton({
    slug,
    isDeletable,
    title,
}: DeletePostButtonProps) {
    const [isPending, startTransition] = useTransition();
    const [showConfirm, setShowConfirm] = useState(false);
    const [inputTitle, setInputTitle] = useState("");
    const [error, setError] = useState("");

    const handleDelete = () => {
        if (inputTitle !== title) {
            setError("Title does not match.");
            return;
        }

        startTransition(async () => {
            toast.loading("Deleting post...");
            const result = await deletePostAction(slug);
            toast.dismiss();

            if (result.success) {
                toast.success("Post deleted successfully!");
            } else {
                toast.error(result.error || "Failed to delete post.");
            }
            setShowConfirm(false);
        });
    };

    const openModal = () => {
        if (!isDeletable) {
            toast.error("Cannot delete posts with completed requests.");
            return;
        }
        setShowConfirm(true);
    };

    return (
        <>
            <button
                onClick={openModal}
                disabled={isPending || !isDeletable}
                title={isDeletable ? "Delete this post" : "This post cannot be deleted"}
                className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
                {isPending ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Trash2 size={14} />}
                {isPending ? "Deleting..." : "Delete"}
            </button>

            {showConfirm && (
                // FIX: Latar belakang popup sekarang menggunakan backdrop-blur-sm
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fade-in">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-red-100 text-red-600 rounded-full p-2"><Trash2 size={22} /></div>
                            <h2 className="text-lg font-semibold text-gray-900">Confirm Deletion</h2>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            This action cannot be undone. To delete, type the exact title: <span className="font-semibold text-red-600">&quot;{title}&quot;</span>
                        </p>
                        <input
                            type="text"
                            value={inputTitle}
                            onChange={(e) => { setInputTitle(e.target.value); setError(""); }}
                            placeholder="Type post title here"
                            className={`w-full px-3 py-2 rounded-md border text-sm mb-2 focus:outline-none transition ${error ? "border-red-500 ring-2 ring-red-200" : "border-gray-300 focus:ring-2 focus:ring-gray-200"}`}
                        />
                        {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
                        <div className="flex justify-end gap-3 mt-4">
                            <button onClick={() => { setShowConfirm(false); setInputTitle(""); setError(""); }} className="px-4 py-2 rounded-md border text-sm font-medium text-gray-700 hover:bg-gray-50 transition">Cancel</button>
                            <button onClick={handleDelete} disabled={isPending} className="px-4 py-2 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition disabled:opacity-50">
                                {isPending ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}