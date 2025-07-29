import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/utils/getSession";
import handleError from "@/errorHandler/errorHandler";
import { ObjectId } from "mongodb";
import { PostModel } from "@/models/post";
import { RequestModel } from "@/models/request";
import { UserModel } from "@/models/user.model";
import { IJsonResponse } from "@/types/types";
import { updateProfileSchema } from "@/utils/validations/user";

export async function GET(_request: NextRequest) { // <--- FIX DI SINI
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = new ObjectId(session.user.id);

    const [userProfile, userPosts, userRequests] = await Promise.all([
      UserModel.getUserById(session.user.id),
      PostModel.findUserPostsWithRequesters(userId),
      RequestModel.findUserRequests(session.user.id)
    ]);

    if (!userProfile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...safeUserProfile } = userProfile;

    return NextResponse.json({
      statusCode: 200,
      data: {
        profile: safeUserProfile,
        posts: userPosts,
        requests: userRequests,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);

    await UserModel.updateUserProfile(
      new ObjectId(session.user.id),
      validatedData
    );

    return NextResponse.json<IJsonResponse<null>>({ statusCode: 200, message: "Profile updated successfully." });

  } catch (error) {
    return handleError(error);
  }
}