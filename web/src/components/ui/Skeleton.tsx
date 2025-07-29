// File: src/components/ui/Skeleton.tsx

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={`animate-pulse rounded-md bg-gray-200 ${className}`}
            {...props}
        />
    );
}
