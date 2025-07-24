"use client";

import { usePathname } from "next/navigation";
import { User, Plus, MessageCircle, House } from "lucide-react";

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

            <div className="bg-green-800/80 px-2 py-1 rounded-md">
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
      <section className="min-h-screen">{children}</section>
    </main>
  );
}
