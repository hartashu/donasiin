// 'use client';

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { usePathname, useRouter } from "next/navigation";
// import { User, Plus, MessageCircle, House, Gift, LogOut, LogIn } from "lucide-react";

// const navLinks = [
//     { href: "/", icon: House, label: "Home" },
//     { href: "/donations", icon: Gift, label: "Donations" },
// ];

// export function Header() {
//     const pathname = usePathname();
//     const router = useRouter();
//     const [isLoggedIn, setIsLoggedIn] = useState(false);

//     useEffect(() => {
//         (async () => {
//             try {
//                 const res = await fetch("/api/users/me");

//                 console.log(res);

//                 if (res.ok) {
//                     const { data } = await res.json();
//                     if (data?.profile?._id || data?.profile?.email) setIsLoggedIn(true);
//                 }
//             } catch (err) {
//                 console.error("User fetch error:", err);
//             }
//         })();
//     }, []);

//     const handleLogout = async () => {
//         try {
//             await fetch("/api/auth/logout", {
//                 method: "POST",
//             });
//             setIsLoggedIn(false);
//             router.push("/auth/login");
//         } catch (err) {
//             console.error("Logout failed", err);
//         }
//     };

//     return (
//         <nav className="sticky top-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-200 flex justify-between items-center p-3 px-4 md:px-6 lg:px-8">
//             <Link href="/" className="text-2xl font-bold">
//                 Donasiin
//             </Link>

//             <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
//                 {navLinks.map((link) => {
//                     const isActive = pathname === link.href;
//                     return (
//                         <Link
//                             key={link.href}
//                             href={link.href}
//                             className={`flex gap-2 items-center transition-colors ${isActive ? "text-black" : "text-gray-600 hover:text-black"
//                                 }`}
//                         >
//                             <link.icon className="w-5 h-5" />
//                             <span className={`text-md font-medium ${isActive && "font-semibold"}`}>
//                                 {link.label}
//                             </span>
//                         </Link>
//                     );
//                 })}
//             </div>

//             <div className="flex gap-3 md:gap-4 items-center">
//                 <Link href="/chat" className="p-2 rounded-full hover:bg-gray-100">
//                     <MessageCircle className="w-6 h-6" />
//                 </Link>

//                 <Link href="/profile" className="p-2 rounded-full hover:bg-gray-100">
//                     <User className="w-6 h-6" />
//                 </Link>

//                 <Link
//                     href="/create-post"
//                     className="bg-[#2a9d8f] text-white flex items-center gap-2 px-3 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity"
//                 >
//                     <Plus className="w-5 h-5" />
//                     <span className="hidden md:inline">Share</span>
//                 </Link>

//                 {isLoggedIn ? (
//                     <button
//                         onClick={handleLogout}
//                         className="flex items-center gap-2 bg-[#e76f51] text-white px-3 py-2 rounded-lg hover:opacity-90 transition-opacity"
//                     >
//                         <LogOut className="w-6 h-6" />
//                         <span className="hidden md:inline font-semibold">Logout</span>
//                     </button>
//                 ) : (
//                     <Link
//                         href="/auth/login"
//                         className="flex items-center gap-2 bg-[#2a9d8f] text-white px-3 py-2 rounded-lg hover:opacity-90 transition-opacity"
//                     >
//                         <LogIn className="w-6 h-6" />
//                         <span className="hidden md:inline font-semibold">Login</span>
//                     </Link>

//                 )}

//             </div>
//         </nav>
//     );
// }

// src/components/layout/Header.tsx

// src/components/layout/Header.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  User,
  Plus,
  MessageCircle,
  House,
  Gift,
  LogOut,
  LogIn,
  LoaderCircle,
  Info,
  BookOpen,
  ChevronDown,
} from "lucide-react";
import { useState, useRef } from "react";
import Image from "next/image";
import { categoryOptions } from "@/lib/getCategoryLabel";

// Main nav links
const navLinks = [
  { href: "/", icon: House, label: "Home" },
  { href: "/donations", icon: Gift, label: "Donations", dropdown: true },
  { href: "/#about", icon: Info, label: "About Us" },
  { href: "/#stories", icon: BookOpen, label: "Stories" },
];

// Dropdown-aware nav link component
const NavLink = ({
  href,
  label,
  icon: Icon,
  dropdown = false,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  dropdown?: boolean;
}) => {
  const pathname = usePathname();
  const isDonationRoute = pathname.startsWith("/donations");
  const isActive = pathname === href;
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsHovered(false), 200);
  };

  return (
    <div
      className="relative z-[100]"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        href={href}
        className={`group flex gap-2 items-center transition-all duration-200 relative ${
          isActive ? "text-gray-900" : "text-gray-500 hover:text-teal-600"
        }`}
      >
        <Icon className="w-5 h-5" />
        <span className="text-md font-medium">{label}</span>
        {dropdown && !isDonationRoute && (
          <ChevronDown className="w-4 h-4 mt-[2px]" />
        )}

        {/* Underline effect - posisi sedikit lebih bawah */}
        <span className="absolute left-0 w-0 h-0.5 bg-teal-600 transition-all duration-300 group-hover:w-full bottom-[-2px]" />
      </Link>

      {/* Dropdown menu */}
      {dropdown && isHovered && !isDonationRoute && (
        <div className="absolute left-0 mt-4 w-[420px] rounded-xl shadow-2xl bg-white border border-gray-200 z-40 top-full p-4 transition-all duration-200 ease-in-out transform scale-100 opacity-100">
          <ul className="grid grid-cols-2 gap-2">
            {categoryOptions.map((option) => (
              <li key={option.value}>
                <Link
                  href={`/donations/${option.value}`}
                  className="block px-4 py-2 rounded-md text-sm text-gray-700 hover:bg-teal-600 hover:text-white transition-colors"
                >
                  {option.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Main Header
export function Header() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const isLoading = status === "loading";

  return (
    <header className="sticky top-0 bg-white/80 backdrop-blur-md z-40 border-b border-gray-200">
      <nav className="container mx-auto flex justify-between items-center p-3 px-4">
        <Link
          href="/"
          className="text-2xl font-bold text-gray-900 flex items-center gap-2 pl-4"
        >
          <Image
            src="/LogoDonasiinnobg.png"
            alt="Donasiin Logo"
            width={150}
            height={150}
            className="object-contain"
          />
        </Link>

        <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
        </div>

        <div className="flex gap-2 md:gap-3 items-center">
          {isLoading ? (
            <div className="flex items-center justify-center w-[200px]">
              <LoaderCircle className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : user ? (
            <>
              <Link
                href="/chat"
                className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
              >
                <MessageCircle className="w-5 h-5" />
              </Link>
              <Link
                href="/profile"
                className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
              >
                <User className="w-5 h-5" />
              </Link>
              <Link
                href="/create-post"
                className="bg-gray-800 text-white flex items-center gap-2 px-3 py-2 rounded-lg font-semibold hover:bg-gray-900 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden md:inline text-sm">Share</span>
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="p-2 rounded-full hover:bg-rose-50 text-rose-500"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </>
          ) : (
            <Link
              href="/auth/login"
              className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors"
            >
              <LogIn className="w-5 h-5" />
              <span className="hidden md:inline font-semibold text-sm">
                Login
              </span>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
