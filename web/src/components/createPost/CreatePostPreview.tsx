"use client";

import { Clock, MapPin, Tags } from "lucide-react";
import Image from "next/image";
import { getMyProfileData } from "@/actions/action";
import { useEffect, useState } from "react";
import { toTitleCase } from "@/lib/titleCase";
import SkeletonAuthor from "./SkeletonAuthor";

interface Props {
  title: string;
  description: string;
  category: string;
  images?: string[];
}

export default function CreatePostPreview({
  title,
  description,
  category,
  images,
}: Props) {
  const [authorName, setAuthorName] = useState("Loading...");
  const [avatarUrl, setAvatarUrl] = useState("/default-avatar.png");
  const [address, setAddress] = useState("Loading...");

  useEffect(() => {
    getMyProfileData().then((res) => {
      setAuthorName(res.profile.fullName || res.profile.email || "Anonymous");
      setAvatarUrl(res.profile.avatarUrl || "/default-avatar.png");
      setAddress(res.profile.address || "Unknown location");
    });
  }, []);

  const image = images?.[0];

  return (
    <div className="rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] block w-full max-w-sm border border-teal-600/30 hover:border-teal-600/40 break-words">
      {/* Gambar */}
      <div className="relative h-60">
        {image ? (
          <Image
            src={image}
            alt="Preview"
            fill
            className="object-cover object-center rounded-t-2xl"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-sm max-w-sm">
            No image selected
          </div>
        )}
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-[#d0f2ee] text-[#1c695f] text-[11px] font-medium px-3 py-1 rounded-full w-fit shadow-sm">
          <div className="w-2 h-2 rounded-full bg-[#1c695f] animate-pulse" />
          Available
        </div>
      </div>

      {/* Konten */}
      <div className="p-4 flex flex-col justify-between h-[180px] space-y-1 max-w-xs">
        <h3 className="text-base font-semibold text-[#1f2d28] line-clamp-1 break-words">
          {toTitleCase(title) || "Your title will appear here"}
        </h3>

        <p className="text-sm text-gray-600 line-clamp-1 mb-2 break-words">
          {description.charAt(0).toUpperCase() + description.slice(1) ||
            "Description will be shown here."}
        </p>

        {/* Category */}
        <div className="flex items-center gap-2 text-xs text-[#1c695f] font-medium mb-1">
          <Tags className="w-4 h-4" />
          <span>{toTitleCase(category) || "No category selected"}</span>
        </div>

        {/* Address */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 mb-2">
          <MapPin className="w-4 h-4" />
          <span>{toTitleCase(address)}</span>
        </div>

        {/* Author */}
        {authorName === "Loading..." ? (
          <SkeletonAuthor />
        ) : (
          <div className="flex items-center gap-2 mt-auto pt-2 border-t border-gray-100">
            <div className="w-7 h-7 rounded-full bg-gray-200 overflow-hidden">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={authorName || "Author"}
                  width={28}
                  height={28}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] font-bold bg-[#1c695f] text-white rounded-full">
                  {authorName?.charAt(0).toUpperCase() ?? "?"}
                </div>
              )}
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-sm text-gray-800">
                {toTitleCase(authorName || "Unknown")}
              </span>
              <span className="text-[9px] text-gray-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Just now
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
