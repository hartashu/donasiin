// src/components/layout/Footer.tsx

import Link from "next/link";

const FooterLink = ({ href, children }: { href: string, children: React.ReactNode }) => (
    <Link href={href} className="text-gray-500 hover:text-gray-900 transition-colors">
        {children}
    </Link>
);

export function Footer() {
    return (
        <footer className="bg-white border-t border-gray-200">
            <div className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Column 1: Logo & Slogan */}
                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Donasiin</h3>
                        <p className="text-gray-500 max-w-xs">
                            Sharing kindness, creating change. One item at a time.
                        </p>
                    </div>

                    {/* Column 2: Navigation Links */}
                    <div className="flex justify-center">
                        <div>
                            <h4 className="font-semibold uppercase text-gray-400 tracking-wider mb-4">Navigation</h4>
                            <nav className="flex flex-col items-center md:items-start space-y-2">
                                <FooterLink href="/">Home</FooterLink>
                                <FooterLink href="/donations">Donations</FooterLink>
                                <FooterLink href="/#stories">Stories</FooterLink>
                                <FooterLink href="/#about">About Us</FooterLink>
                                <FooterLink href="/#stats">Statistics</FooterLink>
                            </nav>
                        </div>
                    </div>

                    {/* Column 3: Account Links */}
                    <div className="flex justify-center md:justify-end">
                        <div>
                            <h4 className="font-semibold uppercase text-gray-400 tracking-wider mb-4">Account</h4>
                            <nav className="flex flex-col items-center md:items-start space-y-2">
                                <FooterLink href="/profile">My Profile</FooterLink>
                                <FooterLink href="/auth/register">Register</FooterLink>
                                <FooterLink href="/auth/login">Login</FooterLink>
                                <FooterLink href="/auth/forgot-password">Forgot Password</FooterLink>
                            </nav>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100 mt-12 pt-6 text-center text-sm text-gray-400">
                    <p>&copy; {new Date().getFullYear()} Donasiin. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
}