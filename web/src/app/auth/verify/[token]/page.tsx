import { finalizeRegistration } from '@/lib/actions/auth.actions';

interface VerificationPageProps {
    params: {
        token: string;
    };
}

export default async function VerifyPage({ params }: VerificationPageProps) {
    await finalizeRegistration(params.token);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Verifying your account...</h1>
                <p className="text-gray-600">Please wait, we are finalizing your registration.</p>
            </div>
        </div>
    );
}