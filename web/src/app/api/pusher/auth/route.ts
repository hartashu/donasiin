// File: src/app/api/pusher/auth/route.ts

import { NextRequest, NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher";
import { getSession } from "@/utils/getSession";

export async function POST(request: NextRequest) {
    try {
        // 1. Dapatkan sesi dari request
        // FIX (ts:2554): Menyesuaikan panggilan `getSession` berdasarkan pesan error.
        // Jika `getSession` Anda adalah wrapper dari next-auth, di server-side
        // biasanya tidak memerlukan argumen. Jika fungsi ini custom dan memerlukan
        // `request`, maka Anda harus memperbaiki tipe definisi dari fungsi `getSession` itu sendiri.
        const session = await getSession();

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await request.formData();
        const socketId = body.get("socket_id") as string;
        const channel = body.get("channel_name") as string;

        // 2. Siapkan data pengguna untuk Pusher
        // FIX (ts:2339 & ts:2345): Pusher membutuhkan properti `user_id`.
        // Tipe `session.user` juga diperjelas untuk menyertakan `name`.
        const userData = {
            user_id: session.user.id,
            user_info: {
                // Asumsi `session.user` memiliki properti `name` saat runtime.
                // Jika `name` bisa null/undefined, Anda bisa beri nilai default.
                name: (session.user as { name?: string }).name,
            },
        };

        // 3. Otorisasi pengguna untuk channel presence
        const authResponse = pusherServer.authorizeChannel(socketId, channel, userData);

        return NextResponse.json(authResponse);

    } catch (error) {
        console.error("Pusher Auth Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}