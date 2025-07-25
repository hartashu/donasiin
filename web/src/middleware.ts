import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });
    const { pathname } = req.nextUrl;

    const isLoggedIn = !!token;

    const isAuthPage = pathname.startsWith('/auth');
    const isProtectedPage = !isAuthPage && pathname !== '/';

    if (isProtectedPage && !isLoggedIn) {
        return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    if (isAuthPage && isLoggedIn) {
        return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
