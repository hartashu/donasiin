import { NextResponse } from "next/server";
import { RequestModel } from "@/models/request";
import handleError from "@/errorHandler/errorHandler";
// ObjectId tidak lagi dibutuhkan di sini jika session.user.id sudah string
// import { ObjectId } from "mongodb";
import { getSession } from "@/utils/getSession";

// Melihat permintaan untuk barang saya
export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // FIX (ts:2345): Mengirim session.user.id langsung sebagai string,
    // sesuai dengan tipe parameter yang diharapkan oleh fungsi.
    const requests = await RequestModel.getIncomingRequestsForMyPosts(
      session.user.id
    );

    return NextResponse.json({ data: requests }, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}