import { NextRequest, NextResponse } from "next/server";
import { UserModel } from "@/models/user.model";
import { RegisterSchema } from "@/utils/validations/auth";
import { sendFinalizeRegistrationEmail } from "@/lib/utils/email";
import handleError from "@/errorHandler/errorHandler";
import { IJsonResponse } from "@/types/types";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = RegisterSchema.parse(body);
        const { email, username, password, fullName } = validatedData;

        const existingUser = await UserModel.getUserByEmail(email) || await UserModel.getUserByUsername(username);
        if (existingUser) {
            return NextResponse.json<IJsonResponse<null>>({ statusCode: 409, error: "Email or username is already taken." }, { status: 409 });
        }

        const verificationToken = await UserModel.createPendingRegistration({ email, password, fullName, username });
        await sendFinalizeRegistrationEmail(email, verificationToken);

        return NextResponse.json<IJsonResponse<null>>({ statusCode: 200, message: "Verification email sent! Please check your inbox to complete registration." });
    } catch (error) {
        return handleError(error);
    }
}