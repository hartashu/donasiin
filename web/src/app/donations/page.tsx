// import DonationCards from "@/components/donations/DonationCards";
// import DonationsClientLayout from "./DonationsClientLayout";
// import { Suspense } from "react";

// // You can create a more sophisticated skeleton loading component here
// function DonationsLoading() {
//   return <div className="w-full p-6 text-center text-gray-500">Loading UI...</div>;
// }

// export default function DonationsPage() {
//   return (
//     <Suspense fallback={<DonationsLoading />}>
//       <DonationsClientLayout>
//         <DonationCards />
//       </DonationsClientLayout>
//     </Suspense>
//   );
// }
import DonationCards from "@/components/donations/DonationCards";
import { Suspense } from "react";

// Komponen loading bisa dibuat lebih menarik, misal dengan skeleton UI
function Loading() {
  return <div className="p-6 text-center text-gray-500">Loading donations...</div>;
}

export default function DonationsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <DonationCards />
    </Suspense>
  );
}