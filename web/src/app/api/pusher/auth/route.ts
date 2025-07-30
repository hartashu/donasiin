// File: src/app/api/pusher/auth/route.ts

import { NextRequest, NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher";
import { getSession } from "@/utils/getSession";

export async function POST(request: NextRequest) {
    try {
        // 1. Dapatkan sesi dari Bearer Token
        const session = await getSession(request);
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await request.formData();
        const socketId = body.get("socket_id") as string;
        const channel = body.get("channel_name") as string;

        // 2. Siapkan data pengguna untuk Pusher
        const userData = {
            id: session.user.id,
            user_info: {
                name: session.user.name,
                // Anda bisa tambahkan info lain jika perlu
            },
        };

        // 3. Otorisasi pengguna untuk channel privat
        const authResponse = pusherServer.authorizeChannel(socketId, channel, userData);

        return NextResponse.json(authResponse);

    } catch (error) {
        console.error("Pusher Auth Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}