import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <Suspense>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 flex-col">
        <div className="mb-4 text-3xl">[LOGO] Donasiin</div>
        <LoginForm />
      </div>
    </Suspense>
  );
}
