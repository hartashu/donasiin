// // "use client";

// // import { useEffect, useRef, useState } from "react";
// // import { animate, motion, useInView } from "framer-motion";
// // import { Leaf, Users, Gift, Sparkles } from "lucide-react";
// // import * as THREE from "three";

// // const QUOTES = [
// //   "A single act of kindness throws out roots in all directions.",
// //   "Giving is not just about making a donation. It is about making a difference.",
// //   "No one has ever become poor by giving.",
// //   "From what we get, we can make a living; what we give, however, makes a life.",
// // ];

// // const statItems = [
// //   { label: "Total Users", icon: Users, color: "text-sky-500" },
// //   { label: "Carbon Saved (Kg)", icon: Leaf, color: "text-emerald-500" },
// //   { label: "Items Shared", icon: Gift, color: "text-rose-500" },
// // ];

// // const CSSGlobeFallback = () => (
// //   <div className="w-64 h-64 rounded-full relative overflow-hidden bg-blue-600">
// //     <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-black/20"></div>
// //     <div
// //       className="absolute inset-[-50%] w-[200%] h-[200%] bg-[conic-gradient(from_90deg_at_50%_50%,#FFFFFF33_0%,#FFFFFF00_20%,#FFFFFF00_80%,#FFFFFF33_100%)] animate-spin"
// //       style={{ animationDuration: '10s' }}
// //     ></div>
// //   </div>
// // );

// // export default function Witness() {
// //   const [stats, setStats] = useState({ totalUsers: 0, totalPosts: 0, totalCarbonSavedKg: "0.00" });
// //   const [quote, setQuote] = useState(QUOTES[0]);
// //   const ref = useRef<HTMLDivElement | null>(null);
// //   const isInView = useInView(ref, { once: true, margin: "-100px" });
// //   const countRefs = useRef<Array<HTMLSpanElement | null>>([]);
// //   const globeRef = useRef<HTMLDivElement | null>(null);

// //   useEffect(() => {
// //     fetch("/api/stats/home")
// //       .then(res => res.json())
// //       .then(({ data }) => { if (data) setStats(data) })
// //       .catch(err => console.error("Failed to fetch stats:", err));
// //   }, []);

// //   useEffect(() => {
// //     if (isInView && stats.totalUsers > 0) {
// //       const targets = [stats.totalUsers, parseFloat(stats.totalCarbonSavedKg), stats.totalPosts];
// //       countRefs.current.forEach((el, i) => {
// //         if (el) {
// //           animate(0, targets[i], {
// //             duration: 2.5,
// //             onUpdate: (v) => {
// //               el.textContent = i === 1 ? v.toFixed(1) : Math.floor(v).toLocaleString();
// //             },
// //           });
// //         }
// //       });
// //     }
// //   }, [stats, isInView]);

// //   useEffect(() => {
// //     if (!globeRef.current) return;
// //     let animationFrameId: number;
// //     let isTextureLoaded = false;

// //     const scene = new THREE.Scene();
// //     const camera = new THREE.PerspectiveCamera(45, globeRef.current.clientWidth / globeRef.current.clientHeight, 0.1, 1000);
// //     const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
// //     renderer.setSize(globeRef.current.clientWidth, globeRef.current.clientHeight);
// //     globeRef.current.appendChild(renderer.domElement);

// //     const geometry = new THREE.SphereGeometry(1.5, 32, 32);
// //     const material = new THREE.MeshStandardMaterial();
// //     let globe = new THREE.Mesh(geometry, material);
// //     scene.add(globe);

// //     const textureLoader = new THREE.TextureLoader();
// //     textureLoader.load(
// //       '/earth-texture.jpg',
// //       (texture) => {
// //         material.map = texture;
// //         material.needsUpdate = true;
// //         isTextureLoaded = true;
// //       },
// //       undefined,
// //       (error) => {
// //         console.error('Texture failed to load, CSS fallback will be visible.');
// //       }
// //     );

// //     scene.add(new THREE.AmbientLight(0xffffff, 2.5));
// //     const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
// //     dirLight.position.set(5, 3, 5);
// //     scene.add(dirLight);
// //     camera.position.z = 4;

