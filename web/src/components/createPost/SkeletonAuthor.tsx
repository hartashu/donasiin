"use client";

import { Clock } from "lucide-react";

export default function SkeletonAuthor() {
  return (
    <div className="flex items-center gap-2 mt-auto pt-2 border-t border-gray-100 animate-pulse">
      {/* Avatar placeholder */}
      <div className="w-7 h-7 rounded-full bg-gray-300" />

      {/* Text placeholder */}
      <div className="flex flex-col justify-center">
        <div className="h-3 w-24 bg-gray-300 rounded mb-1" />
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-gray-400" />
          <div className="h-2 w-10 bg-gray-300 rounded" />
        </div>
      </div>
    </div>
  );
}
