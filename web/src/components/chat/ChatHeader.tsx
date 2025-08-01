"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Home } from "lucide-react";

export default function ChatHeader() {
  const router = useRouter();

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-gray-100 transition"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-lg font-semibold text-gray-800">Chats</h1>
      </div>

      <button
        onClick={() => router.push("/")}
        className="p-2 rounded-full hover:bg-gray-100 transition"
        aria-label="Home"
      >
        <Home className="w-5 h-5 text-gray-700" />
      </button>
    </header>
  );
}