// //     const animateGlobe = () => {
// //       animationFrameId = requestAnimationFrame(animateGlobe);
// //       globe.rotation.y += 0.001;
// //       renderer.render(scene, camera);
// //     };
// //     animateGlobe();

// //     const handleResize = () => {
// //       if (globeRef.current) {
// //         camera.aspect = globeRef.current.clientWidth / globeRef.current.clientHeight;
// //         camera.updateProjectionMatrix();
// //         renderer.setSize(globeRef.current.clientWidth, globeRef.current.clientHeight);
// //       }
// //     };
// //     window.addEventListener('resize', handleResize);

// //     return () => {
// //       window.removeEventListener('resize', handleResize);
// //       cancelAnimationFrame(animationFrameId);
// //       if (globeRef.current && globeRef.current.contains(renderer.domElement)) {
// //         globeRef.current.removeChild(renderer.domElement);
// //       }
// //     };
// //   }, []);

// //   const shuffleQuote = () => {
// //     const random = Math.floor(Math.random() * QUOTES.length);
// //     setQuote(QUOTES[random]);
// //   };

// //   return (
// //     <section id="stats" ref={ref} className="bg-gray-50 px-6 py-20 sm:py-24">
// //       <div className="container mx-auto">
// //         <motion.div
// //           initial={{ opacity: 0, y: 20 }}
// //           animate={isInView ? { opacity: 1, y: 0 } : {}}
// //           transition={{ duration: 0.6 }}
// //           className="text-center"
// //         >
// //           <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
// //             Our Collective Impact
// //           </h2>
// //           <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
// //             Every click, share, and donation makes the world greener. Watch our community's impact grow in real-time.
// //           </p>
// //         </motion.div>

// //         <div className="mt-16 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
// //           {/* Stats */}
// //           <div className="w-full lg:w-1/4 space-y-6">
// //             {statItems.map((item, i) => (
// //               <motion.div
// //                 key={item.label}
// //                 initial={{ opacity: 0, x: -30 }}
// //                 animate={isInView ? { opacity: 1, x: 0 } : {}}
// //                 transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
// //                 className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-xl hover:scale-105 transition-all duration-300 text-center"
// //               >
// //                 <item.icon size={32} className={`mx-auto mb-3 ${item.color}`} />
// //                 <h3 className="text-3xl font-extrabold text-gray-900">
// //                   <span ref={(el) => { countRefs.current[i] = el; }}>0</span>
// //                 </h3>
// //                 <p className="text-sm text-gray-500 mt-1">{item.label}</p>
// //               </motion.div>
// //             ))}
// //           </div>

// //           {/* Globe */}
// //           <motion.div
// //             initial={{ opacity: 0, scale: 0.8 }}
// //             animate={isInView ? { opacity: 1, scale: 1 } : {}}
// //             transition={{ duration: 0.8, delay: 0.3 }}
// //             className="w-full lg:w-1/2 flex justify-center items-center h-80 lg:h-96"
// //           >
// //             <div ref={globeRef} className="w-full h-full cursor-grab active:cursor-grabbing relative">
// //               {/* Fallback akan tertutup oleh canvas Three.js jika berhasil dimuat */}
// //               <div className="absolute inset-0 flex items-center justify-center">
// //                 <CSSGlobeFallback />
// //               </div>
// //             </div>
// //           </motion.div>

// //           {/* Quote */}
// //           <motion.div
// //             initial={{ opacity: 0, x: 30 }}
// //             animate={isInView ? { opacity: 1, x: 0 } : {}}
// //             transition={{ duration: 0.5, delay: 0.4 }}
// //             className="w-full lg:w-1/4 text-center lg:text-left"
// //           >
// //             <Sparkles className="mx-auto lg:mx-0 text-amber-500 mb-2" size={30} />
// //             <p className="text-xl font-medium italic text-gray-700 mb-4 h-24 flex items-center">
// //               “{quote}”
// //             </p>
// //             <button
// //               onClick={shuffleQuote}
// //               className="text-sm px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-100 transition"
// //             >
// //               Inspire Me Again
// //             </button>
// //           </motion.div>
// //         </div>
// //       </div>
// //     </section>
// //   );
// // }

