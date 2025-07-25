import { NextRequest, NextResponse } from "next/server";
import { PostModel } from "@/models/post";
import { UserModel } from "@/models/user";
import { getSession } from "@/utils/getSession";
import { ObjectId } from "mongodb";
import handleError from "@/errorHandler/errorHandler";

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const donor = await UserModel.findUserById(session.user.id);
    if (!donor || !donor.location) {
      return NextResponse.json(
        { error: "Donor location is not set." },
        { status: 400 }
      );
    }

    const post = await PostModel.getPostBySlug(params.slug);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const recommendations = await UserModel.findPotentialRecipients(
      donor.location.coordinates,
      post.category,
      new ObjectId(session.user.id)
    );

    return NextResponse.json({ data: recommendations });
  } catch (error) {
    // ... error handling
    return handleError(error);
  }
}
