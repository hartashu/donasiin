import handleError from "@/errorHandler/errorHandler";
import { PostModel } from "@/models/post";
import { IJsonResponse, IPost } from "@/types/types";
import { MongoServerError, ObjectId, WithId } from "mongodb";
import { NextResponse } from "next/server";

export async function GET(_request: Request) {
  try {
    const posts = await PostModel.getAllPosts();

    return NextResponse.json<IJsonResponse<WithId<IPost>[]>>(
      {
        statusCode: 200,
        data: posts,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const userId = new ObjectId("66a07e8a3b3e4f1a2c3d4e51"); // Masih hardcode
    const body = await request.json();
    const isAdded = await PostModel.addPost({
      ...body,
      userId,
    });

    if (!isAdded) throw new Error("Add post failed");

    return NextResponse.json({
      statusCode: 201,
      message: "Add post success",
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: Request) {}

export async function DELETE(request: Request) {}

export async function PATCH(request: Request) {}
