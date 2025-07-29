export default function DonationDetailSkeleton() {
  return (
    <div className="container mx-auto py-8 px-4 animate-pulse">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Image Skeleton */}
        <div className="w-full h-80 md:h-[400px] bg-gray-200 rounded-lg" />

        {/* Info Skeleton */}
        <div className="flex flex-col gap-4">
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="h-5 bg-gray-200 rounded w-full" />
          <div className="h-5 bg-gray-200 rounded w-5/6" />

          {/* Detail Skeleton */}
          <div className="space-y-2 mt-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded w-3/4" />
            ))}
          </div>

          {/* Author Skeleton */}
          <div className="flex items-center gap-3 mt-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-32" />
              <div className="h-3 bg-gray-200 rounded w-24" />
            </div>
          </div>

          {/* Status Skeleton */}
          <div className="h-6 w-24 bg-gray-200 rounded-full mt-2" />

          {/* Button Skeleton */}
          <div className="space-y-3 mt-6">
            <div className="h-10 bg-gray-200 rounded w-full" />
            <div className="h-10 bg-gray-200 rounded w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
