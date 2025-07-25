import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/actions/auth.actions';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const result = await registerUser(body);

        if (result.error) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json({ success: result.success });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}