import { NextRequest, NextResponse } from 'next/server';
import { generatePasswordResetLink } from '@/lib/actions/auth.actions';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const result = await generatePasswordResetLink({ email }, 'native');

        return NextResponse.json(result);

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}