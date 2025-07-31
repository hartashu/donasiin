import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import ClientLayout from "./ClientLayout";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["700", "900"],
});

export const metadata: Metadata = {
  title: "Donasiin",
  description: "Berbagi kebaikan, ciptakan perubahan.",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans`}>
        <SessionProvider>
          <ClientLayout>{children}</ClientLayout>
          <Toaster position="top-center" />
        </SessionProvider>
      </body>
    </html>
  );
}
