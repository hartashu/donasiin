import { NextRequest, NextResponse } from "next/server";
import { RequestModel } from "@/models/request";
import handleError from "@/errorHandler/errorHandler";
import { ObjectId } from "mongodb";
import { createRequestSchema } from "@/utils/validations/request";
import { getSession } from "@/utils/getSession";
import { PostModel } from "@/models/post";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { postId } = createRequestSchema.parse(body);

    const post = await PostModel.getPostById(postId);
    if (!post || !post.isAvailable) {
      return NextResponse.json(
        { error: "Post is not available for request" },
        { status: 404 }
      );
    }

    // Pastikan user tidak me-request post miliknya sendiri
    if (post.userId.toString() === session.user.id) {
      return NextResponse.json(
        { error: "You cannot request your own item" },
        { status: 400 }
      );
    }

    const result = await RequestModel.createRequest(
      new ObjectId(postId),
      new ObjectId(session.user.id)
    );

    return NextResponse.json(
      { message: "Request created successfully", data: result },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}
