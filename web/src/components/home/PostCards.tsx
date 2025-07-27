"use client";

import { IPost } from "@/types/types";
import { Minimize2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNowStrict } from "date-fns";

export default function PostCards({ data }: { data: IPost[] }) {
  return (
    <section className="py-24 md:py-32 bg-[#f8fdfc] text-black">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#1e3932]">
            Available Items
          </h2>
          <Link
            href="/donations"
            className="text-sm font-semibold text-[#2a9d8f] hover:underline"
          >
            View All →
          </Link>
        </div>

        <p className="max-w-2xl text-lg text-gray-600 mb-12">
          Discover amazing items shared by our community members.
        </p>

        <div className="flex gap-6 overflow-x-auto -mx-6 px-6 pb-2 scroll-smooth scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {data
            .filter((d) => d.isAvailable)
            .slice(0, 5)
            .map((d, idx) => (
              <div
                key={idx}
                className="w-[280px] shrink-0 group relative rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="relative h-44">
                  <Image
                    src={d.thumbnailUrl}
                    alt={d.title}
                    fill
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center transition duration-300">
                    <div className="opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all duration-300">
                      <Link
                        href={`/donations/${d.category}/detail?slug=${d.slug}`}
                        className="backdrop-blur-sm bg-white/70 px-4 py-2 rounded-full flex items-center gap-2 shadow-md border border-white/40 text-sm font-medium text-black"
                      >
                        <Minimize2 className="w-3" />
                        View Details
                      </Link>
                    </div>
                  </div>
                  <span className="absolute top-2 right-2 bg-[#2a9d8f] text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                    Available
                  </span>
                </div>

                <div className="p-4 flex flex-col justify-between h-[180px]">
                  <div>
                    <h3 className="text-lg font-bold text-[#1f2d28] mb-1 line-clamp-1">
                      {d.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2 text-justify">
                      {d.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-auto pt-2 border-t border-gray-100">
                    <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
                      {d.author?.avatarUrl ? (
                        <Image
                          src={d.author.avatarUrl}
                          alt={d.author?.fullName ?? "User Avatar"}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-[#13796f] text-white flex items-center justify-center text-[10px] font-bold">
                          {d.author?.fullName?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="truncate">{d.author?.fullName}</span>
                    <span className="text-gray-400">•</span>
                    <span className="whitespace-nowrap">
                      {d.createdAt
                        ? formatDistanceToNowStrict(new Date(d.createdAt), {
                            addSuffix: true,
                          })
                        : ""}
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}
