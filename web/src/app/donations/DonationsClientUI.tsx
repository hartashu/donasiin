"use client";

import { useEffect, useState, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Filter, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function DonationsClientUI({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showSidebar, setShowSidebar] = useState(true);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [showInput, setShowInput] = useState(false);
  // Inisialisasi state dari searchParams saat komponen pertama kali render
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  const isDetailPage = pathname.includes("/detail");
  const isDonationsRoute = pathname.startsWith("/donations") && !isDetailPage;

  const categories = useMemo(
    () => [
      { name: "All", path: "/donations" },
      { name: "Electronics", path: "/donations/electronics" },
      { name: "Fashion & Apparel", path: "/donations/fashion-apparel" },
      { name: "Home & Kitchen", path: "/donations/home-kitchen" },
      { name: "Health & Beauty", path: "/donations/health-beauty" },
      { name: "Sports & Outdoors", path: "/donations/sports-outdoors" },
      { name: "Baby & Kids", path: "/donations/baby-kids" },
      { name: "Automotive & Tools", path: "/donations/automotive-tools" },
      { name: "Books, Music & Media", path: "/donations/books-music-media" },
      { name: "Pet Supplies", path: "/donations/pet-supplies" },
      {
        name: "Office Supplies & Stationery",
        path: "/donations/office-supplies-stationery",
      },
    ],
    []
  );

  const currentCategory = useMemo(
    () => categories.find((cat) => cat.path === pathname)?.name || "Donations",
    [pathname, categories]
  );

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Update URL dengan search query
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    } else {
      params.delete("search");
    }
    router.replace(`${pathname}?${params.toString()}`);
  }, [debouncedSearch, pathname, router, searchParams]);

  // Animate search bar input
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (showSearchBar) {
      timeout = setTimeout(() => setShowInput(true), 1000);
    } else {
      setShowInput(false);
    }
    return () => clearTimeout(timeout);
  }, [showSearchBar]);

  const createCategoryLink = (path: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!debouncedSearch) {
      params.delete("search");
    }
    return `${path}?${params.toString()}`;
  };
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {!isDetailPage && (
        <nav className="sticky top-0 z-40 bg-white border-b px-6 py-4 flex flex-col md:flex-row justify-between items-center shadow-sm gap-4">
          <h1 className="text-2xl font-bold text-[#1c695f]">
            {currentCategory === "All" ? "All Donations" : currentCategory}
          </h1>
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <AnimatePresence mode="wait">
              {showSearchBar ? (
                <motion.div
                  key="search"
                  layout
                  initial={{ width: 40, opacity: 0.6 }}
                  animate={{ width: 480, opacity: 1 }}
                  exit={{ width: 40, opacity: 0 }}
                  transition={{ ease: "easeInOut", duration: 1 }}
                  className="flex items-center bg-white border border-gray-300 shadow px-3 py-2 rounded-full overflow-hidden"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-gray-500 mr-2 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1111.5 4.5a7.5 7.5 0 015.15 12.15z"
                    />
                  </svg>
                  {showInput && (
                    <>
                      <motion.input
                        key="input"
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search donations..."
                        autoFocus
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="bg-transparent text-sm flex-1 outline-none text-gray-800 placeholder-gray-400"
                      />
                      <motion.button
                        onClick={() => {
                          setSearch("");
                          setShowSearchBar(false);
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="ml-2"
                      >
                        <X className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                      </motion.button>
                    </>
                  )}
                </motion.div>
              ) : (
                <motion.button
                  key="button"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setShowSearchBar(true)}
                  className="p-2 rounded-full hover:bg-gray-100 transition border border-gray-300 bg-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1111.5 4.5a7.5 7.5 0 015.15 12.15z"
                    />
                  </svg>
                </motion.button>
              )}
            </AnimatePresence>
            {isDonationsRoute && (
              <button
                onClick={() => setShowSidebar((prev) => !prev)}
                className="flex items-center gap-2 border px-3 py-2 rounded-full text-sm font-medium bg-white hover:bg-gray-100 transition shadow"
              >
                {showSidebar ? (
                  <X className="w-4 h-4" />
                ) : (
                  <Filter className="w-4 h-4" />
                )}
                <span className="hidden md:inline">
                  {showSidebar ? "Hide Filters" : "Show Filters"}
                </span>
              </button>
            )}
          </div>
        </nav>
      )}
      <div className="flex flex-1">
        {isDonationsRoute && (
          <>
            <div
              className={`md:hidden fixed inset-0 z-50 flex ${
                showSidebar ? "pointer-events-auto" : "pointer-events-none"
              }`}
            >
              <div
                className={`fixed inset-0 bg-black bg-opacity-40 transition-opacity duration-300 ${
                  showSidebar ? "opacity-100" : "opacity-0"
                }`}
                onClick={() => setShowSidebar(false)}
              />
              <aside
                className={`relative w-64 h-full bg-white p-4 shadow-lg transform transition-transform duration-300 ${
                  showSidebar ? "translate-x-0" : "-translate-x-full"
                }`}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-[#1c695f]">
                    Categories
                  </h2>
                  <button onClick={() => setShowSidebar(false)}>
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                <ul className="space-y-1">
                  {categories.map((item) => (
                    <li key={item.path}>
                      <Link
                        href={createCategoryLink(item.path)}
                        onClick={() => setShowSidebar(false)}
                        className={`block px-3 py-2 rounded-md transition font-medium ${
                          pathname === item.path
                            ? "bg-teal-50 text-teal-700 shadow-sm"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </aside>
            </div>
            {showSidebar && (
              <aside className="w-64 p-4 border-r bg-white hidden md:block sticky top-[80px] max-h-[calc(100vh-80px)] overflow-y-auto shadow-sm">
                <h2 className="text-lg font-semibold mb-3 text-[#1c695f]">
                  Categories
                </h2>
                <ul className="space-y-1">
                  {categories.map((item) => (
                    <li key={item.path}>
                      <Link
                        href={createCategoryLink(item.path)}
                        className={`block px-2 py-1.5 text-sm rounded-md ${
                          pathname === item.path
                            ? "bg-teal-50 text-teal-700 font-semibold"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </aside>
            )}
          </>
        )}
        <main className="flex-1 w-full">{children}</main>
      </div>
    </div>
  );
}
