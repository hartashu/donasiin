// // // // import DonationCards from "@/components/donations/DonationCards";
// // // // import DonationsClientLayout from "./DonationsClientLayout";
// // // // import { Suspense } from "react";

// // // // // You can create a more sophisticated skeleton loading component here
// // // // function DonationsLoading() {
// // // //   return <div className="w-full p-6 text-center text-gray-500">Loading UI...</div>;
// // // // }

// // // // export default function DonationsPage() {
// // // //   return (
// // // //     <Suspense fallback={<DonationsLoading />}>
// // // //       <DonationsClientLayout>
// // // //         <DonationCards />
// // // //       </DonationsClientLayout>
// // // //     </Suspense>
// // // //   );
// // // // }
// // // import DonationCards from "@/components/donations/DonationCards";
// // // import { Suspense } from "react";

// // // // Komponen loading bisa dibuat lebih menarik, misal dengan skeleton UI
// // // function Loading() {
// // //   return <div className="p-6 text-center text-gray-500">Loading donations...</div>;
// // // }

// // // export default function DonationsPage() {
// // //   return (
// // //     <Suspense fallback={<Loading />}>
// // //       <DonationCards />
// // //     </Suspense>
// // //   );
// // // }


// // import DonationCards from "@/components/donations/DonationCards";
// // import { Suspense } from "react";

// // function Loading() {
// //   return <div className="p-6 text-center text-gray-500">Loading donations...</div>;
// // }

// // export default function DonationsPage() {
// //   return (
// //     <Suspense fallback={<Loading />}>
// //       <DonationCards />
// //     </Suspense>
// //   );
// // }



// import { Suspense } from "react";
// import DonationCards from "@/components/donations/DonationCards";
// import DonationsClientUI from "./DonationsClientUI"; // Impor komponen UI baru

// // Fallback untuk Suspense Boundary
// function UILoading() {
//   // Kamu bisa membuat skeleton loading yang lebih bagus di sini
//   return <div className="p-6 text-center text-gray-500">Loading UI...</div>;
// }

// export default function DonationsPage() {
//   return (
//     <Suspense fallback={<UILoading />}>
//       <DonationsClientUI>
//         {/* DonationCards akan dirender sebagai children di dalam DonationsClientUI */}
//         <DonationCards />
//       </DonationsClientUI>
//     </Suspense>
//   );
// }


import DonationCards from "@/components/donations/DonationCards";
import { Suspense } from "react";

// Fallback loading spesifik untuk kartu donasi
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