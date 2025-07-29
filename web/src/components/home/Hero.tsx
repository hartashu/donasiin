"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";

export default function Hero() {
    return (
        <section className="relative h-[90vh] flex items-center justify-center text-center text-brand-offwhite p-4">
            <div className="relative z-10 flex flex-col items-center space-y-8">
                <motion.h1
                    className="font-serif text-5xl md:text-8xl font-black leading-tight"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    Give, Share, <span className="text-brand-light">Thrive</span>.
                </motion.h1>

                <motion.p
                    className="text-lg md:text-2xl max-w-3xl text-green-100/80"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
                >
                    Join a community where every item finds a new purpose and every act of kindness creates a ripple of change.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
                >
                    <Link href="/donations" className="inline-block bg-brand text-white font-bold rounded-full py-4 px-10 text-lg transition-transform hover:scale-105 shadow-lg">
                        Explore Items
                    </Link>
                </motion.div>
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 1 }} className="absolute bottom-10">
                <ArrowDown className="w-6 h-6 text-white/50 animate-bounce" />
            </motion.div>
        </section>
    );
}