"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, animate } from "framer-motion";
import { Globe, Leaf, Users, Gift, Sparkles } from "lucide-react";
import * as THREE from 'three';

const QUOTES = [
  "A single act of kindness throws out roots in all directions.",
  "Giving is not just about making a donation. It is about making a difference.",
  "No one has ever become poor by giving.",
  "From what we get, we can make a living; what we give, however, makes a life.",
];

export default function Witness() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalCarbonSavedKg: "0.00",
  });
  const [quote, setQuote] = useState(QUOTES[0]);

  const countRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const inViewRef = useRef(null);
  const isInView = useInView(inViewRef, { once: true, margin: "-100px" });
  const globeRef = useRef<HTMLDivElement>(null);
  const globeInstance = useRef<THREE.Mesh>();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats/home');
        const { data } = await res.json();
        if (data) setStats(data);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    if (isInView && stats.totalUsers > 0) {
      const targets = [stats.totalUsers, parseFloat(stats.totalCarbonSavedKg), stats.totalPosts];
      countRefs.current.forEach((ref, i) => {
        if (ref) {
          animate(0, targets[i], {
            duration: 2.5,
            onUpdate: (v) => {
              if (i === 1) {
                ref.textContent = v.toFixed(2);
              } else {
                ref.textContent = Math.floor(v).toLocaleString();
              }
            },
          });
        }
      });
    }
  }, [isInView, stats]);

  useEffect(() => {
    const currentGlobeRef = globeRef.current;
    if (!currentGlobeRef || globeInstance.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, currentGlobeRef.clientWidth / currentGlobeRef.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(currentGlobeRef.clientWidth, currentGlobeRef.clientHeight);
    currentGlobeRef.appendChild(renderer.domElement);

    const geometry = new THREE.SphereGeometry(1.5, 64, 64);

    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load('/earth-texture.jpg');
    const material = new THREE.MeshStandardMaterial({ map: earthTexture });

    const globe = new THREE.Mesh(geometry, material);
    globeInstance.current = globe;
    scene.add(globe);

    const ambientLight = new THREE.AmbientLight(0xffffff, 2.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    camera.position.z = 4;

    const animationLoop = () => {
      requestAnimationFrame(animationLoop);
      globe.rotation.y += 0.001;
      renderer.render(scene, camera);
    };
    animationLoop();

    const handleResize = () => {
      if (currentGlobeRef) {
        camera.aspect = currentGlobeRef.clientWidth / currentGlobeRef.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(currentGlobeRef.clientWidth, currentGlobeRef.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (currentGlobeRef && renderer.domElement) {
        currentGlobeRef.removeChild(renderer.domElement);
      }
    }
  }, []);

  const handleInteractWithGlobe = () => {
    if (globeInstance.current) {
      globeInstance.current.rotation.y += Math.PI / 2;
    }
  };

  const shuffleQuote = () => {
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  };

  const statItems = [
    { label: "Total Users", icon: <Users size={36} className="mx-auto mb-2 text-[#2a9d8f]" /> },
    { label: "Carbon Saved (Kg)", icon: <Leaf size={36} className="mx-auto mb-2 text-green-500" /> },
    { label: "Total Items Shared", icon: <Gift size={36} className="mx-auto mb-2 text-[#e76f51]" /> },
  ];

  return (
    <section className="bg-white text-black px-6 py-20 space-y-16 relative overflow-hidden">
      <div className="max-w-5xl mx-auto text-center space-y-4">
        <h2 className="text-4xl md:text-5xl font-bold font-serif text-[#1e3932]">
          Your Ripple Effect
        </h2>
        <p className="text-gray-600 text-lg max-w-xl mx-auto">
          Every click, share, and donation makes the world greener. Watch your
          impact grow in real-time.
        </p>
      </div>

      <div ref={inViewRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto text-center">
        {statItems.map((item, i) => (
          <div key={item.label} className="bg-gray-50 border p-6 rounded-2xl hover:shadow-xl transition">
            {item.icon}
            <h3 className="text-4xl font-extrabold text-[#1e3932]">
              <span ref={(el) => { if (el) countRefs.current[i] = el; }}>0</span>
            </h3>
            <p className="text-lg mt-2">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="max-w-xl mx-auto text-center mt-12">
        <div ref={globeRef} className="w-full h-64 md:h-80 cursor-grab active:cursor-grabbing"></div>
        <button className="mt-4 px-6 py-3 bg-[#2a9d8f] text-white rounded-xl shadow-lg hover:shadow-2xl flex items-center gap-2 mx-auto" onClick={handleInteractWithGlobe}>
          <Globe className="w-5 h-5" /> Interact with Earth
        </button>
      </div>

      <div className="max-w-3xl mx-auto text-center mt-16">
        <Sparkles className="mx-auto text-yellow-500 mb-2" size={30} />
        <p className="text-xl font-medium italic text-gray-700 mb-4 h-20 flex items-center justify-center">
          “{quote}”
        </p>
        <button onClick={shuffleQuote} className="text-sm px-4 py-2 border border-gray-400 rounded-full hover:bg-gray-100 transition">
          🔄 Inspire Me Again
        </button>
      </div>
    </section>
  );
}