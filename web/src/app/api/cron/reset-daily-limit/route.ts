import { NextRequest, NextResponse } from "next/server";
import { connectToDb } from "@/config/mongo";

export async function GET(request: NextRequest) {
  const cronSecret = request.headers.get("x-vercel-cron-secret");

  if (cronSecret !== process.env.CRON_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const db = await connectToDb();
    const userCollection = db.collection("users");

    const result = await userCollection.updateMany(
      {},
      { $set: { dailyLimit: 5 } }
    );

    console.log(`Daily limits reset for ${result.modifiedCount} users.`);
    return NextResponse.json({
      success: true,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Cron job failed:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
