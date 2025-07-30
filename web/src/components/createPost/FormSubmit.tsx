"use client";

import { categoryOptions } from "@/lib/getCategoryLabel";
import { FileUp, LoaderCircle, Tag, Text, Type, X } from "lucide-react";
import Image from "next/image";

interface Props {
  formData: {
    title: string;
    description: string;
    category: string;
  };
  selectedFiles: File[];
  loading: boolean;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (index: number) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function FormSubmit({
  formData,
  selectedFiles,
  loading,
  onChange,
  onFileChange,
  onRemoveFile,
  onSubmit,
}: Props) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-semibold text-gray-700 mb-1"
        >
          Title
        </label>
        <div className="relative">
          <Type className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            id="title"
            name="title"
            required
            value={formData.title}
            onChange={onChange}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#2a9d8f] focus:outline-none text-gray-800"
            placeholder="e.g., Rak buku bekas"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-semibold text-gray-700 mb-1"
        >
          Description
        </label>
        <div className="relative">
          <Text className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
          <textarea
            id="description"
            name="description"
            required
            value={formData.description}
            onChange={onChange}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#2a9d8f] focus:outline-none text-gray-800 h-28 resize-none"
            placeholder="Tulis deskripsi barang secara singkat..."
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label
          htmlFor="category"
          className="block text-sm font-semibold text-gray-700 mb-1"
        >
          Category
        </label>
        <div className="relative">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            id="category"
            name="category"
            required
            value={formData.category}
            onChange={onChange}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#2a9d8f] focus:outline-none text-gray-800"
          >
            <option value="">-- Pilih kategori --</option>
            {categoryOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Upload Images */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Upload Images
        </label>
        <div className="relative border-2 border-dashed border-gray-300 p-6 rounded-lg text-center hover:border-[#2a9d8f] transition-all duration-300 ease-in-out cursor-pointer bg-gray-50 hover:bg-gray-100">
          <FileUp className="mx-auto w-8 h-8 text-gray-500" />
          <p className="text-sm text-gray-500 mt-2">
            Drag & drop atau klik untuk memilih gambar
          </p>
          <input
            type="file"
            multiple
            onChange={onFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>
      </div>

      {/* File Preview */}
      {selectedFiles.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          {selectedFiles.map((file, idx) => (
            <div key={idx} className="relative group">
              <Image
                src={URL.createObjectURL(file)}
                alt="preview"
                width={96}
                height={96}
                className="w-24 h-24 object-cover rounded-md border shadow-sm"
              />
              <button
                type="button"
                onClick={() => onRemoveFile(idx)}
                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700 transition"
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
        className="w-full bg-[#2a9d8f] text-white py-2.5 rounded-lg font-semibold hover:bg-[#21877e] transition flex items-center justify-center gap-2 disabled:opacity-50"
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
  );
}
