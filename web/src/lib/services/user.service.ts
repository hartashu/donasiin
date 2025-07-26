import { v4 as uuidv4 } from 'uuid';
import clientPromise from '@/lib/db';
import { hash, compare } from 'bcryptjs';
import { Collection, ObjectId, WithId } from 'mongodb';

export interface UserDocument {
    _id: ObjectId;
    fullName?: string | null;
    username?: string | null;
    email: string;
    password?: string | null;
    address?: string | null;
    avatarUrl?: string | null;
    dailyLimit: number;
    createdAt: Date;
    updatedAt: Date;
}

interface PendingRegistrationDocument {
    _id: ObjectId;
    email: string;
    password?: string;
    fullName?: string;
    username?: string;
    token: string;
    expires: Date;
}

interface PasswordResetTokenDocument {
    _id: ObjectId;
    email: string;
    token: string;
    expires: Date;
}

const getDb = async () => {
    const client = await clientPromise;
    return client.db("donasiin");
};

const getUsersCollection = async (): Promise<Collection<UserDocument>> => {
    const db = await getDb();
    return db.collection<UserDocument>('users');
};

const getPendingRegistrationsCollection = async (): Promise<Collection<PendingRegistrationDocument>> => {
    const db = await getDb();
    return db.collection<PendingRegistrationDocument>('pending_registrations');
};

const getPasswordResetTokensCollection = async (): Promise<Collection<PasswordResetTokenDocument>> => {
    const db = await getDb();
    return db.collection<PasswordResetTokenDocument>('password_reset_tokens');
};

export const getUserByEmail = async (email: string): Promise<WithId<UserDocument> | null> => {
    const usersCollection = await getUsersCollection();
    return usersCollection.findOne({ email });
};

export const getUserByUsername = async (username: string): Promise<WithId<UserDocument> | null> => {
    const usersCollection = await getUsersCollection();
    return usersCollection.findOne({ username });
};

export const verifyUserPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    return compare(password, hashedPassword);
};

export const createUser = async (data: Omit<UserDocument, '_id' | 'createdAt' | 'updatedAt'>) => {
    const usersCollection = await getUsersCollection();
    const newUser = {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await usersCollection.insertOne(newUser as any);
    return result.insertedId;
};

export const createPendingRegistration = async (data: Omit<PendingRegistrationDocument, '_id' | 'token' | 'expires' | 'password'> & { password?: string }) => {
    const pendingCollection = await getPendingRegistrationsCollection();
    const hashedPassword = data.password ? await hash(data.password, 12) : undefined;
    const token = uuidv4();
    const expires = new Date(new Date().getTime() + 24 * 3600 * 1000);

    await pendingCollection.deleteMany({ email: data.email });

    const newPendingUser = {
        ...data,
        password: hashedPassword,
        token,
        expires,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await pendingCollection.insertOne(newPendingUser as any);
    return token;
};

export const getPendingRegistrationByToken = async (token: string): Promise<WithId<PendingRegistrationDocument> | null> => {
    const pendingCollection = await getPendingRegistrationsCollection();
    return await pendingCollection.findOne({ token, expires: { $gt: new Date() } });
};

export const deletePendingRegistration = async (email: string) => {
    const pendingCollection = await getPendingRegistrationsCollection();
    await pendingCollection.deleteOne({ email });
};

export const createPasswordResetToken = async (email: string): Promise<string | null> => {
    const user = await getUserByEmail(email);
    if (!user) return null;

    const token = uuidv4();
    const expires = new Date(new Date().getTime() + 3600 * 1000);
    const tokensCollection = await getPasswordResetTokensCollection();
    const newResetToken = { email, token, expires };

    await tokensCollection.deleteMany({ email });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await tokensCollection.insertOne(newResetToken as any);
    return token;
};

export const getPasswordResetToken = async (token: string): Promise<WithId<PasswordResetTokenDocument> | null> => {
    const tokensCollection = await getPasswordResetTokensCollection();
    return tokensCollection.findOne({ token, expires: { $gt: new Date() } });
};

export const deletePasswordResetToken = async (token: string): Promise<void> => {
    const tokensCollection = await getPasswordResetTokensCollection();
    await tokensCollection.deleteOne({ token });
};

export const updateUserPassword = async (email: string, newPassword: string): Promise<void> => {
    const usersCollection = await getUsersCollection();
    const hashedPassword = await hash(newPassword, 12);
    await usersCollection.updateOne({ email }, { $set: { password: hashedPassword, updatedAt: new Date() } });
};