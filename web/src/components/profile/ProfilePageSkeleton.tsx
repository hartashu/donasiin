import { Skeleton } from "@/components/ui/Skeleton";

export function ProfilePageSkeleton() {
    return (
        <div className="container mx-auto p-4 sm:p-6 animate-pulse">
            <div className="space-y-6 lg:grid lg:grid-cols-12 lg:gap-8 lg:space-y-0">
                <aside className="lg:col-span-4 xl:col-span-3">
                    <div className="space-y-5 p-5 bg-white rounded-lg shadow-sm border">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                            <Skeleton className="w-24 h-24 rounded-full flex-shrink-0" />
                            <div className="w-full space-y-2 mt-2">
                                <Skeleton className="h-7 w-3/4" />
                                <Skeleton className="h-5 w-1/2" />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 pt-5 border-t">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="text-center space-y-2">
                                    <Skeleton className="h-6 w-1/2 mx-auto" />
                                    <Skeleton className="h-4 w-full mx-auto" />
                                </div>
                            ))}
                        </div>
                        <div className="pt-5 border-t space-y-4">
                            <Skeleton className="h-24 w-full rounded-lg" />
                            <Skeleton className="h-20 w-full rounded-lg" />
                        </div>
                    </div>
                </aside>
                <main className="lg:col-span-8 xl:col-span-9">
                    <div className="p-5 bg-white rounded-lg shadow-sm border">
                        <div className="flex gap-6 border-b mb-6">
                            <Skeleton className="h-8 w-24" />
                            <Skeleton className="h-8 w-24" />
                        </div>
                        <div className="space-y-4">
                            <Skeleton className="h-48 w-full rounded-lg" />
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {[...Array(3)].map((_, i) => (
                                    <Skeleton key={i} className="h-32 w-full rounded-lg" />
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}