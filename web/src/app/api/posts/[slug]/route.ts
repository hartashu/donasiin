import handleError from "@/errorHandler/errorHandler";
import { PostModel } from "@/models/post";
import { IJsonResponse, IPost } from "@/types/types";
import { MongoServerError, ObjectId, WithId } from "mongodb";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const post = await PostModel.getPostBySlug(slug);

    return NextResponse.json<IJsonResponse<WithId<IPost> | null>>(
      {
        statusCode: 200,
        data: post,
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
