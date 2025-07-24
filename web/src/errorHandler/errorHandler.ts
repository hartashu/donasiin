import { IJsonResponse } from "@/types/types";
import { MongoServerError } from "mongodb";
import { NextResponse } from "next/server";

const handleError = async (error: unknown) => {
  console.log("🚀 ~ handleError ~ error:", error);
  if (error instanceof MongoServerError) {
    return NextResponse.json<IJsonResponse<null>>({
      statusCode: 500,
      error: error.message,
    });
  }

  return NextResponse.json<IJsonResponse<null>>({
    statusCode: 500,
    message: "Internal Server Error",
  });
};

export default handleError;
