export default function VerifyNoticePage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
                <h1 className="text-2xl font-bold text-orange-600 mb-4">Verify Your Email</h1>
                <p className="text-gray-700">
                    Your account has been created, but you need to verify your email address to continue.
                </p>
                <p className="text-gray-700 mt-2">
                    Please check your inbox for a verification link.
                </p>
            </div>
        </div>
    );
}