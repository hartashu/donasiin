"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function DonationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showSidebar, setShowSidebar] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  // Cek apakah sedang di route detail
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

  // ✅ Debounce logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500); // delay 500ms

    return () => clearTimeout(handler);
  }, [search]);

  // ✅ Update URL when debounce value changes
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
    <div className="min-h-screen flex flex-col">
      {/* Hanya tampilkan navbar jika bukan halaman detail */}
      {!isDetailPage && (
        <nav className="sticky top-0 z-50 bg-white border-b p-4 flex justify-between items-center shadow-sm">
          <h1 className="text-xl font-bold">{currentCategory} Donations</h1>
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="border px-2 py-1 rounded"
            />
            {isDonationsRoute && (
              <button
                onClick={() => setShowSidebar((prev) => !prev)}
                className="border px-4 py-1 rounded hover:bg-gray-100"
              >
                {showSidebar ? "Hide Filters" : "Show Filters"}
              </button>
            )}
          </div>
        </nav>
      )}

      {/* Content Area */}
      <div className="flex flex-1">
        {/* Tampilkan sidebar hanya jika bukan halaman detail */}
        {isDonationsRoute && showSidebar && (
          <aside className="w-64 p-4 border-r hidden md:block sticky top-[64px] h-[calc(100vh-64px)] overflow-y-auto">
            <h2 className="font-semibold mb-2">Filter by Category</h2>
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
                      href={{
                        pathname: item.path,
                        query: params.toString(),
                      }}
                      className={`block px-2 py-1 rounded hover:bg-gray-100 ${
                        isActive ? "bg-gray-200 font-semibold" : ""
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
        <main className="flex-1 p-4 w-full">{children}</main>
      </div>
    </div>
  );
}
