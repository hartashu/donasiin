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
    isAvailable: true,
  });

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      uploadForm.append("itemImages", files[i]); // Sesuai API kamu
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

    const payload = {
      ...formData,
      imageUrls,
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
    }
  };

  return (
    <div className="min-h-screen bg-white p-4">
      <h1>Create Post</h1>

      <form onSubmit={handleSubmit}>
        <label>Title</label>
        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="border block"
        />

        <label>Thumbnail URL</label>
        <input
          name="thumbnailUrl"
          value={formData.thumbnailUrl}
          onChange={handleChange}
          className="border block"
        />

        <label>Description</label>
        <input
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="border block"
        />

        <label>Category</label>
        <input
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="border block"
        />

        <label>Upload Images</label>
        <input
          type="file"
          multiple
          onChange={handleImageUpload}
          className="border block"
        />
        {uploading && <p>Uploading...</p>}

        <div className="flex gap-2 mt-2">
          {imageUrls.map((url, idx) => (
            <img
              key={idx}
              src={url}
              alt="preview"
              className="w-24 h-24 object-cover rounded"
            />
          ))}
        </div>

        <button type="submit" className="mt-4 px-4 py-2 bg-black text-white">
          Create
        </button>
      </form>
    </div>
  );
}
