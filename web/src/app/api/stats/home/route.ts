import { NextResponse } from "next/server";
import { StatsModel } from "@/models/stats.model";
import handleError from "@/errorHandler/errorHandler";
import { IJsonResponse } from "@/types/types";
import { PostModel } from "@/models/post";

export async function GET() {
  try {
    const [totalUsers, totalPosts, totalCarbonSaved] = await Promise.all([
      StatsModel.getTotalUsers(),
      StatsModel.getTotalPosts(),
      PostModel.getTotalCarbonSaved(),
    ]);

    return NextResponse.json<
      IJsonResponse<{
        totalUsers: number;
        totalPosts: number;
        totalCarbonSavedKg: string;
      }>
    >({
      statusCode: 200,
      data: {
        totalUsers,
        totalPosts,
        totalCarbonSavedKg: totalCarbonSaved.toFixed(2),
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
