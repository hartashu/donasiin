import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/auth/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            // const isLoggedIn = !!auth?.user;
            // const isEmailVerified = auth?.user?.isEmailVerified ?? false;
            // const { pathname } = nextUrl;

            // const isVerificationLinkPage = pathname.startsWith('/auth/verify/');
            // const isVerificationNoticePage = pathname.startsWith('/auth/verify-notice');
            // const isProtectedRoute = pathname.startsWith('/dashboard');
            // const isAuthRoute = pathname.startsWith('/auth');

            // // ATURAN #1: Selalu izinkan akses ke link verifikasi dan halaman pemberitahuannya.
            // // Ini adalah pengecualian paling penting untuk memutus loop.
            // if (isVerificationLinkPage || isVerificationNoticePage) {
            //     return true;
            // }

            // // ATURAN #2: Jika pengguna sudah login
            // if (isLoggedIn) {
            //     // Jika belum verifikasi, dan mencoba akses halaman APAPUN selain yang diizinkan di Aturan #1,
            //     // paksa ke halaman pemberitahuan.
            //     if (!isEmailVerified) {
            //         return Response.redirect(new URL('/auth/verify-notice', nextUrl));
            //     }

            //     // Jika sudah terverifikasi dan mencoba akses halaman auth, lempar ke dashboard.
            //     if (isAuthRoute) {
            //         return Response.redirect(new URL('/dashboard', nextUrl));
            //     }
            // }

            // // ATURAN #3: Jika pengguna belum login dan mencoba akses halaman terproteksi
            // else if (isProtectedRoute) {
            //     return false; // Akan di-redirect ke halaman login
            // }

            // ATURAN #4: Izinkan semua kasus lainnya
            return true;
        },
    },
    providers: [],
} satisfies NextAuthConfig;