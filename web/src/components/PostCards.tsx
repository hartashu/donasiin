import { IPost } from "@/types/types";
import { Minimize2 } from "lucide-react";

export default function PostCards({ data }: { data: IPost[] }) {
  return (
    <div className="p-6">
      <div className="space-y-1 mb-4">
        <p className="font-bold text-xl">Recently Shared Items</p>
        <p className="text-gray-400">
          Discover amazing items shared by our community members
        </p>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {data.map(
          (d, i) =>
            d.isAvailable && (
              <div
                key={i}
                className="group relative rounded-2xl overflow-hidden border border-gray-400 bg-white shadow-md hover:shadow-xl transition-all duration-300 ease-in-out hover:scale-[1.03] hover:-translate-y-1 hover:border-green-500"
              >
                {/* Cards */}
                <div className="relative overflow-hidden">
                  {/* Images */}
                  <img
                    src={d.thumbnailUrl}
                    alt={d.title}
                    className="w-full h-48 object-cover object-top transform transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Hover Content */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-colors duration-300">
                    <div className="opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all duration-300 backdrop-blur-md bg-white/60 px-4 py-2 rounded-full flex items-center gap-2 shadow-md border border-white/40">
                      <Minimize2 className="w-3" />
                      <span className="text-sm font-semibold text-black">
                        View Details
                      </span>
                    </div>
                  </div>

                  {/* Badge */}
                  <span className="absolute top-2 right-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                    Available
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-4 flex flex-col justify-between h-[calc(100%-12rem)]">
                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-1">
                    {d.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 line-clamp-2 text-justify mb-2">
                    {d.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {d.tags?.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {d.tags?.length > 3 && (
                      <span className="text-xs text-gray-400">
                        +{d.tags.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-auto pt-2 border-t border-gray-100">
                    <div className="w-6 h-6 rounded-full bg-green-700 text-white flex items-center justify-center text-[10px] font-bold">
                      U
                    </div>
                    <span>about 2 hours ago</span>
                  </div>
                </div>
              </div>
            )
        )}
      </div>
    </div>
  );
}
