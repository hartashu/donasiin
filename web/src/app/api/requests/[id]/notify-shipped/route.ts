import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/utils/getSession";
import handleError from "@/errorHandler/errorHandler";
import { sendShippingNotificationAction } from "@/actions/action";
import { RequestModel } from "@/models/request.model";
import { PostModel } from "@/models/post";

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // FIX: The getSession function likely doesn't require the `request` argument.
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: requestId } = params;
        const { trackingCode } = await request.json();

        if (!trackingCode) {
            return NextResponse.json({ error: "Tracking code is required" }, { status: 400 });
        }

        // --- Security Check ---
        // Pastikan pengguna yang login adalah pemilik barang (donatur)
        const requestDoc = await RequestModel.getRequestById(requestId);
        if (!requestDoc) {
            return NextResponse.json({ error: "Request not found" }, { status: 404 });
        }
        const post = await PostModel.getPostById(requestDoc.postId.toString());
        if (post?.userId.toString() !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        // --------------------

        // Panggil server action yang sudah ada
        await sendShippingNotificationAction(requestId, trackingCode);

        return NextResponse.json({ message: "Shipping notification sent successfully." });

    } catch (error) {
        return handleError(error);
    }
}
