"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image"; // FIX: Import Next/Image
import { MapPin, Tags } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import InfiniteScroll from "react-infinite-scroll-component";
import { getCategoryLabel } from "@/lib/getCategoryLabel";
import { getPosts } from "@/actions/action";
import { toTitleCase } from "@/lib/titleCase";
import { IPost } from "@/types/types";
import DonationCardSkeleton from "./DonationCardSkeleton";
import { LoadingDots } from "../Loading";
import { mainAddress } from "@/lib/address";

export default function DonationCards({ category }: { category?: string }) {
  const [data, setData] = useState<IPost[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  const searchParams = useSearchParams();
  const search = useMemo(
    () => searchParams.get("search") || "",
    [searchParams]
  );

  useEffect(() => {
    setPage(1);
    setData([]);
    setTotalPages(1);
    setLoading(true);
    setIsSearching(!!search);
  }, [category, search]);

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const res = await getPosts(category, search, 1, 12);
        setData(res.posts);
        setTotalPages(res.totalPages);
      } catch {
        setData([]);
      } finally {
        setLoading(false);
        setIsSearching(false);
      }
    };
    fetchInitial();
  }, [category, search]);

  const fetchMoreData = async () => {
    const nextPage = page + 1;
    const res = await getPosts(category, search, nextPage, 12);
    setData((prev) => [...prev, ...res.posts]);
    setPage(nextPage);
    setTotalPages(res.totalPages);
  };

  const hasMore = page < totalPages;

  return (
    <section className="bg-[#f8fdfc] text-black min-h-screen">
      <div className="container mx-auto px-6 py-6">
        {isSearching && loading ? (
          <LoadingDots />
        ) : !isSearching && loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <DonationCardSkeleton key={i} />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <div>
              <Image
                src={"/LogoDonasiinnobg.png"}
                alt="logoDonasiin"
                width={180}
                height={180}
                className="object-cover"
              />
            </div>
            {/* Teks utama */}
            <h2 className="text-2xl sm:text-xl font-bold text-gray-800">
              DONATION NOT FOUND
            </h2>

            {/* Subteks */}
            <p className="text-sm sm:text-base text-gray-500 text-center max-w-md">
              We couldn&apos;t find any matching donations at the moment. Try
              adjusting your search or filter.
            </p>
          </div>
        ) : (
          <InfiniteScroll
            dataLength={data.length}
            next={fetchMoreData}
            hasMore={hasMore}
            loader={
              !isSearching && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <DonationCardSkeleton key={i} />
                  ))}
                </div>
              )
            }
            endMessage={
              <p className="text-center text-sm text-gray-400 mt-8">
                You&apos;ve reached the end!
              </p>
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {data.map((d, idx) => (
                <Link
                  scroll={true}
                  key={idx}
                  href={`/donations/${d.category}/detail?slug=${d.slug}`}
                  className="group relative rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] block"
                >
                  <div className="relative h-60">
                    <Image
                      src={d.thumbnailUrl || "/placeholder.jpg"}
                      alt={d.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover object-center"
                    />
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-[#d0f2ee] text-[#1c695f] text-[11px] font-medium px-3 py-1 rounded-full w-fit shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-[#1c695f] animate-pulse" />
                      Available
                    </div>
                  </div>

                  <div className="p-4 flex flex-col justify-between h-[180px] space-y-1">
                    <h3 className="text-base font-semibold text-[#1f2d28] line-clamp-1">
                      {toTitleCase(d.title)}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-1 mb-2 ">
                      {d.description.charAt(0).toUpperCase() +
                        d.description.slice(1)}
                    </p>
                    <div className="flex items-center gap-1 text-[11px] text-[#1c695f] font-medium mb-1">
                      <Tags className="w-3.5 h-3.5" />
                      <span>{getCategoryLabel(d.category)}</span>
                    </div>
                    {d.author?.address && (
                      <div className="flex items-center gap-1 text-[11px] text-gray-500 mb-2">
                        <MapPin className="w-3 h-3 text-[#1c695f]" />
                        <span className="line-clamp-1">
                          {toTitleCase(mainAddress(d.author.address))}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-auto pt-2 border-t border-gray-100">
                      <div className="relative w-7 h-7 rounded-full bg-gray-200 overflow-hidden">
                        {d.author?.avatarUrl ? (
                          <Image
                            src={d.author.avatarUrl}
                            alt={d.author?.fullName ?? "Author"}
                            fill
                            sizes="28px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] font-bold bg-[#1c695f] text-white rounded-full">
                            {d.author?.fullName?.charAt(0).toUpperCase() ?? "?"}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col leading-tight">
                        <span className="font-semibold text-sm text-gray-800">
                          {toTitleCase(d.author?.fullName ?? "Unknown")}
                        </span>
                        <span className="text-[9px] text-gray-400">
                          {d.createdAt
                            ? formatDistanceToNowStrict(new Date(d.createdAt), {
                              addSuffix: true,
                            })
                            : "Unknown time"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </InfiniteScroll>
        )}
      </div>
    </section>
  );
}
