import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import { MongoClient } from 'mongodb';
import { UserModel } from '@/models/user.model';

if (!process.env.MONGODB_URI) {
    throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}
const uri = process.env.MONGODB_URI;
const clientPromise = new MongoClient(uri).connect();

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: MongoDBAdapter(clientPromise, {
        databaseName: process.env.MONGODB_DB,
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
                const user = await UserModel.getUserByEmail(credentials.email as string);
                if (!user || !user.password) return null;
                const isPasswordValid = await UserModel.verifyUserPassword(credentials.password as string, user.password);
                if (!isPasswordValid) return null;
                return {
                    id: user._id.toString(),
                    name: user.fullName,
                    email: user.email,
                    image: user.avatarUrl,
                    username: user.username,
                    address: user.address,
                    dailyLimit: user.dailyLimit,
                };
            },
        }),
    ],
    session: { strategy: 'jwt' },
    pages: { signIn: '/auth/login' },
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === 'google') {
                const existingUser = await UserModel.getUserByEmail(user.email!);
                if (existingUser) {
                    return true;
                }

                const token = await UserModel.createIncompleteProfile({
                    email: user.email!,
                    fullName: user.name,
                    avatarUrl: user.image,
                });

                return `/auth/complete-profile?token=${token}`;
            }
            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                const dbUser = await UserModel.getUserByEmail(user.email!);
                if (dbUser) {
                    token.id = dbUser._id.toString();
                    token.username = dbUser.username;
                    token.fullName = dbUser.fullName;
                    token.avatarUrl = dbUser.avatarUrl;
                    token.address = dbUser.address;
                    token.dailyLimit = dbUser.dailyLimit;
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user && token.id) {
                session.user.id = token.id as string;
                session.user.username = token.username ?? null;
                session.user.fullName = token.fullName ?? null;
                session.user.avatarUrl = token.avatarUrl ?? null;
                session.user.address = token.address ?? null;
                session.user.dailyLimit = token.dailyLimit ?? 0;
            }
            return session;
        },
    },
});