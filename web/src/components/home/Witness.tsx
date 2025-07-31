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
    // 🔥 FIX: Menggunakan InstanceType untuk mendapatkan tipe dari class OrbitControls
    controls?: InstanceType<typeof OrbitControls>;
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
      "/earthtexture.jpg",
      (texture) => {
        material.map = texture;
        material.needsUpdate = true;
      },
      undefined,
      // 🔥 FIX: Mengganti 'error' menjadi '_error' untuk mengatasi warning unused variable
      (_error) =>
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
    // 🔥 FIX: Memberikan tipe eksplisit <number> untuk memastikan 'v' adalah angka
    animate<number>(0.1, 1, {
      duration: 0.8,
      ease: "easeOut",
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
              <div className="absolute top-2 inset-x-0 z-10 text-center p-2 space-y-1 flex flex-col items-center">
                {/* Baris 1: Informasi dari data riil */}
                <p className=" text-xs md:text-sm text-gray-800 bg-white/70 backdrop-blur-sm rounded-full inline-block px-3 py-1 shadow">
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