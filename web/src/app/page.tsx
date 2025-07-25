"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";

export default function Home() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sectionRef.current) {
      gsap.fromTo(
        sectionRef.current.querySelectorAll(".fade-up"),
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.2,
          ease: "power3.out",
        }
      );
    }
  }, []);

  return (
    <div className="relative overflow-x-hidden text-white font-sans">
      {/* Animated Gradient Background */}
      <div className="fixed top-0 left-0 w-full h-full z-[-1] animate-gradient bg-gradient-to-br from-[#003d2b] via-[#0d5e4c] to-[#01140e] bg-[length:400%_400%]" />

      {/* Hero Section */}
      <section
        ref={sectionRef}
        className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-green-800/80"
      >
        <motion.h1
          className="text-4xl md:text-6xl font-bold fade-up text-black leading-tight"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Transform Lives, One Donation at a Time
        </motion.h1>
        <motion.p className="mt-4 text-black max-w-xl mx-auto fade-up text-base md:text-lg">
          Your generosity creates ripples of positive change. Discover items to
          give, or find what you need, and connect with a compassionate
          community.
        </motion.p>
        <div className="flex flex-col sm:flex-row gap-4 mt-8 fade-up">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2 bg-white text-green-800 font-semibold rounded-full transition"
          >
            Find an item
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2 bg-white text-green-800 font-semibold rounded-full transition"
          >
            Donate an item
          </motion.button>
        </div>
      </section>

      <section>
        <div>
          
        </div>
      </section>
    </div>
  );
}
