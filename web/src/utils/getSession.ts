// export async function getSession() {
//   return { user: { id: "66a07e8a3b3e4f1a2c3d4e51" } };
// }

import { auth } from "@/lib/auth";
import { getToken } from "next-auth/jwt";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

/**
 * @returns {Promise<{ user: { id: string } } | null>}
 */
export async function getSession(): Promise<{ user: { id: string } } | null> {
  const session = await auth();
  if (session?.user?.id) {
    return { user: { id: session.user.id } };
  }

  // no sesi cookie, cari Bearer Token di header
  const authorizationHeader = (await headers()).get("authorization");
  if (authorizationHeader && authorizationHeader.startsWith("Bearer ")) {
    const token = authorizationHeader.split(" ")[1];

    // const req = new NextRequest('http://localhost', {
    //     headers: {
    //         cookie: `${process.env.AUTH_COOKIE_NAME || 'authjs.session-token'}=${token}`
    //     }
    // });

    // if (!process.env.NEXT_PUBLIC_BASE_URL) {
    //   throw new Error(
    //     "Base URL is not defined. Please check your .env.local file."
    //   );
    // }

    const req = new NextRequest(BASE_URL, {
      headers: {
        cookie: `${
          process.env.AUTH_COOKIE_NAME || "__Secure-authjs.session-token"
        }=${token}`,
      },
    });

    const decodedToken = await getToken({
      req,
      secret: process.env.AUTH_SECRET,
    });

    if (decodedToken?.id) {
      return { user: { id: decodedToken.id as string } };
    }
  }
  // Jika tidak ada sesi atau token yang valid, kembalikan null
  return null;
}
