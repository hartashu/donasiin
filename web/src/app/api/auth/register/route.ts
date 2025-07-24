import { NextRequest, NextResponse } from 'next/server'
import { RegisterSchema } from '@/lib/schemas/auth.schema'
import { createUser, getUserByEmail, getUserByUsername, createVerificationToken } from '@/lib/services/user.service'
import { sendVerificationEmail } from '@/lib/utils/email'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const validation = RegisterSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid input.' }, { status: 400 })
        }

        const { email, username, password, fullName } = validation.data

        const existingUserByEmail = await getUserByEmail(email)
        if (existingUserByEmail) {
            return NextResponse.json({ error: 'Email already in use.' }, { status: 409 })
        }

        const existingUserByUsername = await getUserByUsername(username)
        if (existingUserByUsername) {
            return NextResponse.json({ error: 'Username already taken.' }, { status: 409 })
        }

        await createUser({ email, password, fullName, username })
        const verificationToken = await createVerificationToken(email)
        await sendVerificationEmail(email, verificationToken)

        return NextResponse.json({ success: 'Confirmation email sent!' }, { status: 201 })

    } catch (error) {
        console.error('REGISTRATION_ERROR', error)
        return NextResponse.json({ error: 'An internal error occurred.' }, { status: 500 })
    }
}