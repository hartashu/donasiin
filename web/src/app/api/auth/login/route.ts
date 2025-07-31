import { NextRequest, NextResponse } from "next/server";
import {
  getUserByEmail,
} from "@/lib/services/user.service";
import { encode } from "next-auth/jwt";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await getUserByEmail(email);
    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }
    console.log(`⚠️ user`, user);


    const tokenPayload = {
      sub: user._id.toString(),
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      address: user.address,
    };

    const secret = process.env.AUTH_SECRET;
    if (!secret) {
      throw new Error("AUTH_SECRET is not defined in environment variables");
    }

    const salt = "authjs.session-token";

    const token = await encode({ token: tokenPayload, secret, salt });

    return NextResponse.json({
      token: token,
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        username: user.username,
        avatarUrl: user.avatarUrl,
        address: user.address,
      },
    });
  } catch (error) {
    console.error("Native login error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
