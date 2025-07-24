import { Suspense } from 'react';
import { VerifyEmailForm } from '@/components/auth/VerifyEmailForm';

function VerificationPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <VerifyEmailForm />
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense>
            <VerificationPage />
        </Suspense>
    );
}