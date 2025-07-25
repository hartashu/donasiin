"use client";

import { usePathname } from "next/navigation";
import { User, Plus, MessageCircle, House, Send } from "lucide-react";

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
          <div className="text-2xl font-bold cursor-pointer">Donasiin</div>
          <div className="flex gap-2 items-center cursor-pointer ml-50">
            <div>
              <House className="w-5" />
            </div>
            <div className="text-md">Discover</div>
          </div>

          <div className="flex gap-8 items-center cursor-pointer">
            <div className="flex gap-2">
              <div>
                <MessageCircle className="w-5" />
              </div>
              <div>Messages</div>
            </div>

            <div style={{ background: " #2a9d8f" }}>
              <div className="flex gap-2 cursor-pointer">
                <div className="text-white font-bold">
                  <Plus className="w-4" />
                </div>
                <div className="text-white font-semibold">Share Item</div>
              </div>
            </div>

            <div className="cursor-pointer">
              <User className="w-6" />
            </div>
          </div>
        </nav>
      )}
      <section className="">{children}</section>

      {!isAuthRoute && (
        <footer className="h-50 bg-gray-800/90">
          <div className="text-white p-16 pt-8">
            <p className="font-light text-md mb-2">
              Berlanggang email newslatter kami
            </p>
            <div className="flex items-center">
              <input
                type="email"
                placeholder="Email"
                className="border border-black/50 rounded-l-md px-3 py-2 text-white bg-black/50 w-xs "
              />
              <button className="rounded-r-md bg-green-700/80 px-3 py-2 border border-green-700/80">
                <Send className="w-3" />
              </button>
            </div>
          </div>
        </footer>
      )}
    </main>
  );
}
