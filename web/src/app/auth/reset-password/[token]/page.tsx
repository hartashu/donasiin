import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';

interface ResetPasswordPageProps {
    params: {
        token: string;
    };
}

export default function ResetPasswordPage({ params }: ResetPasswordPageProps) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <ResetPasswordForm token={params.token} />
        </div>
    );
}