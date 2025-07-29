"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface RequestPostButtonProps {
  postId: string;
  onSuccess?: () => void;
}

export default function RequestPostButton({
  postId,
  onSuccess,
}: RequestPostButtonProps) {
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

      // callback ke parent (DonationDetailPage)
      onSuccess?.();

      // optional: redirect atau stay
      router.refresh();
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
        className="w-full bg-[#2a9d8f] hover:bg-[#24786f] text-white font-semibold py-2 px-4 rounded shadow-sm transition duration-200 disabled:opacity-50"
      >
        {loading ? "Requesting..." : "Request This Item"}
      </button>
      {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}
    </div>
  );
}
