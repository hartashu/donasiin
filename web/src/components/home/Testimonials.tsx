"use client";

import { motion } from "framer-motion";

const testimonials = [
    { quote: "This platform changed my life. I received a laptop that helped me finish my studies.", author: "Anya, Student" },
    { quote: "It feels so good to know my old furniture found a new home where it's truly needed.", author: "Budi, Donor" },
    { quote: "Connecting with the person I helped was an incredibly rewarding experience.", author: "Citra, Giver" }
];

export default function Testimonials() {
    return (
        <section className="py-20 md:py-24 container mx-auto px-6">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <h2 className="font-serif text-4xl md:text-5xl text-center mb-4 text-white">Voices of Our Community</h2>
                <p className="max-w-3xl mx-auto text-lg mb-16 text-center text-green-100/70">Real stories from real people making a difference.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials.map((t, i) => (
                    <motion.div key={i} className="glass-card rounded-2xl p-8" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: i * 0.2 }} viewport={{ once: true }}>
                        <p className="text-lg italic text-white/90 mb-6 before:content-['“'] before:text-5xl before:text-brand before:mr-2 before:-ml-4 before:font-serif after:content-['”'] after:text-5xl after:text-brand after:ml-2 after:-mr-4 after:font-serif">{t.quote}</p>
                        <p className="font-bold text-right text-brand-light">— {t.author}</p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}