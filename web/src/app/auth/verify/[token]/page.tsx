import { Suspense } from "react";
import { finalizeRegistration } from "@/lib/actions/auth.actions";
import { LoaderCircle } from "lucide-react";

interface VerificationPageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function VerifyPage({ params }: VerificationPageProps) {
  const { token } = await params;
  await finalizeRegistration(token);

  return (
    <Suspense>
      <main className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            background:
              "linear-gradient(225deg,rgb(9, 62, 50), rgb(9, 62, 50), rgb(142, 202, 195), rgb(2, 54, 42), rgb(9, 62, 50), rgb(142, 202, 195), rgb(9, 62, 50), rgb(255, 255, 255), rgb(255, 255, 255) )",
            backgroundSize: "400% 400%",
            animation: "gradient-flow 90s ease infinite",
          }}
        />

        <div className="relative z-10 flex flex-col items-center justify-center w-full">
          <div className="max-w-md w-full animate-subtle-float">
            <div className="bg-white/60 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/20 text-center">
              <div className="flex justify-center items-center mb-4">
                <LoaderCircle className="w-16 h-16 text-[#2a9d8f] animate-spin" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Verifying Your Account...
              </h1>
              <p className="text-gray-700 mt-4">
                Please wait a moment. You will be redirected shortly.
              </p>
            </div>
          </div>
        </div>
      </main>
    </Suspense>
  );
}
