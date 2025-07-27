import { NextResponse } from "next/server";
import { PostModel } from "@/models/post";
import handleError from "@/errorHandler/errorHandler";

export async function GET() {
  try {
    const totalSaved = await PostModel.getTotalCarbonSaved();

    return NextResponse.json({
      statusCode: 200,
      data: {
        totalCarbonSavedKg: totalSaved.toFixed(2),
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
