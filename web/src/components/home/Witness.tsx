"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, animate } from "framer-motion";
import { Trees, Heart, Users, Sparkles } from "lucide-react";

const QUOTES = [
  "A single act of kindness throws out roots in all directions.",
  "Giving is not just about making a donation. It is about making a difference.",
  "No one has ever become poor by giving.",
  "From what we get, we can make a living; what we give, however, makes a life.",
];

export default function Witness() {
  const [stats, setStats] = useState({
    livesTouched: 1234,
    seedsPlanted: 567,
    giftsToday: 89,
    treesPlanted: 321,
  });

  const [treesPlanted, setTreesPlanted] = useState(stats.treesPlanted);
  const [clickCount, setClickCount] = useState(0);
  const [quote, setQuote] = useState(QUOTES[0]);
  const countRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const inViewRef = useRef(null);
  const isInView = useInView(inViewRef, { once: true });

  useEffect(() => {
    if (isInView) {
      const targets = [
        stats.livesTouched,
        stats.seedsPlanted,
        stats.giftsToday,
      ];
      countRefs.current.forEach((ref, i) => {
        if (ref) {
          animate(0, targets[i], {
            duration: 2,
            onUpdate: (v) => (ref.textContent = Math.floor(v).toLocaleString()),
          });
        }
      });
    }
  }, [isInView, stats]);

  const handlePlantTree = () => {
    setClickCount((prev) => prev + 1);
    setTreesPlanted((prev) => prev + 1);
  };

  const percent = Math.min((treesPlanted / 10000) * 100, 100);

  const shuffleQuote = () => {
    const next = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    setQuote(next);
  };

  return (
    <section className="bg-white text-black px-6 py-20 space-y-16 relative overflow-hidden">
      <motion.div
        className="max-w-5xl mx-auto text-center space-y-4"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <motion.h2
          className="text-4xl md:text-5xl font-bold font-serif"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
        >
          🌱 Your Ripple Effect
        </motion.h2>
        <motion.p
          className="text-gray-600 text-lg max-w-xl mx-auto"
          whileHover={{ scale: 1.02 }}
        >
          Every click, share, and donation makes the world greener. Watch your
          impact grow in real-time.
        </motion.p>
      </motion.div>

      <div
        ref={inViewRef}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto text-center"
      >
        {[
          {
            label: "Lives Touched",
            icon: <Users className="mx-auto mb-2 text-[#2a9d8f]" size={36} />,
          },
          {
            label: "Seeds Planted",
            icon: <Heart className="mx-auto mb-2 text-[#e76f51]" size={36} />,
          },
          {
            label: "Gifts Today",
            icon: <Trees className="mx-auto mb-2 text-[#264653]" size={36} />,
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            className="bg-gray-50 border p-6 rounded-2xl hover:shadow-xl transition group"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: i * 0.2 }}
            viewport={{ once: true }}
          >
            {item.icon}
            <motion.h3 className="text-4xl font-extrabold text-[#2a9d8f] transition group-hover:scale-110">
              0
            </motion.h3>
            <p className="text-lg mt-2">{item.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="max-w-2xl mx-auto text-center mt-12">
        <p className="text-lg font-medium mb-2">🌳 Trees Planted</p>
        <div className="relative w-full bg-gray-200 rounded-full h-5 overflow-hidden mb-2">
          <motion.div
            className="h-full bg-[#2a9d8f]"
            style={{ width: `${percent}%` }}
            initial={{ width: "0%" }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 1.5 }}
          />
        </div>
        <p className="text-sm text-gray-600">
          {treesPlanted.toLocaleString()} / 10,000 trees
        </p>

        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          className="mt-4 px-6 py-3 bg-[#2a9d8f] text-white rounded-xl shadow-lg hover:shadow-2xl"
          onClick={handlePlantTree}
        >
          🌱 Plant a Tree
        </motion.button>

        {clickCount > 0 && (
          <motion.p
            className="mt-2 text-sm text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            You've planted {clickCount} trees! 🌳
          </motion.p>
        )}
      </div>

      {/* Tambahan fitur interaktif quotes */}
      <div className="max-w-3xl mx-auto text-center mt-16">
        <Sparkles className="mx-auto text-yellow-500 mb-2" size={30} />
        <motion.p
          className="text-xl font-medium italic text-gray-700 mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          “{quote}”
        </motion.p>
        <motion.button
          onClick={shuffleQuote}
          className="text-sm px-4 py-2 border border-gray-400 rounded-full hover:bg-gray-100 transition"
          whileHover={{ scale: 1.05 }}
        >
          🔄 Inspire Me Again
        </motion.button>
      </div>
    </section>
  );
}
