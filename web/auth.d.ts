import 'next-auth';
import 'next-auth/jwt';
import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            username: string | null;
            isEmailVerified: boolean;
        } & DefaultSession['user'];
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        isEmailVerified?: boolean;
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