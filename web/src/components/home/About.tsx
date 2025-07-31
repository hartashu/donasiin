// src/components/home/About.tsx
"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { HeartHandshakeIcon, Recycle, Users } from "lucide-react"; // Menggunakan HeartHandshakeIcon

const features = [
  {
    icon: HeartHandshakeIcon, // Menggunakan HeartHands
    title: "Empower Communities",
    description:
      "Connect directly with those in need and provide items that make a real difference in their lives.",
  },
  {
    icon: Recycle,
    title: "Promote Sustainability",
    description:
      "Give your pre-loved items a second life, reducing waste and contributing to a circular economy.",
  },
  {
    icon: Users,
    title: "Build Connections",
    description:
      "Join a growing community of givers and receivers, fostering a culture of generosity and support.",
  },
];

export default function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" ref={ref} className="bg-gray-50 py-20 sm:py-24">
      <div className="container mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Our Mission is Simple
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            To make giving and receiving as easy as a conversation, creating a
            world where everyone has what they need to thrive.
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                className="flex flex-col items-center"
              >
                <div className="bg-gray-100 p-4 rounded-full">
                  <Icon className="w-8 h-8 text-gray-800" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-gray-500">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
