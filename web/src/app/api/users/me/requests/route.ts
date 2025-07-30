import { NextResponse } from "next/server";
import { RequestModel } from "@/models/request";
import { getSession } from "@/utils/getSession";
import handleError from "@/errorHandler/errorHandler";
// import { ObjectId } from "mongodb"; // Tidak perlu jika session.user.id sudah string

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // FIX (ts:2345): Kirim session.user.id langsung sebagai string.
    const requests = await RequestModel.findUserRequests(
      session.user.id
    );

    return NextResponse.json({ data: requests });
  } catch (error) {
    return handleError(error);
  }
}