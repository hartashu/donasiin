"use client";

import { IPost } from "@/types/types";
import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import { toTitleCase } from "@/lib/titleCase";
import { mainAddress } from "@/lib/address";

export default function PostCards({ data }: { data: IPost[] }) {
  return (
    <section className="py-12 bg-[#f8fdfc] text-black">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#1c695f]">
            Available Items
          </h2>
          <Link
            href="/donations"
            className="text-sm font-semibold text-[#2a9d8f] hover:underline"
          >
            View All →
          </Link>
        </div>

        <p className="max-w-2xl text-base text-gray-600 mb-6">
          Discover amazing items shared by our community members.
        </p>

        <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6 scroll-smooth scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {data.slice(0, 8).map((d) => (
            <Link
              key={d.slug}
              href={`/donations/${d.category}/detail?slug=${d.slug}`}
              className="w-[200px] shrink-0 group relative rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] block"
            >
              <div className="relative h-42">
                <Image
                  src={d.thumbnailUrl || "/placeholder.jpg"}
                  alt={d.title}
                  fill
                  className="object-cover object-center"
                />
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-[#d0f2ee] text-[#1c695f] text-[10px] font-medium px-2 py-0.5 rounded-full w-fit shadow-sm">
                  <div className="w-1 h-1 rounded-full bg-[#1c695f] animate-pulse" />
                  Available
                </div>
              </div>

              <div className="p-3 flex flex-col justify-between h-[140px] space-y-1">
                <h3 className="text-sm font-semibold text-[#1f2d28] line-clamp-1 mb-1">
                  {toTitleCase(d.title)}
                </h3>

                <p className="text-xs text-gray-600 line-clamp-2 mb-1">
                  {d.description.charAt(0).toUpperCase() +
                    d.description.slice(1)}
                </p>

                {d.author?.address && (
                  <div className="flex items-center gap-1 text-[10px] text-gray-500 mb-1 mt-1">
                    <MapPin className="w-3 h-3 text-[#1c695f]" />
                    <span className="line-clamp-1">
                      {toTitleCase(mainAddress(d.author.address))}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-auto border-t pt-2 border-gray-100">
                  <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
                    {d.author?.avatarUrl ? (
                      <Image
                        src={d.author.avatarUrl}
                        alt={d.author?.fullName ?? "Author"}
                        width={24}
                        height={24}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] font-bold bg-[#1c695f] text-white rounded-full">
                        {d.author?.fullName?.charAt(0).toUpperCase() ?? "?"}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="text-xs font-medium text-gray-800 line-clamp-1">
                      {toTitleCase(d.author?.fullName ?? "Unknown")}
                    </span>
                    <span className="text-[9px] text-gray-400">
                      {d.createdAt
                        ? formatDistanceToNowStrict(new Date(d.createdAt), {
                            addSuffix: true,
                          })
                        : "Unknown"}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
