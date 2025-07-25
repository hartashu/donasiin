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

export const { handlers, signIn, signOut, auth, } = NextAuth({
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
                if (!user.isEmailVerified) {
                    throw new Error("Email has not been verified.");
                }
                return {
                    id: user._id.toString(), name: user.fullName, email: user.email,
                    image: user.avatarUrl, username: user.username,
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
                if (!existingUser) {
                    const usernameFromEmail = user.email!.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
                    const uniqueUsername = `${usernameFromEmail}${Math.floor(100 + Math.random() * 900)}`;
                    await UserModel.createUser({
                        email: user.email!, fullName: user.name ?? "New User", username: uniqueUsername,
                        avatarUrl: user.image ?? "", isEmailVerified: true, dailyLimit: 5, address: '', password: null,
                    });
                }
            }
            return true;
        },
        async jwt({ token, user }) {
            const dbUser = await UserModel.getUserByEmail(token.email!);
            if (!dbUser) {
                token.id = user!.id;
                return token;
            }
            return {
                id: dbUser._id.toString(),
                name: dbUser.fullName,
                email: dbUser.email,
                picture: dbUser.avatarUrl,
                username: dbUser.username,
                isEmailVerified: dbUser.isEmailVerified,
            };
        },
        async session({ session, token }) {
            session.user.id = token.id as string;
            session.user.username = token.username as string;
            session.user.isEmailVerified = token.isEmailVerified as boolean;
            return session;
        },
    },
});