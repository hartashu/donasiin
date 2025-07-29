"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Filter, X } from "lucide-react";

export default function DonationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showSidebar, setShowSidebar] = useState(false);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  const isDetailPage =
    pathname.includes("/donations/") && pathname.includes("/detail");
  const isDonationsRoute = pathname.startsWith("/donations") && !isDetailPage;

  const categories = [
    { name: "All", path: "/donations" },
    { name: "Elektronik", path: "/donations/elektronik" },
    { name: "Fashion & Pakaian", path: "/donations/fashion" },
    { name: "Rumah & Dapur", path: "/donations/rumah-dapur" },
    { name: "Kesehatan & Kecantikan", path: "/donations/kesehatan-kecantikan" },
    { name: "Olahraga & Luar Ruangan", path: "/donations/olahraga-luar" },
    { name: "Bayi & Anak", path: "/donations/bayi-anak" },
    { name: "Otomotif & Peralatan", path: "/donations/otomotif-peralatan" },
    { name: "Buku, Musik & Media", path: "/donations/buku-musik-media" },
    { name: "Perlengkapan Hewan Peliharaan", path: "/donations/hewan" },
    {
      name: "Perlengkapan Kantor & Alat Tulis",
      path: "/donations/kantor-alat-tulis",
    },
  ];

  const currentCategory =
    categories.find((cat) => cat.path === pathname)?.name || "Donations";

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    } else {
      params.delete("search");
    }
    router.push(`${pathname}?${params.toString()}`);
  }, [debouncedSearch]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      {!isDetailPage && (
        <nav className="sticky top-0 z-50 bg-white border-b px-6 py-4 flex flex-col md:flex-row justify-between items-center shadow-sm gap-4">
          <h1 className="text-2xl font-bold text-[#1c695f]">
            {currentCategory} Donations
          </h1>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search donations..."
              className="w-full md:w-64 px-4 py-1 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1c695f] transition"
            />
            {isDonationsRoute && (
              <button
                onClick={() => setShowSidebar((prev) => !prev)}
                className="flex items-center gap-2 border px-2 py-2 rounded-lg text-sm font-medium bg-white hover:bg-gray-100 transition"
              >
                {showSidebar ? (
                  <X className="w-4 h-4" />
                ) : (
                  <Filter className="w-4 h-4" />
                )}
                {/* Text hanya tampil di layar md ke atas */}
                <span className="hidden md:inline">
                  {showSidebar ? "Hide Filters" : "Show Filters"}
                </span>
              </button>
            )}
          </div>
        </nav>
      )}

      {/* Mobile Sidebar */}
      {isDonationsRoute && (
        <div
          className={`md:hidden fixed inset-0 z-50 flex pointer-events-none`}
        >
          {/* Overlay */}
          <div
            className={`fixed inset-0 bg-black bg-opacity-40 transition-opacity duration-300 ${
              showSidebar ? "opacity-100 pointer-events-auto" : "opacity-0"
            }`}
            onClick={() => setShowSidebar(false)}
          />

          {/* Sidebar Drawer */}
          <aside
            className={`relative w-64 h-full bg-white p-4 shadow-lg transform transition-transform duration-300 ${
              showSidebar ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-[#1c695f]">
                Filter by Category
              </h2>
              <button onClick={() => setShowSidebar(false)}>
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <ul className="space-y-1">
              {categories.map((item) => {
                const isActive = pathname === item.path;
                const params = new URLSearchParams(searchParams.toString());
                if (search) {
                  params.set("search", search);
                } else {
                  params.delete("search");
                }

                return (
                  <li key={item.path}>
                    <Link
                      href={{ pathname: item.path, query: params.toString() }}
                      onClick={() => setShowSidebar(false)}
                      className={`block px-3 py-2 rounded-md transition font-medium ${
                        isActive
                          ? "bg-[#e6f7f6] text-[#1c695f] shadow-sm"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </aside>
        </div>
      )}

      {/* Content Area */}
      <div className="flex flex-1">
        {isDonationsRoute && showSidebar && (
          <aside
            className="w-64 p-4 border-r bg-white hidden md:block sticky top-[80px] h-[calc(100vh-80px)] overflow-y-auto shadow-sm"
            style={{
              scrollbarWidth: "thin", // Firefox
              scrollbarColor: "#1c695f transparent", // Firefox
            }}
          >
            <style jsx>{`
              aside::-webkit-scrollbar {
                width: 6px;
              }
              aside::-webkit-scrollbar-track {
                background: transparent;
              }
              aside::-webkit-scrollbar-thumb {
                background-color: #1c695f;
                border-radius: 8px;
              }
              aside:hover::-webkit-scrollbar-thumb {
                background-color: #15564d;
              }
            `}</style>

            <h2 className="text-lg font-semibold mb-3 text-[#1c695f]">
              Filter by Category
            </h2>
            <ul className="space-y-1">
              {categories.map((item) => {
                const isActive = pathname === item.path;
                const params = new URLSearchParams(searchParams.toString());
                if (search) {
                  params.set("search", search);
                } else {
                  params.delete("search");
                }

                return (
                  <li key={item.path}>
                    <Link
                      href={{ pathname: item.path, query: params.toString() }}
                      className={`block px-3 py-2 rounded-md transition font-medium ${
                        isActive
                          ? "bg-[#e6f7f6] text-[#1c695f] shadow-sm"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 w-full">{children}</main>
      </div>
    </div>
  );
}
