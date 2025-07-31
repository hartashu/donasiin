import DonationCards from "@/components/donations/DonationCards";
import { Suspense } from "react";

function CardsLoading() {
  return <div className="p-6 text-center text-gray-500">Loading donations...</div>;
}

export default function DonationsPage() {
  return (
    <Suspense fallback={<CardsLoading />}>
      <DonationCards />
    </Suspense>
  );
}