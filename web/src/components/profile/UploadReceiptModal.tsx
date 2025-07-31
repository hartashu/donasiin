'use client';

import { useState } from "react";
import Image from "next/image";

export default function UploadReceiptModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (trackingNumber: string, receiptUrl: string) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState<string | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("receiptImage", file);
    try {
      setUploading(true);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setReceiptUrl(data.data.receiptUrl);
      setTrackingNumber(data.data.trackingNumber);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-md space-y-4 shadow-lg">
        <h2 className="text-lg font-semibold">Upload Receipt</h2>
        {trackingNumber && receiptUrl ? (
          <>
            <div className="relative w-full h-48">
              <Image
                src={receiptUrl}
                alt="Uploaded Receipt"
                layout="fill"
                className="rounded-lg border object-contain"
              />
            </div>
            <p className="text-green-600 font-semibold">
              Tracking Number: {trackingNumber}
            </p>
            <button
              className="bg-green-600 text-white w-full py-2 rounded hover:bg-green-700"
              onClick={() => onSuccess(trackingNumber, receiptUrl)}
            >
              ✅ Confirm & Mark as Shipped
            </button>
          </>
        ) : (
          <>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-light file:text-brand-dark hover:file:bg-green-200"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex justify-end gap-2 pt-4">
              <button onClick={onClose} className="text-gray-600 px-4 py-2 rounded hover:bg-gray-100">
                Cancel
              </button>
              <button onClick={handleUpload} disabled={!file || uploading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}