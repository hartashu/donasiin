import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 flex-col">
      <div className="mb-4 text-3xl">[LOGO] Donasiin</div>
      <RegisterForm />
    </div>
  );
}
