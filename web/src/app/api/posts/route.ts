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
    console.log(error);
    if (error instanceof MongoServerError) {
      return NextResponse.json<IJsonResponse<null>>(
        {
          statusCode: 500,
          message: "Database Error",
          error: error.message,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json<IJsonResponse<null>>(
      {
        statusCode: 500,
        message: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: Request) {}

export async function PUT(request: Request) {}

export async function DELETE(request: Request) {}

export async function PATCH(request: Request) {}
