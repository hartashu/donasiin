import NextAuth from 'next-auth';
import type { DefaultSession } from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from '@/lib/db';
import { getUserByEmail, verifyUserPassword, createUser } from '@/lib/services/user.service';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            username: string | null;
        } & DefaultSession['user'];
    }

    interface User {
        username?: string | null;
    }
}

declare module '@auth/core/adapters' {
    interface AdapterUser {
        username?: string | null;
        dailyLimit?: number;
        address?: string | null;
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
            allowDangerousEmailAccountLinking: true,
        }),
        Credentials({
            async authorize(credentials) {
                if (!credentials?.email || !credentials.password) return null;
                const user = await getUserByEmail(credentials.email as string);
                if (!user || !user.password) return null;
                const isValid = await verifyUserPassword(credentials.password as string, user.password);
                if (!isValid) return null;
                return {
                    id: user._id.toString(),
                    name: user.fullName,
                    email: user.email,
                    image: user.avatarUrl,
                    username: user.username,
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
            if (account?.provider === 'google') {
                if (!user.email) return false;
                const existingUser = await getUserByEmail(user.email);

                if (!existingUser) {
                    const usernameFromEmail = user.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
                    const uniqueUsername = `${usernameFromEmail}${Math.floor(100 + Math.random() * 900)}`;

                    await createUser({
                        email: user.email,
                        fullName: user.name,
                        username: uniqueUsername,
                        avatarUrl: user.image,
                        dailyLimit: 5,
                        address: '',
                        password: null,
                    });
                }
            }
            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                const dbUser = await getUserByEmail(user.email!);
                if (dbUser) {
                    token.id = dbUser._id.toString();
                    token.username = dbUser.username;
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.username = token.username as string;
            }
            return session;
        },
    },
});