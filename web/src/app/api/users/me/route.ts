// import { auth } from "@/lib/auth";
// import { NextResponse } from "next/server";

// export async function GET() {
//   const session = await auth();

//   if (!session?.user?.id) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   return NextResponse.json({ data: session.user });
// }


import { NextResponse } from "next/server";
import { getSession } from "@/utils/getSession";
import handleError from "@/errorHandler/errorHandler";
import { ObjectId } from "mongodb";
import { PostModel } from "@/models/post";
import { RequestModel } from "@/models/request";
import { UserModel } from "@/models/user.model";
import { IJsonResponse } from "@/types/types";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = new ObjectId(session.user.id);

    // Jalankan semua query database secara paralel untuk performa maksimal
    const [userProfile, userPosts, userRequests] = await Promise.all([
      UserModel.getUserById(session.user.id),
      PostModel.findUserPostsWithRequesters(userId),
      RequestModel.findUserRequests(userId)
    ]);

    if (!userProfile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Hapus password dari objek user sebelum dikirim ke frontend
    const { password, ...safeUserProfile } = userProfile;

    return NextResponse.json<IJsonResponse<any>>({
      statusCode: 200,
      data: {
        profile: safeUserProfile,
        posts: userPosts,
        requests: userRequests,
      },
    });

  } catch (error) {
    return handleError(error);
  }
}