import { Skeleton } from "@/components/ui/Skeleton";

export function ProfileTabSkeleton() {
    return (
        <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white p-4 rounded-lg shadow-sm border flex items-center gap-4">
                    <Skeleton className="w-24 h-16 rounded-md flex-shrink-0" />
                    <div className="w-full space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    );
}