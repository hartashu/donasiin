import handleError from "@/errorHandler/errorHandler";
import { PostModel } from "@/models/post";
import { IJsonResponse, IPost } from "@/types/types";
import { MongoServerError, WithId } from "mongodb";
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
    handleError(error);
  }
}

export async function POST(request: Request) {}

export async function PUT(request: Request) {}

export async function DELETE(request: Request) {}

export async function PATCH(request: Request) {}
