'use client';

import { Suspense } from "react";
import { MailCheck } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

// 1. Create a new child component for the dynamic content
function VerifyNoticeContent() {
    const searchParams = useSearchParams();
    const success = searchParams.get("success");
    const error = searchParams.get("error");

    // 2. All the JSX that depends on the search params goes here
    return (
        <main className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
            <div
                className="absolute inset-0 z-0"
                style={{
                    background: 'linear-gradient(225deg,rgb(9, 62, 50), rgb(9, 62, 50), rgb(142, 202, 195), rgb(2, 54, 42), rgb(9, 62, 50), rgb(142, 202, 195), rgb(9, 62, 50), rgb(255, 255, 255), rgb(255, 255, 255))',
                    backgroundSize: '400% 400%',
                    animation: 'gradient-flow 90s ease infinite',
                }}
            />

            <div className="relative z-10 flex flex-col items-center justify-center w-full">
                <div className="max-w-md w-full animate-subtle-float">
                    <div className="bg-white/60 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/20 text-center">
                        <div className="flex justify-center mb-4">
                            <MailCheck className="w-16 h-16 text-[#2a9d8f]" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Verify Notice</h1>

                        {success && (
                            <p className="text-green-700 mt-4 font-medium">{success}</p>
                        )}
                        {error && (
                            <p className="text-red-700 mt-4 font-medium">{error}</p>
                        )}
                        <p className="text-gray-700 mt-2">
                            {error ? "Please try to register again." : "You can now log in to your account."}
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}

// 3. The main page component becomes a simple wrapper
export default function VerifyNoticePage() {
    return (
        // 4. Wrap the dynamic child component in <Suspense>
        //    This tells Next.js to load this part on the client-side.
        <Suspense>
            <VerifyNoticeContent />
        </Suspense>
    );
}