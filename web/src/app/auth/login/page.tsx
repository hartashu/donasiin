import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <Suspense>
      <main className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
        <div
          className="absolute inset-0 z-0 shimmer-effect"
          style={{
            background: 'linear-gradient(225deg, #003d2b, #0d5e4c, #2a9d8f, #01140e)',
            backgroundSize: '400% 400%',
            animation: 'gradient-flow 25s ease infinite',
          }}
        />

        <div className="relative z-10 flex flex-col items-center justify-center w-full">
          <LoginForm />
        </div>
      </main>
    </Suspense>
  );
}
