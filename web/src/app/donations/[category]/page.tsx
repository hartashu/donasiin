// // // import DonationCards from "@/components/donations/DonationCards";

// // // export default async function CategoryDonationsPage({
// // //   params,
// // // }: {
// // //   params: Promise<{ category: string }>;
// // // }) {
// // //   return <DonationCards category={(await params).category} />;
// // // }


// // import DonationCards from "@/components/donations/DonationCards";
// // import { Suspense } from "react";

// // function Loading() {
// //   return <div className="p-6 text-center text-gray-500">Loading donations...</div>;
// // }

// // export default async function CategoryDonationsPage({
// //   params,
// // }: {
// //   params: Promise<{ category: string }>;
// // }) {
// //   // FIX: Bungkus komponen dengan <Suspense>
// //   return (
// //     <Suspense fallback={<Loading />}>
// //       <DonationCards category={(await params).category} />
// //     </Suspense>
// //   );
// // }


// import DonationCards from "@/components/donations/DonationCards";
// import { Suspense } from "react";

// function Loading() {
//   return <div className="p-6 text-center text-gray-500">Loading donations...</div>;
// }

// export default function CategoryPage({ params }: { params: { category: string } }) {
//   return (
//     <Suspense fallback={<Loading />}>
//       <DonationCards category={params.category} />
//     </Suspense>
//   );
// }


import DonationCards from "@/components/donations/DonationCards";
import { Suspense } from "react";

function Loading() {
  return <div className="p-6 text-center text-gray-500">Loading donations...</div>;
}

// FIX: Tambahkan `async` dan ubah tipe `params` menjadi Promise
export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  return (
    <Suspense fallback={<Loading />}>
      {/* FIX: Gunakan `await` untuk mendapatkan nilai category */}
      <DonationCards category={(await params).category} />
    </Suspense>
  );
}