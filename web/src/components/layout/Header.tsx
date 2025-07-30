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
} from "lucide-react";

const navLinks = [
  { href: "/", icon: House, label: "Home" },
  { href: "/donations", icon: Gift, label: "Donations" },
  { href: "/#about", icon: Info, label: "About Us" },
  { href: "/#stories", icon: BookOpen, label: "Stories" },
];

const NavLink = ({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
}) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      className={`flex gap-2 items-center transition-colors ${
        isActive ? "text-gray-900" : "text-gray-500 hover:text-gray-900"
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className={`text-md font-medium ${isActive && "font-semibold"}`}>
        {label}
      </span>
    </Link>
  );
};

export function Header() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const isLoading = status === "loading";

  return (
    <header className="sticky top-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-200">
      <nav className="container mx-auto flex justify-between items-center p-3 px-4">
        <Link href="/" className="text-2xl font-bold text-gray-900">
          Donasiin
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
