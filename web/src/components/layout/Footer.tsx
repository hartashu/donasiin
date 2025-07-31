import Link from "next/link";
import { Facebook, Instagram, Twitter, Mail } from "lucide-react";

const FooterLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => (
  <Link
    href={href}
    className="text-sm text-gray-600 hover:text-teal-600 transition-colors duration-200"
  >
    {children}
  </Link>
);

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-12">
          {/* Brand Column */}
          <div className="md:col-span-2 lg:col-span-2">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">Donasiin</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              Sharing kindness, creating positive change. Join us in making a
              difference, one donation at a time.
            </p>
            <div className="flex space-x-3">
              {[
                {
                  icon: <Facebook className="w-4 h-4" />,
                  label: "Facebook",
                  color: "hover:bg-blue-600",
                },
                {
                  icon: <Twitter className="w-4 h-4" />,
                  label: "Twitter",
                  color: "hover:bg-sky-500",
                },
                {
                  icon: <Instagram className="w-4 h-4" />,
                  label: "Instagram",
                  color: "hover:bg-pink-500",
                },
                {
                  icon: <Mail className="w-4 h-4" />,
                  label: "Email",
                  color: "hover:bg-green-600",
                },
              ].map((item, idx) => (
                <a
                  key={idx}
                  href="#"
                  aria-label={item.label}
                  className={`p-2 rounded-full bg-gray-200 text-gray-600 transition-colors ${item.color}`}
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col space-y-2">
            <h4 className="text-sm font-semibold uppercase text-gray-500 mb-2 tracking-wide">
              Navigation
            </h4>
            <FooterLink href="/">Home</FooterLink>
            <FooterLink href="/donations">Donations</FooterLink>
            <FooterLink href="/#stories">Stories</FooterLink>
            <FooterLink href="/#about">About Us</FooterLink>
            <FooterLink href="/#stats">Statistics</FooterLink>
          </div>

          {/* Account */}
          <div className="flex flex-col space-y-2">
            <h4 className="text-sm font-semibold uppercase text-gray-500 mb-2 tracking-wide">
              Account
            </h4>
            <FooterLink href="/profile">My Profile</FooterLink>
            <FooterLink href="/auth/register">Register</FooterLink>
            <FooterLink href="/auth/login">Login</FooterLink>
            <FooterLink href="/auth/forgot-password">
              Forgot Password
            </FooterLink>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-semibold uppercase text-gray-500 mb-2 tracking-wide">
              Stay Updated
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Subscribe to get the latest news and inspiring stories.
            </p>
            <form className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 w-full px-4 py-2 rounded-md border border-gray-300 text-sm text-gray-800 placeholder-gray-400 focus:ring-1 focus:ring-teal-400 focus:border-teal-400"
              />
              <button
                type="submit"
                className="px-5 py-2 bg-teal-600 text-white text-sm rounded-md hover:bg-teal-700 focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-6 border-t pt-4 pb-4 border-gray-200 text-center text-xs text-gray-500 ">
        <p>&copy; {new Date().getFullYear()} Donasiin. All rights reserved.</p>
        <p>Crafted with care by the Donasiin team & community.</p>
      </div>
    </footer>
  );
}
