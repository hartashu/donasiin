import 'next-auth';
import 'next-auth/jwt';
import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            username: string | null;
            address: string | null;
            fullName?: string | null;
            avatarUrl?: string | null;
            dailyLimit?: number;
            isEmailVerified: boolean;
        } & DefaultSession['user'];
    }

    interface User {
        id: string;
        username?: string | null;
        address?: string | null;
        fullName?: string | null;
        avatarUrl?: string | null;
        dailyLimit?: number;
        isEmailVerified?: boolean;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id?: string;
        username?: string | null;
        address?: string | null;
        fullName?: string | null;
        avatarUrl?: string | null;
        dailyLimit?: number;
        isEmailVerified?: boolean;
    }
}

declare module '@auth/core/adapters' {
    interface AdapterUser {
        username?: string | null;
        address?: string | null;
        fullName?: string | null;
        avatarUrl?: string | null;
        dailyLimit?: number;
        isEmailVerified?: boolean;
    }
}
