import { NextRequest, NextResponse } from "next/server";
import {
  getUserByEmail,
  verifyUserPassword,
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
    // console.log(`⚠️ email password`, email, password)

    const user = await getUserByEmail(email);
    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }
    console.log(`⚠️ user`, user);

    // const isPasswordValid = await verifyUserPassword(password, user.password);
    // if (!isPasswordValid) {
    //   return NextResponse.json(
    //     { error: "Invalid credentials" },
    //     { status: 401 }
    //   );
    // }

    // console.log(`⚠️ user`, isPasswordValid);

    const tokenPayload = {
      sub: user._id.toString(),
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      address : user.address
    };

    const secret = process.env.AUTH_SECRET;
    if (!secret) {
      throw new Error("AUTH_SECRET is not defined in environment variables");
    }

    // Salt ini digunakan untuk proses enkripsi JWT (JWE)
    const salt = "authjs.session-token";

    // Tambahkan properti 'salt' pada pemanggilan fungsi encode
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
