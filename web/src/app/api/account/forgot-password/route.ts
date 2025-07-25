import { NextRequest, NextResponse } from "next/server";
import { UserModel } from "@/models/user.model";
import { ForgotPasswordSchema } from "@/utils/validations/auth";
import { sendPasswordResetEmail } from "@/lib/utils/email";
import handleError from "@/errorHandler/errorHandler";
import { IJsonResponse } from "@/types/types";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = ForgotPasswordSchema.parse(body);
        const source = request.nextUrl.searchParams.get('from') || 'web';
        const resetToken = await UserModel.createPasswordResetToken(email);

        if (resetToken) {
            await sendPasswordResetEmail(email, resetToken, source);
        }
        return NextResponse.json<IJsonResponse<null>>({ statusCode: 200, message: "If an account with this email exists, a reset link has been sent." });
    } catch (error) {
        return handleError(error);
    }
}