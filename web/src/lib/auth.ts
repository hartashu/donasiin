import NextAuth from 'next-auth';
import type { DefaultSession } from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from '@/lib/db';
import { getUserByEmail, verifyUserPassword } from '@/lib/services/user.service';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
        } & DefaultSession['user'];
    }

    interface User {
        username?: string | null;
        dailyLimit?: number;
        address?: string | null;
        isEmailVerified?: boolean;
        fullName?: string | null;
    }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: MongoDBAdapter(clientPromise, {
        databaseName: 'donation_sharing',
    }),
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
        }),
        Credentials({
            async authorize(credentials) {
                if (!credentials?.email || !credentials.password) return null;
                const user = await getUserByEmail(credentials.email as string);
                if (!user || !user.password) return null;
                const isValid = await verifyUserPassword(
                    credentials.password as string,
                    user.password
                );
                if (!isValid) return null;
                return {
                    id: user._id.toString(),
                    name: user.fullName,
                    email: user.email,
                    image: user.avatarUrl,
                };
            },
        }),
    ],
    session: {
        strategy: 'jwt',
    },
    pages: {
        signIn: '/auth/login',
    },
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === 'credentials') {
                return true;
            }

            if (account?.provider === 'google') {
                if (!user.email) return false;

                const existingUser = await getUserByEmail(user.email);

                if (existingUser) {
                    return true;
                }

                const usernameFromEmail = user.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
                const uniqueUsername = `${usernameFromEmail}${Math.floor(100 + Math.random() * 900)}`;

                user.username = uniqueUsername;
                user.fullName = user.name;
                user.dailyLimit = 5;
                user.address = '';
                user.isEmailVerified = true;
            }

            return true;
        },
        jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
            }
            return session;
        },
    },
});