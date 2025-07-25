import { IJsonResponse } from "@/types/types";
import { MongoServerError } from "mongodb";
import { NextResponse } from "next/server";
import { z } from "zod";

const handleError = async (error: unknown) => {
  console.log("🚀 ~ handleError ~ error:", error);
  if (error instanceof MongoServerError) {
    return NextResponse.json<IJsonResponse<null>>(
      { statusCode: 500, error: error.message },
      { status: 500 }
    );
  } else if (error instanceof z.ZodError) {
    return NextResponse.json(
      { statusCode: 400, error: error.issues[0].message },
      { status: 400 }
    );
  } else if (error instanceof Error) {
    return NextResponse.json<IJsonResponse<null>>(
      { statusCode: 500, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json<IJsonResponse<null>>(
    { statusCode: 500, error: "Internal Server Error" },
    { status: 500 }
  );
};

export default handleError;
