import { IPost } from "@/types/types";
import { unstable_noStore as noStore } from 'next/cache';

// Fungsi ini akan dipanggil di server untuk mengambil data post
// noStore() digunakan untuk memastikan data selalu yang terbaru setiap kali halaman diakses
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export async function getPostBySlug(slug: string): Promise<IPost | null> {
    noStore();
    try {
        // Ganti URL ini dengan URL production Anda jika perlu
        const res = await fetch(`${BASE_URL}/api/posts/${slug}`, {
            cache: 'no-store' // Memastikan data selalu fresh
        });

        if (!res.ok) {
            return null;
        }

        const json = await res.json();
        return json?.data || null;
    } catch (err) {
        console.error("Failed to fetch post on server", err);
        return null;
    }
}