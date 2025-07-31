import { NextRequest, NextResponse } from "next/server";
import { RequestModel } from "@/models/request";
import { PostModel } from "@/models/post";
import handleError from "@/errorHandler/errorHandler";
import { RequestStatus } from "@/types/types";
import { getSession } from "@/utils/getSession";
import { updateRequestStatusSchema } from "@/utils/validations/request";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentRequest = await RequestModel.getRequestById(id);
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

    if (isDonor) {
      const body = await request.json();
      const { status, trackingCode } = updateRequestStatusSchema.parse(body);

      if (
        status === RequestStatus.ACCEPTED ||
        status === RequestStatus.REJECTED ||
        status === RequestStatus.SHIPPED
      ) {
        await RequestModel.updateRequestStatus(
          currentRequest._id.toString(),
          status,
          trackingCode
        );
        if (status === RequestStatus.ACCEPTED) {
          await PostModel.updatePost(post.slug, { isAvailable: false });
        }
        return NextResponse.json({
          message: `Request status updated to ${status}`,
        });
      }
    }

    if (isRequester) {
      const body = await request.json();
      if (
        body.status === RequestStatus.COMPLETED &&
        currentRequest.status === RequestStatus.SHIPPED
      ) {
        await RequestModel.updateRequestStatus(
          currentRequest._id.toString(),
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requestToDelete = await RequestModel.getRequestById(id);
    if (!requestToDelete) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const isRequester = requestToDelete.userId.toString() === session.user.id;
    if (!isRequester) {
      return NextResponse.json(
        { error: "Forbidden: You can only delete your own requests." },
        { status: 403 }
      );
    }

    const isDeleted = await RequestModel.deleteRequestById(id);
    if (!isDeleted) {
      throw new Error("Failed to delete the request.");
    }

    return NextResponse.json({ message: "Request deleted successfully" });
  } catch (error) {
    return handleError(error);
  }
}
