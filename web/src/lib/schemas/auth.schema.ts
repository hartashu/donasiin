import { z } from 'zod'

export const LoginSchema = z.object({
    email: z.string().email({ message: 'Please enter a valid email address.' }),
    password: z.string().min(1, { message: 'Password is required.' }),
})

export const RegisterSchema = z.object({
    fullName: z.string().min(3, { message: 'Full name must be at least 3 characters.' }),
    username: z.string().min(3, { message: 'Username must be at least 3 characters.' }).regex(/^[a-zA-Z0-9_]+$/, { message: 'Username can only contain letters, numbers, and underscores.' }),
    email: z.string().email({ message: 'Please enter a valid email address.' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
})

export const VerifyCodeSchema = z.object({
    code: z.string().length(6, { message: 'Verification code must be 6 digits.' }),
})

export type LoginInput = z.infer<typeof LoginSchema>
export type RegisterInput = z.infer<typeof RegisterSchema>
export type VerifyCodeInput = z.infer<typeof VerifyCodeSchema>