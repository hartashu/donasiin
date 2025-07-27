"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthRoute = pathname.startsWith("/auth");
  const isChatRoute = pathname.startsWith("/chat");

  return (
    <main className="bg-white text-black min-h-screen flex flex-col">
      {!isAuthRoute && !isChatRoute && <Header />}

      <section className="flex-grow">{children}</section>

      {!isAuthRoute && !isChatRoute && <Footer />}
    </main>
  );
}