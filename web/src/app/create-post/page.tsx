"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileUp, LoaderCircle, Tag, Text, Type, X } from "lucide-react";
import RecommendationModal from "@/components/createPost/Recommendation";

export default function CreatePost() {
  const router = useRouter();

  const [showModal, setShowModal] = useState(false);
  const [recommendedUsers, setRecommendedUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setSelectedFiles((prev) => [...prev, ...Array.from(files)]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const form = new FormData();
      form.append("title", formData.title);
      form.append("description", formData.description);
      form.append("category", formData.category);
      selectedFiles.forEach((file) => form.append("itemImages", file));

      const res = await fetch("/api/posts", {
        method: "POST",
        body: form,
      });

      if (!res.ok) throw new Error("Failed to create post");
      const { data } = await res.json();

      const recRes = await fetch(`/api/posts/${data.slug}/recommendations`);
      if (!recRes.ok) throw new Error("Failed to fetch recommendation");

      const { data: recommendations } = await recRes.json();

      if (recommendations && recommendations.length > 0) {
        setRecommendedUsers(recommendations);
        setShowModal(true);
      } else {
        alert("Tidak ada user yang direkomendasikan.");
        router.push("/donations");
      }
    } catch (err) {
      console.error("Submit failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Modal di luar form */}
      {showModal && (
        <RecommendationModal
          users={recommendedUsers}
          onClose={() => {
            setShowModal(false);
            router.push("/donations");
          }}
        />
      )}

      <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
        <div className="absolute inset-0 z-0" />

        <div className="relative z-10 w-full max-w-2xl animate-subtle-float">
          <div className="bg-white/60 backdrop-blur-lg p-6 sm:p-8 rounded-2xl shadow-2xl border border-white/20">
            <div className="text-center mb-6">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Create a New Post
              </h1>
              <p className="text-gray-700 text-sm sm:text-md mt-2">
                Share something to the community.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <label
                  htmlFor="title"
                  className="font-medium text-sm text-gray-600"
                >
                  Title
                </label>
                <div className="relative">
                  <Type className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <input
                    id="title"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Slightly Used Study Table"
                    className="w-full pl-10 pr-4 py-2 bg-white/40 border border-gray-300/50 rounded-md text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#2a9d8f] focus:border-[#2a9d8f] outline-none transition"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label
                  htmlFor="description"
                  className="font-medium text-sm text-gray-600"
                >
                  Description
                </label>
                <div className="relative">
                  <Text className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                  <textarea
                    id="description"
                    name="description"
                    required
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Provide details about the item..."
                    className="w-full pl-10 pr-4 py-2 bg-white/40 border border-gray-300/50 rounded-md text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#2a9d8f] focus:border-[#2a9d8f] outline-none transition h-28 resize-none"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label
                  htmlFor="category"
                  className="font-medium text-sm text-gray-600"
                >
                  Category
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <select
                    id="category"
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 appearance-none bg-white/40 border border-gray-300/50 rounded-md text-gray-900 focus:ring-2 focus:ring-[#2a9d8f] focus:border-[#2a9d8f] outline-none transition"
                  >
                    <option value="" disabled>
                      -- Select a Category --
                    </option>
                    <option value="elektronik">Elektronik</option>
                    <option value="fashion">Fashion & Pakaian</option>
                    <option value="rumah-dapur">Rumah & Dapur</option>
                    <option value="kesehatan-kecantikan">
                      Kesehatan & Kecantikan
                    </option>
                    <option value="olahraga-luar">
                      Olahraga & Luar Ruangan
                    </option>
                    <option value="bayi-anak">Bayi & Anak</option>
                    <option value="otomotif-peralatan">
                      Otomotif & Peralatan
                    </option>
                    <option value="buku-musik-media">
                      Buku, Musik & Media
                    </option>
                    <option value="hewan">Perlengkapan Hewan Peliharaan</option>
                    <option value="kantor-alat-tulis">
                      Perlengkapan Kantor & Alat Tulis
                    </option>
                  </select>
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <label className="font-medium text-sm text-gray-600">
                  Upload Images
                </label>
                <div className="relative border-2 border-dashed border-gray-400/50 rounded-lg p-6 text-center hover:border-[#2a9d8f] transition cursor-pointer">
                  <FileUp className="mx-auto h-12 w-12 text-gray-500" />
                  <p className="mt-2 text-sm text-gray-600">
                    Drag & drop files here, or click to browse
                  </p>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* Preview Images */}
              {selectedFiles.length > 0 && (
                <div className="flex gap-3 mt-2 mb-3 flex-wrap">
                  {selectedFiles.map((file, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt="preview"
                        className="w-24 h-24 object-cover rounded-md border-2 border-white/50 shadow-md"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(idx)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-0.5 w-6 h-6 flex items-center justify-center hover:bg-red-700 transition-transform transform hover:scale-110 focus:outline-none"
                        aria-label="Hapus gambar"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2a9d8f] text-white font-semibold py-2.5 rounded-md hover:bg-[#268a7e] transition duration-300 disabled:bg-[#2a9d8f]/50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <LoaderCircle className="animate-spin h-5 w-5" />
                    Submitting...
                  </>
                ) : (
                  "Create Post"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
