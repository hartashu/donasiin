"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";

export default function Banner() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative h-screen flex items-center justify-center text-white overflow-hidden p-4 text-center">
      <div className="absolute inset-0 z-0">
        <Image
          src="https://www.rocketseed.com/wp-content/uploads/2012/11/Increase-donations-with-Rocketseed.webp"
          alt="Donation Background"
          fill
          priority
          className="object-cover brightness-50"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>
      <div className="relative z-10 flex flex-col items-center space-y-6">
        <motion.h1
          ref={ref}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight max-w-4xl"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <motion.span
            className="block bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent"
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          >
            Give More Than Just Items,
          </motion.span>
          <motion.span
            className="inline-block bg-gradient-to-r from-emerald-300 to-teal-400 bg-clip-text text-transparent"
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
          >
            Share Hope
          </motion.span>{" "}
          <span className="text-white">with Every Donation</span>
        </motion.h1>
        <motion.p
          className="text-md md:text-xl text-white/90 max-w-2xl"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          Small actions lead to big changes. Discover and build a more generous world, together.
        </motion.p>
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <Link href="/donations" className="px-8 py-3 rounded-full font-semibold text-base bg-brand text-white shadow-lg hover:bg-brand-dark transition-colors">
            Find an Item
          </Link>
          <Link href="/create-post" className="px-8 py-3 rounded-full font-semibold text-base bg-white/20 text-white border border-white/50 backdrop-blur-sm hover:bg-white/30 transition-colors">
            Donate an Item
          </Link>
        </motion.div>
      </div>
    </section>
  );
}