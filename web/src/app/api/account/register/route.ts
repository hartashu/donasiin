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

        const newUser = {
            email, password, fullName, username,
            isEmailVerified: false, dailyLimit: 5, address: '', avatarUrl: '',
        };

        const createdUser = await UserModel.createUser(newUser);
        const verificationToken = await UserModel.createVerificationToken(email);
        await sendFinalizeRegistrationEmail(email, verificationToken);

        return NextResponse.json<IJsonResponse<{ userId: string }>>({ statusCode: 201, message: "User registered. Please check your email to verify.", data: { userId: createdUser.toString() } });
    } catch (error) {
        return handleError(error);
    }
}