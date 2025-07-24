import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/auth/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isAuthPage = nextUrl.pathname.startsWith('/auth');
            const isProtectedPage = !isAuthPage && nextUrl.pathname !== '/';

            if (isProtectedPage && !isLoggedIn) {
                return false;
            }

            if (isAuthPage && isLoggedIn) {
                return Response.redirect(new URL('/', nextUrl));
            }

            return true;
        },
    },
    providers: [],
} satisfies NextAuthConfig;