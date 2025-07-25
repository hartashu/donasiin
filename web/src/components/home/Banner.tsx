"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function Banner() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative min-h-screen flex items-center justify-center text-white overflow-hidden px-6 py-20 md:py-32">
      {/* Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src="https://www.rocketseed.com/wp-content/uploads/2012/11/Increase-donations-with-Rocketseed.webp"
          alt="Donation Background"
          className="w-full h-full object-cover object-center scale-105 brightness-75 transition-transform duration-[4000ms] ease-out hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-8">
        {/* Animated Heading */}
        <motion.h1
          ref={ref}
          className="text-2xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight max-w-6xl tracking-tight"
          initial={{ opacity: 0, y: 60 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1 }}
        >
          <motion.span
            className="block bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent"
            animate={{ y: [0, -10, 0] }}
            transition={{
              repeat: Infinity,
              duration: 3,
              ease: "easeInOut",
            }}
          >
            Give More Than Just Items,
          </motion.span>
          <motion.span
            className="inline-block bg-gradient-to-r from-emerald-300 to-teal-400 bg-clip-text text-transparent"
            animate={{ scale: [1, 1.05, 1], rotate: [0, -2, 2, 0] }}
            transition={{
              repeat: Infinity,
              duration: 5,
              ease: "easeInOut",
            }}
          >
            Share Hope
          </motion.span>{" "}
          <span className="text-white">with Every Donation</span>
        </motion.h1>

        {/* Description */}
        <motion.p
          className="text-md sm:text-lg md:text-xl text-white/90 max-w-2xl"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, duration: 1 }}
        >
          Small actions lead to big changes. Discover what you can give or
          receive — and build a more generous world, together.
        </motion.p>

        {/* Interactive Buttons */}
        <motion.div
          className="flex flex-wrap gap-4 pt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          {[
            { label: "Find an Item", href: "#items" },
            { label: "Donate an Item", href: "#donate" },
          ].map((btn, i) => (
            <Link key={i} href={btn.href}>
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.96 }}
                className="px-6 py-3 rounded-full font-semibold text-base text-white shadow-lg transition duration-300"
                style={{
                  backgroundColor: "#2a9d8f",
                  boxShadow:
                    "0 4px 20px rgba(42, 157, 143, 0.4), 0 0 0 0 rgba(0,0,0,0)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#248a7d")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#2a9d8f")
                }
              >
                {btn.label}
              </motion.button>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
