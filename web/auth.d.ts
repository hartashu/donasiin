// File: auth.d.ts

import 'next-auth';
import type { DefaultSession } from 'next-auth';

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