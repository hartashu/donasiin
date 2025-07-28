'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, Plus, MessageCircle, House, Gift, LogOut, LogIn } from "lucide-react";

const navLinks = [
    { href: "/", icon: House, label: "Home" },
    { href: "/donations", icon: Gift, label: "Donations" },
];

export function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/users/me");

                console.log(res);

                if (res.ok) {
                    const { data } = await res.json();
                    if (data?.profile?._id || data?.profile?.email) setIsLoggedIn(true);
                }
            } catch (err) {
                console.error("User fetch error:", err);
            }
        })();
    }, []);

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", {
                method: "POST",
            });
            setIsLoggedIn(false);
            router.push("/auth/login");
        } catch (err) {
            console.error("Logout failed", err);
        }
    };

    return (
        <nav className="sticky top-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-200 flex justify-between items-center p-3 px-4 md:px-6 lg:px-8">
            <Link href="/" className="text-2xl font-bold">
                Donasiin
            </Link>

            <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
                {navLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex gap-2 items-center transition-colors ${isActive ? "text-black" : "text-gray-600 hover:text-black"
                                }`}
                        >
                            <link.icon className="w-5 h-5" />
                            <span className={`text-md font-medium ${isActive && "font-semibold"}`}>
                                {link.label}
                            </span>
                        </Link>
                    );
                })}
            </div>

            <div className="flex gap-3 md:gap-4 items-center">
                <Link href="/chat" className="p-2 rounded-full hover:bg-gray-100">
                    <MessageCircle className="w-6 h-6" />
                </Link>

                <Link href="/profile" className="p-2 rounded-full hover:bg-gray-100">
                    <User className="w-6 h-6" />
                </Link>

                <Link
                    href="/create-post"
                    className="bg-[#2a9d8f] text-white flex items-center gap-2 px-3 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                    <Plus className="w-5 h-5" />
                    <span className="hidden md:inline">Share</span>
                </Link>

                {isLoggedIn ? (
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 bg-[#e76f51] text-white px-3 py-2 rounded-lg hover:opacity-90 transition-opacity"
                    >
                        <LogOut className="w-6 h-6" />
                        <span className="hidden md:inline font-semibold">Logout</span>
                    </button>
                ) : (
                    <Link
                        href="/auth/login"
                        className="flex items-center gap-2 bg-[#2a9d8f] text-white px-3 py-2 rounded-lg hover:opacity-90 transition-opacity"
                    >
                        <LogIn className="w-6 h-6" />
                        <span className="hidden md:inline font-semibold">Login</span>
                    </Link>

                )}

            </div>
        </nav>
    );
}
