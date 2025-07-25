"use client";

import { IPost } from "@/types/types";
import { Minimize2 } from "lucide-react";
import Link from "next/link";

export default function PostCards({ data }: { data: IPost[] }) {
  return (
    <section className="py-24 md:py-32 bg-[#f8fdfc] text-black">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#1e3932]">
            Available Items
          </h2>
          <Link
            href="/posts"
            className="text-sm font-semibold text-[#2a9d8f] hover:underline"
          >
            View All →
          </Link>
        </div>

        <p className="max-w-2xl text-lg text-gray-600 mb-12">
          Discover amazing items shared by our community members.
        </p>

        {/* Scrollable Card List */}
        <div className="flex gap-6 overflow-x-auto -mx-6 px-6 pb-2 scroll-smooth scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 transition-all">
          {data
            .filter((d) => d.isAvailable)
            .slice(0, 5)
            .map((d, i) => (
              <div
                key={i}
                className="w-[280px] shrink-0 group relative rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
              >
                {/* Image Section */}
                <div className="relative h-44">
                  <img
                    src={d.thumbnailUrl}
                    alt={d.title}
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center transition duration-300">
                    <div className="opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all duration-300 backdrop-blur-sm bg-white/70 px-4 py-2 rounded-full flex items-center gap-2 shadow-md border border-white/40">
                      <Minimize2 className="w-3" />
                      <span className="text-sm font-medium text-black">
                        View Details
                      </span>
                    </div>
                  </div>
                  <span className="absolute top-2 right-2 bg-[#2a9d8f] text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                    Available
                  </span>
                </div>

                {/* Content Section */}
                <div className="p-4 flex flex-col justify-between h-[180px]">
                  <h3 className="text-lg font-bold text-[#1f2d28] mb-1 line-clamp-1">
                    {d.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2 text-justify">
                    {d.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {d.tags?.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="bg-[#defaf2] text-[#13796f] text-xs font-medium px-2 py-1 rounded-full"
                      >
                        {tag[0].toUpperCase() + tag.slice(1)}
                      </span>
                    ))}
                  </div>

                  {/* Footer Info */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-auto pt-2 border-t border-gray-100">
                    <div className="w-6 h-6 rounded-full bg-[#13796f] text-white flex items-center justify-center text-[10px] font-bold">
                      U
                    </div>
                    <span>about 2 hours ago</span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}