// // src/components/home/Witness.tsx
// "use client";

// import { useEffect, useRef, useState } from "react";
// import { animate, motion, useInView } from "framer-motion";
// import { Leaf, Users, Gift, Sparkles } from "lucide-react";
// import * as THREE from "three";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// const QUOTES = [
//   "A single act of kindness throws out roots in all directions.",
//   "Giving is not just about making a donation. It is about making a difference.",
//   "No one has ever become poor by giving.",
//   "From what we get, we can make a living; what we give, however, makes a life.",
// ];

// const statItems = [
//   { label: "Total Users", icon: Users, color: "text-sky-500" },
//   { label: "Carbon Saved (Kg)", icon: Leaf, color: "text-emerald-500" },
//   { label: "Items Shared", icon: Gift, color: "text-rose-500" },
// ];

// // Fungsi untuk membuat satu pohon 3D
// const createTree = () => {
//   const trunk = new THREE.Mesh(
//     new THREE.CylinderGeometry(0.02, 0.03, 0.2, 5),
//     new THREE.MeshStandardMaterial({ color: 0x8B4513 }) // Coklat
//   );
//   const leaves = new THREE.Mesh(
//     new THREE.ConeGeometry(0.1, 0.3, 6),
//     new THREE.MeshStandardMaterial({ color: 0x228B22 }) // Hijau Hutan
//   );
//   // Posisikan dasar kerucut daun tepat di atas batang.
//   leaves.position.y = 0.25;

//   const tree = new THREE.Group();
//   tree.add(trunk);
//   tree.add(leaves);
//   return tree;
// };

// export default function Witness() {
//   const [stats, setStats] = useState({ totalUsers: 0, totalPosts: 0, totalCarbonSavedKg: "0.00" });
//   const [quote, setQuote] = useState(QUOTES[0]);
//   const ref = useRef<HTMLDivElement | null>(null);
//   const isInView = useInView(ref, { once: true, margin: "-100px" });
//   const countRefs = useRef<Array<HTMLSpanElement | null>>([]);
//   const globeRef = useRef<HTMLDivElement | null>(null);

//   const threeRef = useRef<{
//     scene?: THREE.Scene,
//     camera?: THREE.PerspectiveCamera,
//     renderer?: THREE.WebGLRenderer,
//     globe?: THREE.Mesh,
//     controls?: OrbitControls
//   }>({});

//   useEffect(() => {
//     fetch("/api/stats/home")
//       .then(res => res.json())
//       .then(({ data }) => { if (data) setStats(data) })
//       .catch(err => console.error("Failed to fetch stats:", err));
//   }, []);

//   useEffect(() => {
//     if (isInView && stats.totalUsers > 0) {
//       const targets = [stats.totalUsers, parseFloat(stats.totalCarbonSavedKg), stats.totalPosts];
//       countRefs.current.forEach((el, i) => {
//         if (el) {
//           animate(0, targets[i], {
//             duration: 2.5,
//             onUpdate: (v) => {
//               el.textContent = i === 1 ? v.toFixed(1) : Math.floor(v).toLocaleString();
//             },
//           });
//         }
//       });
//     }
//   }, [stats, isInView]);

//   useEffect(() => {
//     if (!globeRef.current || threeRef.current.scene) return;

//     const scene = new THREE.Scene();
//     const camera = new THREE.PerspectiveCamera(45, globeRef.current.clientWidth / globeRef.current.clientHeight, 0.1, 1000);
//     const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
//     renderer.setSize(globeRef.current.clientWidth, globeRef.current.clientHeight);
//     globeRef.current.appendChild(renderer.domElement);

//     const controls = new OrbitControls(camera, renderer.domElement);
//     controls.enableDamping = true;
//     controls.enablePan = false;
//     controls.enableZoom = false;
//     controls.autoRotate = true;
//     controls.autoRotateSpeed = 0.5;

