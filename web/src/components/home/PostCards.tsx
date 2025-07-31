"use client";

import { IPost } from "@/types/types";
import Link from "next/link";
import Image from "next/image";
import { MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import { toTitleCase } from "@/lib/titleCase";
import { mainAddress } from "@/lib/address";
import { motion } from "framer-motion";
import { useRef } from "react";

export default function PostCards({ data }: { data: IPost[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const amount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -amount : amount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-12 bg-gray-50 text-black relative">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.6 }}
        >
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#1c695f]">
            Available Items
          </h2>
          <Link
            href="/donations"
            className="group inline-flex items-center text-sm font-semibold text-[#2a9d8f] transition-all duration-200 hover:text-[#21867d]"
          >
            <span className="relative after:block after:absolute after:left-0 after:bottom-[-2px] after:w-0 after:h-[1.5px] after:bg-[#2a9d8f] group-hover:after:w-full after:transition-all after:duration-300">
              View All
            </span>
            <svg
              className="ml-1 w-3 h-3 transition-transform duration-300 transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </motion.div>

        <motion.p
          className="max-w-2xl text-base text-gray-600 mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          viewport={{ once: true, amount: 0.6 }}
        >
          Discover amazing items shared by our community members.
        </motion.p>

        {/* Scroll Buttons */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-2 rounded-full bg-white shadow hover:bg-gray-100"
        >
          <ChevronLeft className="w-5 h-5 text-[#1c695f]" />
        </button>
        <button
          onClick={() => scroll("right")}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-2 rounded-full bg-white shadow hover:bg-gray-100"
        >
          <ChevronRight className="w-5 h-5 text-[#1c695f]" />
        </button>

        {/* Scrollable Card List */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto overflow-y-hidden scroll-smooth snap-x snap-mandatory
          pl-1 pr-1
          [-ms-overflow-style:'none'] [scrollbar-width:'none']
          [&::-webkit-scrollbar]:hidden"
        >
          {data.slice(0, 8).map((d) => (
            <motion.div
              key={d.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-[240px] shrink-0 snap-start mb-2 "
            >
              <Link
                scroll={true}
                href={`/donations/${d.category}/detail?slug=${d.slug}`}
                className="group relative rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] block"
              >
                {/* Image */}
                <div className="relative h-44">
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

                {/* Content */}
                <div className="p-4 flex flex-col justify-between h-[160px] space-y-1">
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

                  {/* Author Info */}
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
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
