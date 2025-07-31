import { IPost } from "@/types/types";
import { unstable_noStore as noStore } from 'next/cache';

export async function getPostBySlug(slug: string): Promise<IPost | null> {
    noStore();
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/posts/${slug}`, {
            cache: 'no-store'
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