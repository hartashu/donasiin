import { NextRequest, NextResponse } from "next/server";
import { RequestModel } from "@/models/request";
import { PostModel } from "@/models/post";
import handleError from "@/errorHandler/errorHandler";
import { RequestStatus } from "@/types/types";
import { getSession } from "@/utils/getSession";
import { updateRequestStatusSchema } from "@/utils/validations/request";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentRequest = await RequestModel.getRequestById(params.id);
    if (!currentRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const post = await PostModel.getPostById(currentRequest.postId.toString());
    if (!post) {
      return NextResponse.json(
        { error: "Associated post not found" },
        { status: 404 }
      );
    }

    const isDonor = post.userId.toString() === session.user.id;
    const isRequester = currentRequest.userId.toString() === session.user.id;

    // Logika untuk Donatur
    if (isDonor) {
      const body = await request.json();
      const { status, trackingCode } = updateRequestStatusSchema.parse(body);

      // Donatur hanya bisa: ACCEPT, REJECT, atau SHIPPED
      if (
        status === RequestStatus.ACCEPTED ||
        status === RequestStatus.REJECTED ||
        status === RequestStatus.SHIPPED
      ) {
        await RequestModel.updateRequestStatus(
          currentRequest._id,
          status,
          trackingCode
        );
        // Jika diterima, update status post menjadi tidak tersedia
        if (status === RequestStatus.ACCEPTED) {
          await PostModel.updatePost(post.slug, { isAvailable: false });
        }
        return NextResponse.json({
          message: `Request status updated to ${status}`,
        });
      }
    }

    // Logika untuk Penerima
    if (isRequester) {
      const body = await request.json();
      // Penerima hanya bisa: COMPLETED
      if (
        body.status === RequestStatus.COMPLETED &&
        currentRequest.status === RequestStatus.SHIPPED
      ) {
        await RequestModel.updateRequestStatus(
          currentRequest._id,
          RequestStatus.COMPLETED
        );
        return NextResponse.json({ message: "Request completed successfully" });
      }
    }

    return NextResponse.json(
      { error: "Forbidden or invalid action" },
      { status: 403 }
    );
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Cari permintaan yang akan dihapus
    const requestToDelete = await RequestModel.getRequestById(params.id);
    if (!requestToDelete) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // 2. Otorisasi: Pastikan hanya pembuat request yang bisa menghapus
    const isRequester = requestToDelete.userId.toString() === session.user.id;
    if (!isRequester) {
      return NextResponse.json(
        { error: "Forbidden: You can only delete your own requests." },
        { status: 403 }
      );
    }

    // 3. Hapus permintaan dari database
    const isDeleted = await RequestModel.deleteRequestById(params.id);
    if (!isDeleted) {
      throw new Error("Failed to delete the request.");
    }

    return NextResponse.json({ message: "Request deleted successfully" });
  } catch (error) {
    return handleError(error);
  }
}
