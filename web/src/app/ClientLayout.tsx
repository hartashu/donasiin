// "use client";

// import { usePathname } from "next/navigation";
// import { Header } from "@/components/layout/Header";
// import { Footer } from "@/components/layout/Footer";

// export default function ClientLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const pathname = usePathname();
//   const isAuthRoute = pathname.startsWith("/auth");
//   const isChatRoute = pathname.startsWith("/chat");

//   if (isAuthRoute || isChatRoute) {
//     return <>{children}</>;
//   }

//   return (
//     <div className="relative min-h-screen flex flex-col">

//       <div
//         className="fixed inset-0 z-[-1]"
//       />

//       <Header />
//       <main className="">{children}</main>
//       <Footer />
//     </div>
//   );
// }

// src/components/layout/ClientLayout.tsx

"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SessionProvider } from "next-auth/react";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthRoute = pathname.startsWith("/auth");
  const isChatRoute = pathname.startsWith("/chat");

  // The SessionProvider is crucial for the new Header to work correctly
  if (isAuthRoute) {
    return <SessionProvider>{children}</SessionProvider>;
  }

  if (isChatRoute) {
    return <>{children}</>;
  }

  return (
    <SessionProvider>
      <div className="relative min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </div>
    </SessionProvider>
  );
}
