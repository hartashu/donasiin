import DonationCards from "@/components/donations/DonationCards";
import DonationsClientLayout from "./DonationsClientLayout";
import { Suspense } from "react";

// You can create a more sophisticated skeleton loading component here
function DonationsLoading() {
  return <div className="w-full p-6 text-center text-gray-500">Loading UI...</div>;
}

export default function DonationsPage() {
  return (
    <Suspense fallback={<DonationsLoading />}>
      <DonationsClientLayout>
        <DonationCards />
      </DonationsClientLayout>
    </Suspense>
  );
}