import { z } from 'zod';

export const LoginSchema = z.object({
    email: z.string().email({ message: 'Please enter a valid email address.' }),
    password: z.string().min(1, { message: 'Password is required.' }),
});

export const RegisterSchema = z.object({
    fullName: z.string().min(3, { message: 'Full name must be at least 3 characters.' }),
    username: z.string().min(3, { message: 'Username must be at least 3 characters.' }).regex(/^[a-zA-Z0-9_]+$/, { message: 'Username can only contain letters, numbers, and underscores.' }),
    email: z.string().email({ message: 'Please enter a valid email address.' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
    address: z.string().min(10, { message: 'Address must be at least 10 characters long.' }),
});

export const ForgotPasswordSchema = z.object({
    email: z.string().email({
        message: 'Please enter a valid email address.',
    }),
});

export const ResetPasswordSchema = z
    .object({
        password: z.string().min(8, {
            message: 'Password must be at least 8 characters.',
        }),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    });

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;