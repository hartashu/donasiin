"use client";

import { useState } from "react";
import Image from "next/image";

interface ImageGalleryProps {
  imageUrls: string[];
}

export default function ImageGallery({ imageUrls }: ImageGalleryProps) {
  const [currentImage, setCurrentImage] = useState(0);

  if (!imageUrls || imageUrls.length === 0) {
    return (
      <div className="w-full h-80 md:h-[400px] bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
        No Image
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Main Image */}
      <div className="relative w-full h-80 md:h-[400px] rounded-lg overflow-hidden">
        <Image
          src={imageUrls[currentImage]}
          alt={`Image ${currentImage + 1}`}
          fill
          className="object-cover object-center transition duration-300"
        />
      </div>

      {/* Thumbnail Scrollable */}
      {imageUrls.length > 1 && (
        <div className="mt-4">
          <div
            className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory px-1 py-2
               [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent 
               [&::-webkit-scrollbar-thumb]:bg-[#cbd5e1] [&::-webkit-scrollbar-thumb]:rounded-full"
          >
            {imageUrls.map((url, index) => (
              <button
                key={index}
                onClick={() => setCurrentImage(index)}
                className={`relative w-16 h-16 min-w-[64px] rounded-lg flex-shrink-0 border-2 snap-start transition-all duration-200
          ${
            currentImage === index
              ? "border-[#2a9d8f] ring-2 ring-[#2a9d8f]/50"
              : "border-transparent"
          } 
          hover:opacity-90`}
              >
                <Image
                  src={url}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover rounded-md"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
