import { NextRequest, NextResponse } from 'next/server'
import { verifyEmailAndActivateUser } from '@/lib/services/user.service'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, code } = body

        if (!email || !code) {
            return NextResponse.json({ error: 'Email and code are required.' }, { status: 400 })
        }

        const isVerified = await verifyEmailAndActivateUser(email, code)

        if (!isVerified) {
            return NextResponse.json({ error: 'Invalid or expired verification code.' }, { status: 400 })
        }

        return NextResponse.json({ success: 'Email verified successfully!' })

    } catch (error) {
        console.error('VERIFICATION_ERROR', error)
        return NextResponse.json({ error: 'An internal error occurred.' }, { status: 500 })
    }
}