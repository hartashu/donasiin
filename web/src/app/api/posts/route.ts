import handleError from "@/errorHandler/errorHandler";
import { PostModel } from "@/models/post";
import { IJsonResponse, IPost } from "@/types/types";
import { getSession } from "@/utils/getSession";
import { postSchema } from "@/utils/validations/post";
import { ObjectId, WithId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;

    const { posts, total } = await PostModel.getAllPosts({
      page,
      limit,
      category,
      search,
    });

    return NextResponse.json<
      IJsonResponse<{
        posts: WithId<IPost>[];
        total: number;
        page: number;
        totalPages: number;
      }>
    >(
      {
        statusCode: 200,
        data: {
          posts,
          total,
          page,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { statusCode: 401, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const validatedData = postSchema.parse(body);

    const slug = validatedData.title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");

    const result = await PostModel.addPost({
      ...validatedData,
      slug: slug,
      userId: new ObjectId(session.user.id),
    });

    if (!result.acknowledged) {
      throw new Error("Add post failed");
    }

    return NextResponse.json(
      {
        statusCode: 201,
        message: "Add post success",
        data: { insertedId: result.insertedId },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}
