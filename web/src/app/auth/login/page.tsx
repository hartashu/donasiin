import { Suspense } from 'react'
import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
    return (
        <Suspense>
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <LoginForm />
            </div>
        </Suspense>
    )
}