"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const leftMessages = [
  "Have you donated today?",
  "Helping others is a joy!",
  "Let's make a change together!",
];

const rightMessages = [
  "Yes! Just this morning 😊",
  "I gave my unused items!",
  "Feels good to give back.",
];

export default function TalkingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const [leftIndex, setLeftIndex] = useState(0);
  const [rightIndex, setRightIndex] = useState(-1);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  useEffect(() => {
    if (!isInView) return;

    let timer: NodeJS.Timeout;

    const chatLoop = (step = 0) => {
      if (step % 2 === 0) {
        setShowRight(false);
        setShowLeft(true);
        setTimeout(() => {
          setLeftIndex((prev) => (prev + 1) % leftMessages.length);
        }, 100);
      } else {
        setShowLeft(false);
        setShowRight(true);
        setTimeout(() => {
          setRightIndex((prev) => (prev + 1) % rightMessages.length);
        }, 100);
      }

      timer = setTimeout(() => chatLoop(step + 1), 3000);
    };

    chatLoop();

    return () => clearTimeout(timer);
  }, [isInView]);

  return (
    <section
      ref={ref}
      className="relative py-24 text-black overflow-hidden min-h-screen"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://img.freepik.com/premium-photo/cartoon-illustration-park-with-wooden-bench-center-city-skyline-background_14117-893721.jpg"
          alt="background"
          className="w-full h-full object-cover brightness-95"
        />
        <div className="absolute inset-0 bg-white/30 backdrop-blur-xs"></div>
      </div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative text-4xl md:text-5xl font-extrabold text-center text-white mb-20 tracking-tight"
      >
        <motion.span
          animate={{
            scale: [1, 1.02, 1],
            opacity: [1, 0.9, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 4,
            ease: "easeInOut",
          }}
          className="relative inline-block px-4 py-2"
        >
          <span className="bg-gradient-to-r from-[#2a9d8f] to-[#264653] bg-clip-text text-transparent">
            Conversations that Matter
          </span>
        </motion.span>
      </motion.h2>

      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-12">
        {/* Left Person */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={isInView ? { x: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="w-full md:w-1/3 relative flex justify-center"
        >
          <motion.img
            src="https://static.vecteezy.com/system/resources/previews/037/168/909/original/people-doing-charity-volunteer-holding-donation-box-cartoon-character-png.png"
            alt="Person A"
            animate={
              showLeft
                ? {
                    rotate: [0, -2, 2, -2, 0],
                    scale: [1, 1.03, 1.02, 1.03, 1],
                    transition: { duration: 1 },
                  }
                : {}
            }
            className="w-full max-w-[260px]"
          />
          {showLeft && (
            <motion.div
              key={leftIndex}
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: -20, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="absolute -top-5 -right-4 bg-[#e0f7f4] px-5 py-3 rounded-xl shadow-md border border-[#2a9d8f] text-sm text-[#2a9d8f] max-w-[300px]
              before:content-[''] before:absolute before:top-full before:left-6 before:border-8 before:border-transparent before:border-t-[#e0f7f4]"
            >
              {leftMessages[leftIndex]}
            </motion.div>
          )}
        </motion.div>

        {/* Right Person */}
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={isInView ? { x: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="w-full md:w-1/3 relative flex justify-center"
        >
          <motion.img
            src="https://static.vecteezy.com/system/resources/previews/037/168/906/original/people-doing-charity-volunteer-holding-donation-box-cartoon-character-png.png"
            alt="Person B"
            animate={
              showRight
                ? {
                    rotate: [0, 2, -2, 2, 0],
                    scale: [1, 1.03, 1.02, 1.03, 1],
                    transition: { duration: 1 },
                  }
                : {}
            }
            className="w-full max-w-[260px]"
          />
          {showRight && (
            <motion.div
              key={rightIndex}
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: -20, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="absolute -top-4 -left-4 bg-[#edf4ff] px-5 py-3 rounded-xl shadow-md border border-[#3b82f6] text-sm text-[#3b82f6] max-w-[220px]
              before:content-[''] before:absolute before:top-full before:right-6 before:border-8 before:border-transparent before:border-t-[#edf4ff]"
            >
              {rightMessages[rightIndex]}
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
