"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface RequestPostButtonProps {
  postId: string;
}

export default function RequestPostButton({ postId }: RequestPostButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleRequest = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to request item");
      }

      router.push("/donations"); // bisa ganti tujuan sesuai kebutuhan
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleRequest}
        disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
      >
        {loading ? "Requesting..." : "Request This Item"}
      </button>
      {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}
    </div>
  );
}
