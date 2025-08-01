"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";
import RecommendationModal from "@/components/createPost/Recommendation";
import CreatePostPreview from "@/components/createPost/CreatePostPreview";
import FormSubmit from "@/components/createPost/FormSubmit";
import { motion } from "framer-motion";
import { getCategoryLabel } from "@/lib/getCategoryLabel";

interface IRecommendedUser {
  _id: string;
  fullName: string;
  username: string;
  avatarUrl?: string;
  distance: number;
}

export default function CreatePost() {
  const router = useRouter();

  const [showModal, setShowModal] = useState(false);
  // FIX: Used the specific IRecommendedUser type for state
  const [recommendedUsers, setRecommendedUsers] = useState<IRecommendedUser[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedCategoryLabel, setSelectedCategoryLabel] = useState("");

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

      setSelectedCategoryLabel(getCategoryLabel(formData.category));

      const res = await fetch("/api/posts", {
        method: "POST",
        body: form,
      });

      if (!res.ok) throw new Error("Failed to create post");

      setFormData({
        title: "",
        description: "",
        category: "",
      });

      setSelectedFiles([]);

      const { data } = await res.json();

      const recRes = await fetch(`/api/posts/${data.slug}/recommendations`);
      if (!recRes.ok) throw new Error("Failed to fetch recommendation");

      const { data: recommendations } = await recRes.json();
      console.log(recommendations);

      setRecommendedUsers(recommendations || []);
      setShowModal(true);
    } catch (err) {
      console.error("Submit failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Modal rekomendasi */}
      {showModal && (
        <RecommendationModal
          users={recommendedUsers}
          category={selectedCategoryLabel}
          noRecommendations={recommendedUsers.length === 0}
          onClose={() => {
            setShowModal(false);
            router.refresh();
          }}
        />
      )}

      <div className="relative min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
        <div className="absolute inset-0 z-0" />

        <div className="relative z-10 w-full max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Form kiri */}
            <div className="w-full md:w-2/3">
              <div className="bg-white shadow-lg rounded-xl p-6 md:p-8 border border-gray-100">
                <div className="text-center mb-6">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    Create a New Post
                  </h1>
                  <p className="text-gray-600 text-sm mt-1">
                    Share something to the community.
                  </p>
                </div>
                <FormSubmit
                  formData={formData}
                  selectedFiles={selectedFiles}
                  loading={loading}
                  onChange={handleChange}
                  onFileChange={handleFileChange}
                  onRemoveFile={handleRemoveFile}
                  onSubmit={handleSubmit}
                />
              </div>
            </div>

            {/* Garis vertikal pembatas hanya di desktop */}
            <div className="hidden md:block w-px bg-gray-200 mx-4" />

            {/* Preview kanan */}
            <div className="w-full md:w-1/3 flex justify-center md:justify-start my-auto">
              <div className="w-full  md:top-24 flex flex-col items-center">
                <div className="w-full border-b pb-4 mb-6 border-gray-200 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Eye className="w-5 h-5 text-[#2a9d8f]" strokeWidth={2} />
                    <h2 className="text-xl font-semibold text-gray-800 tracking-wide">
                      Preview
                    </h2>
                  </div>
                  <p className="text-sm text-gray-500">
                    Your post when it&apos;s done
                  </p>
                </div>

                <motion.div
                  animate={{
                    y: [0, -10, 0], // Naik turun lebih tinggi
                    scale: [1, 1.03, 1], // Zoom in-out lebih terasa
                  }}
                  transition={{
                    duration: 3.5, // Gerak sedikit lebih cepat dari sebelumnya
                    repeat: Infinity,
                    repeatType: "mirror",
                    ease: "easeInOut", // Transisi tetap lembut
                  }}
                  className="w-full shadow-lg max-w-sm md:max-w-full rounded-2xl"
                >
                  <CreatePostPreview
                    title={formData.title}
                    description={formData.description}
                    category={selectedCategoryLabel}
                    images={selectedFiles.map((file) =>
                      URL.createObjectURL(file)
                    )}
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
