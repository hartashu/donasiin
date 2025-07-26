"use client";

import { createPostAction, uploadImageAction } from "@/actions/action";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreatePost() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    thumbnailUrl: "",
    description: "",
    category: "",
    isAvailable: true,
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setSelectedFiles(Array.from(files));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const uploadForm = new FormData();
      selectedFiles.forEach((file) => uploadForm.append("itemImages", file));

      const imageUrls = await uploadImageAction(uploadForm);

      await createPostAction({
        ...formData,
        imageUrls,
        isAvailable: true,
      });

      setFormData({
        title: "",
        thumbnailUrl: "",
        description: "",
        category: "",
        isAvailable: true,
      });
      setSelectedFiles([]);

      router.push("/donations");
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
          <select
            required
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="border border-gray-300 w-full px-3 py-2 rounded bg-white"
          >
            <option value="" disabled>
              -- Select a Category --
            </option>
            <option value="elektronik">Elektronik</option>
            <option value="fashion">Fashion & Pakaian</option>
            <option value="rumah-dapur">Rumah & Dapur</option>
            <option value="kesehatan-kecantikan">Kesehatan & Kecantikan</option>
            <option value="olahraga-luar">Olahraga & Luar Ruangan</option>
            <option value="bayi-anak">Bayi & Anak</option>
            <option value="otomotif-peralatan">Otomotif & Peralatan</option>
            <option value="buku-musik-media">Buku, Musik & Media</option>
            <option value="hewan">Perlengkapan Hewan Peliharaan</option>
            <option value="kantor-alat-tulis">
              Perlengkapan Kantor & Alat Tulis
            </option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Upload Images</label>
          <input type="file" multiple onChange={handleFileChange} />
          {selectedFiles.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {selectedFiles.map((file, idx) => (
                <img
                  key={idx}
                  src={URL.createObjectURL(file)}
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
