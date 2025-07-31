import { NextResponse } from "next/server";
import { RequestModel } from "@/models/request";
import { getSession } from "@/utils/getSession";
import handleError from "@/errorHandler/errorHandler";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requests = await RequestModel.findUserRequests(
      session.user.id
    );

    return NextResponse.json({ data: requests });
  } catch (error) {
    return handleError(error);
  }
}