import handleError from "@/errorHandler/errorHandler";
import { PostModel } from "@/models/post";
import { IJsonResponse, IPost } from "@/types/types";
import { getSession } from "@/utils/getSession";
import { updatePostSchema } from "@/utils/validations/post";
import { WithId } from "mongodb";
import { NextResponse } from "next/server";

// Andy
import { RequestModel } from "@/models/request";
import { ObjectId } from "mongodb";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const post = await PostModel.getPostBySlug(slug);

    if (!post) {
      return NextResponse.json<IJsonResponse<null>>(
        { statusCode: 404, error: "Post not found" },
        { status: 404 }
      );
    }

    // return NextResponse.json<IJsonResponse<WithId<IPost>>>(
    //   { statusCode: 200, data: post },
    //   { status: 200 }
    // );

    // Andy
      // 🟡 Ambil session user
    const session = await getSession();
    const userId = session?.user?.id;

    // 🟡 Default tidak me-request
    let hasRequested = false;

    // 🟢 Cek apakah user sudah pernah request post ini
    if (userId) {
      const myRequests = await RequestModel.getMyRequests(new ObjectId(userId));
      hasRequested = myRequests.some((req) => req.postId.equals(post._id));
    }

    // 🟢 Tambahkan properti baru: hasRequested
    return NextResponse.json<IJsonResponse<any>>(
      { statusCode: 200, data: { ...post, hasRequested } },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { statusCode: 401, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const post = await PostModel.getPostBySlug(slug);
    if (!post) {
      return NextResponse.json(
        { statusCode: 404, error: "Post not found" },
        { status: 404 }
      );
    }

    if (post.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { statusCode: 403, error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = updatePostSchema.parse(body);

    const isUpdated = await PostModel.updatePost(slug, validatedData);
    if (!isUpdated) throw new Error("Update failed or no changes were made");

    return NextResponse.json({
      statusCode: 200,
      message: "Post updated successfully",
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { statusCode: 401, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const post = await PostModel.getPostBySlug(slug);
    if (!post) {
      return NextResponse.json(
        { statusCode: 404, error: "Post not found" },
        { status: 404 }
      );
    }

    if (post.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { statusCode: 403, error: "Forbidden" },
        { status: 403 }
      );
    }

    const isDeleted = await PostModel.deletePost(slug);
    if (!isDeleted) throw new Error("Delete failed");

    return NextResponse.json({
      statusCode: 200,
      message: "Post deleted successfully",
    });
  } catch (error) {
    return handleError(error);
  }
}
