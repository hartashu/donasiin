export default function DonationCardSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {/* Gambar */}
      <div className="h-48 w-full bg-gray-200 rounded-xl" />

      {/* Title */}
      <div className="h-4 bg-gray-200 rounded w-3/5" />

      {/* Description */}
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-4/5" />
      </div>

      {/* Tags & Location */}
      <div className="flex flex-wrap gap-3 mt-2">
        <div className="h-3 w-24 bg-gray-200 rounded" />
        <div className="h-3 w-28 bg-gray-100 rounded" />
      </div>

      {/* Donor info */}
      <div className="flex items-center gap-3 mt-4">
        <div className="w-8 h-8 bg-gray-300 rounded-full" />
        <div className="flex flex-col gap-1">
          <div className="h-3 w-24 bg-gray-200 rounded" />
          <div className="h-2 w-16 bg-gray-100 rounded" />
        </div>
      </div>
    </div>
  );
}
