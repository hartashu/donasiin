import { finalizeRegistration } from '@/lib/actions/auth.actions';

interface VerificationPageProps {
    params: {
        token: string;
    };
    searchParams: {
        from?: string;
    };
}

export default async function VerifyPage({ params, searchParams }: VerificationPageProps) {
    await finalizeRegistration(params.token, searchParams.from);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
                <h1 className="text-2xl font-bold text-green-600 mb-4">Registration Successful!</h1>
                <p className="text-gray-700">Your account has been verified. You can now return to the mobile app and log in.</p>
                <div className="mt-6 text-sm text-gray-500">
                    You can close this page.
                </div>
            </div>
        </div>
    );
}