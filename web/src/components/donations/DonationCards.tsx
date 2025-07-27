"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { IPost } from "@/types/types";
import { getPosts } from "@/actions/action";
import Link from "next/link";
import { Minimize2 } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";

export default function DonationCards({ category }: { category?: string }) {
  const [data, setData] = useState<IPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getPosts(category, search, page, 12);
        setData(response.posts);
        setTotalPages(response.totalPages);
      } catch (err) {
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [category, search, page]);

  const handlePrev = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (page < totalPages) setPage((prev) => prev + 1);
  };

  return (
    <section className="bg-[#f8fdfc] text-black min-h-screen">
      <div className="container mx-auto px-6 py-6">
        {loading ? (
          <p className="text-center">Loading...</p>
        ) : data.length === 0 ? (
          <p className="text-center text-gray-500">No donations found.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {data.map((d, idx) => (
                <div
                  key={idx}
                  className="group relative rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="relative h-44">
                    <img
                      src={d.thumbnailUrl}
                      alt={d.title}
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center transition duration-300">
                      <div className="opacity-0 group-hover:opacity-100 transition">
                        <Link
                          href={`/donations/${d.category}/detail?slug=${d.slug}`}
                          className="backdrop-blur-sm bg-white/70 px-4 py-2 rounded-full flex items-center gap-2 shadow-md text-sm"
                        >
                          <Minimize2 className="w-3" />
                          View Details
                        </Link>
                      </div>
                    </div>
                    <span className="absolute top-2 right-2 bg-[#2a9d8f] text-white text-xs font-bold px-2 py-1 rounded-full">
                      Available
                    </span>
                  </div>

                  <div className="p-4 flex flex-col justify-between h-[180px]">
                    <h3 className="text-lg font-bold text-[#1f2d28] mb-1 line-clamp-1">
                      {d.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2 text-justify">
                      {d.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-auto pt-2 border-t border-gray-100">
                      <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
                        {d.author?.avatarUrl ? (
                          <img
                            src={d.author.avatarUrl}
                            alt={d.author?.fullName ?? "Author"}
                            width={24}
                            height={24}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] font-bold bg-[#13796f] text-white rounded-full">
                            {d.author?.fullName?.charAt(0).toUpperCase() ?? "?"}
                          </div>
                        )}
                      </div>
                      <span className="truncate">
                        {d.author?.fullName ?? "Unknown"}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span>
                        {d.createdAt
                          ? formatDistanceToNowStrict(new Date(d.createdAt), {
                              addSuffix: true,
                            })
                          : "Unknown time"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-4">
              <button
                onClick={handlePrev}
                disabled={page === 1}
                className="px-4 py-2 bg-[#ccc] text-black rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={handleNext}
                disabled={page === totalPages}
                className="px-4 py-2 bg-[#2a9d8f] text-white rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
