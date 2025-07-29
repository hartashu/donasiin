"use client";

import { IPost } from "@/types/types";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function FeaturedItems({ data }: { data: IPost[] }) {
    return (
        <section className="py-20 md:py-24">
            <div className="container mx-auto px-6">
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="font-serif text-4xl md:text-5xl text-white">Recently Shared Items</h2>
                            <p className="text-lg mt-2 text-green-100/70">Discover the latest treasures from our community.</p>
                        </div>
                        <Link href="/donations" className="hidden sm:inline-flex items-center gap-2 text-brand font-bold hover:underline">
                            View All <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {data.filter(p => p.isAvailable).slice(0, 4).map((d, i) => (
                        <motion.div key={d.slug} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.1 }} viewport={{ once: true }}>
                            <Link href={`/posts/${d.slug}`} className="block glass-card rounded-2xl overflow-hidden h-full">
                                <div className="relative h-56">
                                    <Image src={d.thumbnailUrl} alt={d.title} fill className="object-cover" />
                                </div>
                                <div className="p-5">
                                    <p className="text-xs font-semibold text-brand uppercase">{d.category}</p>
                                    <h3 className="text-lg font-bold text-white mt-1 mb-2 line-clamp-1">{d.title}</h3>
                                    <p className="text-sm text-green-100/70 line-clamp-2">{d.description}</p>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}