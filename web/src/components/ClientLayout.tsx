"use client";

import { usePathname } from "next/navigation";
import { User, Plus, MessageCircle, House, Send, Gift } from "lucide-react";
import Link from "next/link";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthRoute = pathname.startsWith("/auth");

  return (
    <main className="bg-white text-black">
      {!isAuthRoute && (
        <nav className="border-b border-b-gray-300 flex justify-between items-center p-3 pl-16 pr-16">
          <Link href="/" className="text-2xl font-bold">
            Donasiin
          </Link>

          <Link href="/" className="flex gap-2 items-center">
            <House className="w-5" />
            <div className="text-md">Discover</div>
          </Link>

          <div className="flex gap-8 items-center">
            <Link href="/donations" className="flex gap-2 items-center">
              <Gift className="w-5" />
              <div>Donations</div>
            </Link>

            <Link href="/chat" className="flex gap-2 items-center">
              <MessageCircle className="w-5" />
              <div>Messages</div>
            </Link>

            <Link href="/create-post" className="bg-[#2a9d8f] text-white flex items-center gap-2 px-4 py-2 rounded-md font-semibold hover:opacity-90">
              <Plus className="w-4" />
              <div>Share Item</div>
            </Link>

            <Link href="/profile">
              <User className="w-6" />
            </Link>
          </div>
        </nav>
      )}
      <section>{children}</section>

      {!isAuthRoute && (
        <footer className="h-50 bg-gray-800/90">
          <div className="text-white p-16 pt-8">
            <p className="font-light text-md mb-2">
              Berlangganan email newsletter kami
            </p>
            <form className="flex items-center">
              <input
                type="email"
                placeholder="Email"
                className="border border-black/50 rounded-l-md px-3 py-2 text-white bg-black/50 w-xs"
                aria-label="Email for newsletter"
              />
              <button type="submit" className="rounded-r-md bg-green-700/80 px-3 py-2 border border-green-700/80">
                <Send className="w-5 h-5 text-white" />
              </button>
            </form>
          </div>
        </footer>
      )}
    </main>
  );
}