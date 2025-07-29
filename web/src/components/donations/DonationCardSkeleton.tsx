export default function DonationCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-lg bg-white shadow-sm animate-pulse">
      {/* Gambar thumbnail */}
      <div className="h-40 bg-gray-200 rounded-md w-full" />

      {/* Title */}
      <div className="h-4 bg-gray-200 rounded w-2/3" />

      {/* Description */}
      <div className="h-3 bg-gray-200 rounded w-full" />
      <div className="h-3 bg-gray-200 rounded w-3/4" />

      {/* Category dan Lokasi */}
      <div className="flex gap-2 mt-2">
        <div className="h-3 w-20 bg-gray-200 rounded" />
        <div className="h-3 w-24 bg-gray-100 rounded" />
      </div>

      {/* Donor info */}
      <div className="flex items-center gap-2 pt-3">
        <div className="w-7 h-7 bg-gray-300 rounded-full" />
        <div className="flex flex-col gap-1 w-full">
          <div className="h-3 w-1/3 bg-gray-200 rounded" />
          <div className="h-2 w-1/4 bg-gray-100 rounded" />
        </div>
      </div>
    </div>
  );
}