//     const geometry = new THREE.SphereGeometry(1.5, 32, 32);
//     const fallbackMaterial = new THREE.MeshStandardMaterial({
//       color: 0xcccccc,
//       metalness: 0.2,
//       roughness: 0.8,
//     });
//     const globe = new THREE.Mesh(geometry, fallbackMaterial);
//     scene.add(globe);

//     scene.add(new THREE.AmbientLight(0xffffff, 2.5));
//     const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
//     dirLight.position.set(5, 3, 5);
//     scene.add(dirLight);
//     camera.position.z = 4;

//     threeRef.current = { scene, camera, renderer, globe, controls };

//     const handleResize = () => {
//       if (globeRef.current) {
//         camera.aspect = globeRef.current.clientWidth / globeRef.current.clientHeight;
//         camera.updateProjectionMatrix();
//         renderer.setSize(globeRef.current.clientWidth, globeRef.current.clientHeight);
//       }
//     };
//     window.addEventListener('resize', handleResize);

//     let animationFrameId: number;
//     const animateGlobe = () => {
//       animationFrameId = requestAnimationFrame(animateGlobe);
//       controls.update();
//       renderer.render(scene, camera);
//     };
//     animateGlobe();

//     return () => {
//       window.removeEventListener('resize', handleResize);
//       cancelAnimationFrame(animationFrameId);
//       if (globeRef.current && globeRef.current.contains(renderer.domElement)) {
//         globeRef.current.removeChild(renderer.domElement);
//       }
//     };
//   }, []);

//   useEffect(() => {
//     const { globe } = threeRef.current;
//     if (!globe) return;

//     while (globe.children.length > 0) {
//       globe.remove(globe.children[0]);
//     }

//     const textureLoader = new THREE.TextureLoader();
//     textureLoader.load(
//       '/earth-texture.jpg',
//       (texture) => {
//         if (globe.material instanceof THREE.MeshStandardMaterial) {
//           globe.material.map = texture;
//           globe.material.needsUpdate = true;
//         }
//       },
//       undefined,
//       (error) => console.error('Texture failed to load, using fallback material.')
//     );

//     const carbonSavedForTesting = parseFloat(stats.totalCarbonSavedKg) || 500;
//     const treesToGrow = Math.min(Math.floor(carbonSavedForTesting / 21), 150);

//     for (let i = 0; i < treesToGrow; i++) {
//       const tree = createTree();
//       const phi = Math.acos(-1 + (2 * Math.random()));
//       const theta = Math.sqrt(4 * Math.PI) * Math.random();
//       const position = new THREE.Vector3();
//       position.setFromSphericalCoords(1.5, phi, theta);
//       tree.position.copy(position);
//       tree.lookAt(0, 0, 0);
//       // PERBAIKAN DI SINI: Rotasi ke arah yang berlawanan (-90 derajat)
//       tree.rotateX(-Math.PI / 2);
//       globe.add(tree);
//     }
//   }, [stats.totalCarbonSavedKg]);

//   const shuffleQuote = () => {
//     const random = Math.floor(Math.random() * QUOTES.length);
//     setQuote(QUOTES[random]);
//   };

//   return (
//     <section id="stats" ref={ref} className="bg-gray-50 px-6 py-20 sm:py-24">
//       <div className="container mx-auto">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={isInView ? { opacity: 1, y: 0 } : {}}
//           transition={{ duration: 0.6 }}
//           className="text-center"
//         >
//           <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
//             Our Collective Impact
//           </h2>
//           <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
//             Every click, share, and donation makes the world greener. Watch our community's impact grow in real-time.
//           </p>
//         </motion.div>

//         <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
//           {statItems.map((item, i) => {
//             const Icon = item.icon;
//             return (
//               <motion.div
//                 key={item.label}
//                 initial={{ opacity: 0, y: 30 }}
//                 animate={isInView ? { opacity: 1, y: 0 } : {}}
//                 transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
//                 className="bg-white border border-gray-200 p-8 rounded-xl shadow-sm hover:shadow-xl hover:scale-105 transition-all duration-300"
//               >
//                 <Icon size={36} className={`mx-auto mb-4 ${item.color}`} />
//                 <h3 className="text-4xl lg:text-5xl font-extrabold text-gray-900">
//                   <span ref={(el) => { countRefs.current[i] = el; }}>0</span>
//                 </h3>
//                 <p className="text-base text-gray-500 mt-2">{item.label}</p>
//               </motion.div>
//             );
//           })}
//         </div>

