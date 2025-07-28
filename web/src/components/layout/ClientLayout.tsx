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

  if (isAuthRoute || isChatRoute) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="fixed inset-0 z-[-1]" />

      <Header />
      <main className="">{children}</main>
      <Footer />
    </div>
  );
}
