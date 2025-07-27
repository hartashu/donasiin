"use server";

import { z } from "zod";
import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { LoginSchema } from "@/utils/validations/auth";
import { UserModel } from "@/models/user.model";
import { redirect } from "next/navigation";

export async function login(values: z.infer<typeof LoginSchema>) {
  const validatedFields = LoginSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }
  const { email, password } = validatedFields.data;

  const pendingUser = await UserModel.getPendingRegistrationByEmail(email);
  if (pendingUser) {
    return { error: "Please check your inbox to verify your account first." };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.name) {
        case "CredentialsSignin":
          return { error: "Invalid email or password!" };
        default:
          return { error: "Something went wrong." };
      }
    }
    throw error;
  }
}

export async function finalizeRegistration(
  token: string,
  from?: string | null
) {
  const pendingUser = await UserModel.getPendingRegistrationByToken(token);
  if (!pendingUser) {
    return redirect("/auth/register?error=invalid_token");
  }

  const existingUser = await UserModel.getUserByEmail(pendingUser.email);
  if (existingUser) {
    await UserModel.deletePendingRegistration(pendingUser.email);
    return redirect("/auth/login?message=account_already_exists");
  }

  await UserModel.createUser({
    email: pendingUser.email,
    password: pendingUser.password,
    fullName: pendingUser.fullName ?? "",
    username: pendingUser.username ?? "",
    address: pendingUser.address ?? "",
    dailyLimit: 5,
    avatarUrl: "",
    location: pendingUser.location,
  });

  await UserModel.deletePendingRegistration(pendingUser.email);

  if (from !== "native") {
    redirect("/auth/login?message=registration_successful");
  }
}
