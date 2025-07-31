import DonationCards from "@/components/donations/DonationCards";
import { Suspense } from "react";

function Loading() {
  return <div className="p-6 text-center text-gray-500">Loading donations...</div>;
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  return (
    <Suspense fallback={<Loading />}>
      <DonationCards category={(await params).category} />
    </Suspense>
  );
}