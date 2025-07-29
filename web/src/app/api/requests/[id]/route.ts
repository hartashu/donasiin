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

    // Donor logic
    if (isDonor) {
      const body = await request.json();
      const { status, trackingCode } = updateRequestStatusSchema.parse(body);

      // Donors can only: ACCEPT, REJECT, or SHIPPED
      if (
        status === RequestStatus.ACCEPTED ||
        status === RequestStatus.REJECTED ||
        status === RequestStatus.SHIPPED
      ) {
        await RequestModel.updateRequestStatus(
          currentRequest._id.toString(), // <-- FIX: Convert ObjectId to string
          status,
          trackingCode
        );
        // If accepted, update post status to unavailable
        if (status === RequestStatus.ACCEPTED) {
          await PostModel.updatePost(post.slug, { isAvailable: false });
        }
        return NextResponse.json({
          message: `Request status updated to ${status}`,
        });
      }
    }

    // Requester logic
    if (isRequester) {
      const body = await request.json();
      // Requesters can only: COMPLETED
      if (
        body.status === RequestStatus.COMPLETED &&
        currentRequest.status === RequestStatus.SHIPPED
      ) {
        await RequestModel.updateRequestStatus(
          currentRequest._id.toString(), // <-- FIX: Convert ObjectId to string
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
