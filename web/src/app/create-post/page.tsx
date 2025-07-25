"use client";

import { useState } from "react";

type FormData = {
  title: string;
  thumbnailUrl: string;
  description: string;
  category: string;
  isAvailable: boolean;
};

export default function CreatePost() {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    thumbnailUrl: "",
    description: "",
    category: "",
    isAvailable: true, // Hardcoded true
  });

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const uploadForm = new FormData();
    for (let i = 0; i < files.length; i++) {
      uploadForm.append("itemImages", files[i]);
    }

    setUploading(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadForm,
      });

      const result = await res.json();
      if (result?.data?.itemUrls?.length) {
        setImageUrls(result.data.itemUrls);
      }
    } catch (err) {
      console.error("Image upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      imageUrls,
      isAvailable: true, // pastikan tetap true
    };

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      console.log("Post success:", result);
    } catch (err) {
      console.error("Submit failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-10 px-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create Post</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input
            required
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="border border-gray-300 w-full px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Thumbnail URL</label>
          <input
            required
            name="thumbnailUrl"
            value={formData.thumbnailUrl}
            onChange={handleChange}
            className="border border-gray-300 w-full px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            required
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="border border-gray-300 w-full px-3 py-2 rounded h-24 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Category</label>
          <input
            required
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="border border-gray-300 w-full px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Upload Images</label>
          <input
            type="file"
            multiple
            onChange={handleImageUpload}
            className="mt-1"
          />
          {uploading && <p className="text-sm text-gray-500">Uploading...</p>}

          {imageUrls.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {imageUrls.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt="preview"
                  className="w-24 h-24 object-cover rounded border"
                />
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 px-6 py-2 bg-black text-white rounded hover:bg-gray-800"
        >
          {loading ? "Submitting..." : "Create"}
        </button>
      </form>
    </div>
  );
}
