import { NextResponse } from "next/server";

export async function POST() {
    const response = NextResponse.json({ message: "Logged out" });

    response.cookies.set("authjs.session-token", "", {
        path: "/",
        httpOnly: true,
        secure: true,
        expires: new Date(0),
    });

    return response;
}
