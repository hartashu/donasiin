// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

// const SESSION_COOKIE_NAME = 'authjs.session-token';

// export function middleware(req: NextRequest) {
//     const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME);
//     const { pathname } = req.nextUrl;
//     const isLoggedIn = !!sessionCookie;
//     const isAuthPage = pathname.startsWith('/auth');
//     const isPublic =
//         pathname === '/' ||
//         pathname.startsWith('/auth') ||
//         pathname.startsWith('/donations');

//     const isProtectedPage = !isPublic;

//     if (isProtectedPage && !isLoggedIn) {
//         return NextResponse.redirect(new URL('/auth/login', req.url));
//     }

//     if (isAuthPage && isLoggedIn) {
//         return NextResponse.redirect(new URL('/', req.url));
//     }

//     return NextResponse.next();
// }

// export const config = {
//     matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
// };

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = 'authjs.session-token';

export function middleware(req: NextRequest) {
    const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME);
    const { pathname } = req.nextUrl;
    const isLoggedIn = !!sessionCookie;
    const isAuthPage = pathname.startsWith('/auth');
    const isPublic =
        pathname === '/' ||
        pathname.startsWith('/auth') ||
        pathname.startsWith('/donations');

    const isProtectedPage = !isPublic;

    if (isProtectedPage && !isLoggedIn) {
        return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    if (isAuthPage && isLoggedIn) {
        return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
}

export const config = {
    // PASTIKAN BAGIAN INI SUDAH BENAR
    // Aturan '.*\\..+' akan mengabaikan file seperti LogoDonasiinnobg.jpg
    matcher: ['/((?!api|_next/static|_next/image|.*\\..*).*)'],
};