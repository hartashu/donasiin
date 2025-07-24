import PostCards from "@/components/PostCards";
import { Search, SlidersHorizontal } from "lucide-react";

export default function Home() {
  return (
    <div className="p-16 pt-4">
      <div className="text-5xl font-black text-black flex gap-3 justify-center pt-4">
        <span>Share.</span>
        <span>Connect.</span>
        <span className="text-green-800/80">Sustain.</span>
      </div>
      <div className="pt-4 text-gray-600/90 text-md tracking-widest font-normal">
        <p className="flex justify-center items-center">
          Join a community that believes in the power of sharing. Give items a
          second life,
        </p>
        <p className="flex justify-center items-center">
          reduce waster, and connect with neighbors who care about our planet.
        </p>
      </div>

      <div className="grid grid-cols-3 text-center pt-12">
        <div className="text-green-800/80 font-bold text-2xl flex flex-col ">
          0
          <span className="font-normal text-gray-500 text-sm pt-1">
            Items Shared
          </span>
        </div>
        <div className="text-green-800/80 font-bold text-2xl flex flex-col ">
          0
          <span className="font-normal text-gray-500 text-sm pt-1">
            Active Members
          </span>
        </div>
        <div className="text-green-800/80 font-bold text-2xl flex flex-col">
          0
          <span className="font-normal text-gray-500 text-sm pt-1">
            CO<sub className="text-[7px]">2</sub> Saved (kg)
          </span>
        </div>
      </div>

      <hr className="border border-gray-300 mt-12" />

      <div className=" mt-12">
        <div className="text-green-800/90 text-3xl font-bold flex justify-center items-center">
          <p>Discover Donations</p>
        </div>

        <div className="flex items-center space-x-2 mb-8 mt-4 justify-center">
          <div className="relative justify-center">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for items..."
              className="pl-10 pr-4 py-2 rounded-md border  text-gray-700  border-gray-300 w-xl focus:ring-green-800/90"
            />
          </div>
          <button className="flex items-center space-x-2 border px-4 py-2 border-green-500 text-green-700 hover:bg-green-800/80 hover:text-white bg-transparent rounded-md">
            <SlidersHorizontal className="h-5 w-5" />
            <span>Filter</span>
          </button>
        </div>

        <div className="border border-black m-6 rounded-lg">
          <PostCards />
        </div>
      </div>
    </div>
  );
}