//         <motion.div
//           initial={{ opacity: 0, scale: 0.8 }}
//           animate={isInView ? { opacity: 1, scale: 1 } : {}}
//           transition={{ duration: 0.8, delay: 0.3 }}
//           className="mt-20 w-full flex justify-center items-center h-80 lg:h-96"
//         >
//           <div ref={globeRef} className="w-full h-full cursor-grab active:cursor-grabbing"></div>
//         </motion.div>

//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={isInView ? { opacity: 1, y: 0 } : {}}
//           transition={{ duration: 0.6, delay: 0.4 }}
//           className="max-w-3xl mx-auto text-center mt-16"
//         >
//           <Sparkles className="mx-auto text-amber-500 mb-2" size={30} />
//           <p className="text-xl font-medium italic text-gray-700 mb-4 h-20 flex items-center justify-center">
//             “{quote}”
//           </p>
//           <button
//             onClick={shuffleQuote}
//             className="text-sm px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-100 transition"
//           >
//             Inspire Me Again
//           </button>
//         </motion.div>
//       </div>
//     </section>
//   );
// }

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { animate, motion, useInView } from "framer-motion";
import { Leaf, Users, Gift, Sparkles, Sprout } from "lucide-react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// --- Static stuff, biar rapi di atas ---

const QUOTES = [
  "A single act of kindness throws out roots in all directions.",
  "Giving is not just about making a donation. It is about making a difference.",
  "From what we get, we can make a living; what we give, however, makes a life.",
  "The best time to plant a tree was 20 years ago. The second best time is now.",
];

const KG_CO2_EQUIVALENT_TO_ONE_TREE = 21; // Rata-rata 1 pohon dewasa menyerap ~21kg CO2 per tahun.

// Fungsi ini semacam pabrik pohon. Panggil, dan dia kasih satu model pohon.
const createOneLittleTree = () => {
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.03, 0.2, 5),
    new THREE.MeshStandardMaterial({
      color: 0x8b4513,
      metalness: 0.1,
      roughness: 0.8,
    })
  );
  const leaves = new THREE.Mesh(
    new THREE.ConeGeometry(0.1, 0.3, 6),
    new THREE.MeshStandardMaterial({
      color: 0x228b22,
      metalness: 0.2,
      roughness: 0.7,
    })
  );
  leaves.position.y = 0.25; // Taruh daun di atas batang

  const tree = new THREE.Group();
  tree.add(trunk);
  tree.add(leaves);
  return tree;
};

// --- The Component itself ---

