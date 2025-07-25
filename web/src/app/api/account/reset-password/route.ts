import { NextRequest, NextResponse } from "next/server";
import { UserModel } from "@/models/user.model";
import { ResetPasswordSchema } from "@/utils/validations/auth";
import handleError from "@/errorHandler/errorHandler";
import { IJsonResponse } from "@/types/types";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { token, password, confirmPassword } = body;
        ResetPasswordSchema.parse({ password, confirmPassword });
        if (!token) {
            return NextResponse.json<IJsonResponse<null>>({ statusCode: 400, error: "Reset token is required." }, { status: 400 });
        }
        const existingToken = await UserModel.getPasswordResetToken(token);
        if (!existingToken) {
            return NextResponse.json<IJsonResponse<null>>({ statusCode: 400, error: "Invalid or expired token." }, { status: 400 });
        }
        await UserModel.updateUserPassword(existingToken.email, password);
        await UserModel.deletePasswordResetToken(token);
        return NextResponse.json<IJsonResponse<null>>({ statusCode: 200, message: "Password updated successfully!" });
    } catch (error) {
        return handleError(error);
    }
}