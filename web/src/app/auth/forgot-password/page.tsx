import { Suspense } from "react";
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

export default function ForgotPasswordPage() {
    return (
        <Suspense>
            <main className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
                <div
                    className="absolute inset-0 z-0"
                    style={{
                        background: 'linear-gradient(225deg,rgb(9, 62, 50), rgb(9, 62, 50), rgb(142, 202, 195), rgb(2, 54, 42), rgb(9, 62, 50), rgb(142, 202, 195), rgb(9, 62, 50), rgb(255, 255, 255), rgb(255, 255, 255) )',
                        backgroundSize: '400% 400%',
                        animation: 'gradient-flow 90s ease infinite',
                    }}
                />

                <div className="relative z-10 flex flex-col items-center justify-center w-full">
                    <ForgotPasswordForm />
                </div>
            </main>
        </Suspense>
    );
}