export default function TheWitness() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalCarbonSavedKg: "0.00",
  });
  const [bonusTreesFromInteraction, setBonusTreesFromInteraction] = useState(0);
  const [quote, setQuote] = useState(QUOTES[0]);

  const sectionRef = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const countRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const globeCanvasContainer = useRef<HTMLDivElement | null>(null);

  // Tempat nyimpen semua "otak" Three.js biar nggak re-render terus
  const threeJsBrain = useRef<{
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    renderer?: THREE.WebGLRenderer;
    worldSphere?: THREE.Mesh;
    controls?: OrbitControls;
  }>({});

  // Kalkulasi jumlah pohon dari data server
  const treesFromCarbonData = Math.floor(
    parseFloat(stats.totalCarbonSavedKg) / KG_CO2_EQUIVALENT_TO_ONE_TREE
  );
  const totalTreesOnGlobe = treesFromCarbonData + bonusTreesFromInteraction;

  // --- Logic Hooks (useEffect) ---

  // 1. Ambil data statistik dari API pas komponen pertama kali muncul.
  useEffect(() => {
    fetch("/api/stats/home")
      .then((res) => res.json())
      .then(({ data }) => {
        if (data) setStats(data);
      })
      .catch((err) => console.error("Gagal dapet data stats:", err));
  }, []);

  // 2. Animasi angka statistik pas elemen masuk ke viewport.
  useEffect(() => {
    if (isInView && stats.totalUsers > 0) {
      const statValues = [
        stats.totalUsers,
        parseFloat(stats.totalCarbonSavedKg),
        stats.totalPosts,
      ];
      countRefs.current.forEach((element, i) => {
        if (element) {
          animate(0, statValues[i], {
            duration: 2.5,
            onUpdate: (latestValue) => {
              element.textContent =
                i === 1
                  ? latestValue.toFixed(1)
                  : Math.floor(latestValue).toLocaleString();
            },
          });
        }
      });
    }
  }, [stats, isInView]);

  // 3. Setup scene Three.js sekali saja. Ini fondasinya.
  useEffect(() => {
    if (!globeCanvasContainer.current || threeJsBrain.current.scene) return;

    const container = globeCanvasContainer.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.4;

    const geometry = new THREE.SphereGeometry(1.5, 32, 32);
    // Warna hijau laut yang muda dan segar, sesuai permintaan.
    const material = new THREE.MeshStandardMaterial({ color: 0x8fbc8f });
    const worldSphere = new THREE.Mesh(geometry, material);
    scene.add(worldSphere);

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      "/earth-texture.jpg",
      (texture) => {
        material.map = texture;
        material.needsUpdate = true;
      },
      undefined,
      (error) =>
        console.error("Tekstur bumi gagal dimuat, pake warna fallback.")
    );

    scene.add(new THREE.AmbientLight(0xffffff, 2.5));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);
    camera.position.z = 4.5;

    threeJsBrain.current = { scene, camera, renderer, worldSphere, controls };

    let animationFrameId: number;
    const animateLoop = () => {
      animationFrameId = requestAnimationFrame(animateLoop);
      controls.update();
      renderer.render(scene, camera);
    };
    animateLoop();

    const handleResize = () => {
      if (container) {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      threeJsBrain.current = {};
    };
  }, []);

  // 4. Tumbuhkan pohon berdasarkan data karbon dari server.
  useEffect(() => {
    const { worldSphere } = threeJsBrain.current;
    if (!worldSphere || treesFromCarbonData <= 0) return;

    // Bersihkan pohon lama dulu sebelum nambah yang baru (jika data berubah)
    while (worldSphere.children.length > 0) {
      worldSphere.remove(worldSphere.children[0]);
    }

    const maxTreesToShow = Math.min(treesFromCarbonData, 150); // Biar ga lag

    for (let i = 0; i < maxTreesToShow; i++) {
      const tree = createOneLittleTree();
      const phi = Math.acos(-1 + 2 * Math.random());
      const theta = Math.sqrt(4 * Math.PI) * Math.random();
      const position = new THREE.Vector3();
      position.setFromSphericalCoords(1.5, phi, theta);
      tree.position.copy(position);
      tree.lookAt(0, 0, 0);
      tree.rotateX(-Math.PI / 2); // Koreksi orientasi biar tegak lurus
      worldSphere.add(tree);
    }
  }, [treesFromCarbonData]); // Hanya jalan kalo jumlah pohon dari data berubah.

  // --- Action Handlers ---

  const addOneTreeToOurWorld = useCallback(() => {
    const { worldSphere } = threeJsBrain.current;
    if (!worldSphere) return; // Kalo Three.js belum siap, jangan lakukan apa-apa.

    const tree = createOneLittleTree();
    const phi = Math.acos(-1 + 2 * Math.random());
    const theta = Math.random() * Math.PI * 2;
    const position = new THREE.Vector3();
    position.setFromSphericalCoords(1.5, phi, theta);
    tree.position.copy(position);
    tree.lookAt(new THREE.Vector3(0, 0, 0));
    tree.rotateX(-Math.PI / 2);

    // Langsung tambahkan ke scene, tanpa nunggu re-render React
    worldSphere.add(tree);
    const scale = Math.random() * (1 - 0.1) + 0.1;
    // Animate the tree popping up
    tree.scale.set(scale, scale, scale); // Mulai kecil
    animate(0.1, 1, {
      duration: 0.8,
      ease: "elasticOut",
      onUpdate: (v) => tree.scale.set(v, v, v),
    });
  }, []); // useCallback biar fungsi ini ga dibuat ulang terus-terusan.

  const handleGrowButtonClick = () => {
    setBonusTreesFromInteraction((prev) => prev + 1);
    addOneTreeToOurWorld();
  };

  const shuffleQuote = () => {
    const random = Math.floor(Math.random() * QUOTES.length);
    setQuote(QUOTES[random]);
  };

  const statItems = [
    { label: "Total Users", icon: Users, color: "text-sky-500" },
    { label: "Carbon Saved (Kg)", icon: Leaf, color: "text-emerald-500" },
    { label: "Items Shared", icon: Gift, color: "text-rose-500" },
  ];

  // --- The Actual View (JSX) ---

  return (
    <section
      id="witness-grove"
      ref={sectionRef}
      className="bg-gray-50 px-6 py-20 sm:py-24 overflow-hidden"
    >
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Our Collective Grove
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Every share makes our world greener. Watch our community&apos;s
            impact grow, one tree at a time.
          </p>
        </motion.div>

        <div className="mt-16 flex flex-col lg:flex-row items-stretch justify-center gap-8 lg:gap-12">
          {/* Column 1: Stats */}
          <div className="w-full lg:w-1/4 space-y-6">
            {statItems.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -30 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-xl hover:scale-105 transition-all duration-300 text-center"
              >
                <item.icon size={32} className={`mx-auto mb-3 ${item.color}`} />
                <h3 className="text-3xl font-extrabold text-gray-900">
                  <span
                    ref={(el) => {
                      countRefs.current[i] = el;
                    }}
                  >
                    0
                  </span>
                </h3>
                <p className="text-sm text-gray-500 mt-1">{item.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Column 2: The Interactive Globe */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-full lg:w-1/2 flex flex-col items-center justify-center"
          >
            <div className="w-full h-80 lg:h-96 relative">
              <div className="absolute top-2 inset-x-0 z-10 text-center p-2 space-y-1">
                {/* Baris 1: Informasi dari data riil */}
                <p className="text-xs md:text-sm text-gray-800 bg-white/70 backdrop-blur-sm rounded-full inline-block px-3 py-1 shadow">
                  Community saved{" "}
                  <strong className="font-bold">
                    {parseFloat(stats.totalCarbonSavedKg).toLocaleString()} kg
                    CO₂
                  </strong>
                  , equal to{" "}
                  <strong className="font-bold">
                    {treesFromCarbonData.toLocaleString()}
                  </strong>{" "}
                  trees.
                </p>
                {/* Baris 2: Informasi simulasi interaktif */}
                <p className="text-sm md:text-base text-gray-900 font-semibold bg-white/80 backdrop-blur-sm rounded-full inline-block px-4 py-1.5 shadow-md">
                  Our interactive grove has{" "}
                  <strong className="text-emerald-600">
                    {totalTreesOnGlobe.toLocaleString()}
                  </strong>{" "}
                  trees now
                </p>
              </div>
              <div
                ref={globeCanvasContainer}
                className="w-full h-full cursor-grab active:cursor-grabbing"
              ></div>
            </div>
            <motion.button
              onClick={handleGrowButtonClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-6 flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white font-bold rounded-full shadow-lg hover:bg-emerald-600 transition-all duration-300"
            >
              <Sprout size={20} />
              Help Grow a Tree
            </motion.button>
          </motion.div>

          {/* Column 3: Quote */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="w-full lg:w-1/4"
          >
            <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm h-56 lg:h-full flex flex-col justify-center text-center">
              <Sparkles className="mx-auto text-amber-500 mb-3" size={30} />
              <p className="text-lg font-medium italic text-gray-700 mb-5 flex-grow flex items-center justify-center">
                <span>“{quote}”</span>
              </p>
              <button
                onClick={shuffleQuote}
                className="text-sm px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-100 transition self-center"
              >
                Inspire Me Again
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
