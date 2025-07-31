import { NextResponse } from "next/server";
import { RequestModel } from "@/models/request";
import handleError from "@/errorHandler/errorHandler";
import { getSession } from "@/utils/getSession";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requests = await RequestModel.getIncomingRequestsForMyPosts(
      session.user.id
    );

    return NextResponse.json({ data: requests }, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}