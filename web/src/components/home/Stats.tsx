"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, animate } from "framer-motion";
import { Leaf, Users, Gift } from "lucide-react";

export default function Stats() {
    const [stats, setStats] = useState({ totalUsers: 0, totalPosts: 0, totalCarbonSavedKg: "0.00" });
    const countRefs = useRef<Array<HTMLSpanElement | null>>([]);
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

    useEffect(() => {
        fetch('/api/stats/home').then(res => res.json()).then(data => setStats(data.data));
    }, []);

    useEffect(() => {
        if (isInView && stats.totalUsers > 0) {
            const targets = [stats.totalUsers, stats.totalPosts, parseFloat(stats.totalCarbonSavedKg)];
            countRefs.current.forEach((ref, i) => {
                if (ref) animate(0, targets[i], {
                    duration: 2, onUpdate: v => {
                        ref.textContent = i === 2 ? v.toFixed(1) : Math.floor(v).toLocaleString()
                    }
                });
            });
        }
    }, [isInView, stats]);

    const statItems = [
        { label: "Community Members", icon: Users },
        { label: "Items Shared", icon: Gift },
        { label: "Carbon Saved (Kg)", icon: Leaf },
    ];

    return (
        <section ref={sectionRef} className="text-center py-20 md:py-24 container mx-auto px-6">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <h2 className="font-serif text-4xl md:text-5xl mb-4 text-white">Our Collective Impact</h2>
                <p className="max-w-3xl mx-auto text-lg mb-16 text-green-100/70">Small actions, big changes. Here's what we've achieved together.</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {statItems.map((item, i) => (
                    <motion.div key={item.label} className="glass-card p-8 rounded-2xl" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}>
                        <item.icon className="w-10 h-10 mx-auto mb-4 text-brand-light" />
                        <h3 className="text-5xl font-bold text-white">
                            <span ref={(el) => { if (el) countRefs.current[i] = el; }}>0</span>
                        </h3>
                        <p className="text-lg mt-2 text-green-100/80">{item.label}</p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}