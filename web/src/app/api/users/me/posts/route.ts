// /app/api/users/me/posts/route.ts
import { NextResponse } from "next/server";
import { PostModel } from "@/models/post";
import { getSession } from "@/utils/getSession";
import handleError from "@/errorHandler/errorHandler";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Panggil fungsi baru yang lebih canggih
    const postsWithRequesters = await PostModel.findUserPostsWithRequesters(
      new ObjectId(session.user.id)
    );

    return NextResponse.json({ data: postsWithRequesters });
  } catch (error) {
    return handleError(error);
  }
}
