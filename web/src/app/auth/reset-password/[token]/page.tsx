import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';

interface ResetPasswordPageProps {
    params: Promise<{
        token: string;
    }>;
}

export default async function ResetPasswordPage({ params }: ResetPasswordPageProps) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <ResetPasswordForm token={(await params).token} />
        </div>
    );
}