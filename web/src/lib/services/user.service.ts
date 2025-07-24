import { v4 as uuidv4 } from 'uuid';
import clientPromise from '@/lib/db';
import { hash, compare } from 'bcryptjs';
import { Collection, ObjectId, WithId } from 'mongodb';

export interface UserDocument {
    _id: ObjectId;
    fullName?: string | null;
    username?: string | null;
    email: string;
    emailVerified?: Date | null;
    password?: string | null;
    address?: string | null;
    avatarUrl?: string | null;
    isEmailVerified: boolean;
    dailyLimit: number;
    createdAt: Date;
    updatedAt: Date;
}

interface PasswordResetTokenDocument {
    _id: ObjectId;
    email: string;
    token: string;
    expires: Date;
}

interface VerificationTokenDocument {
    _id: ObjectId;
    identifier: string;
    token: string;
    expires: Date;
}

const getDb = async () => {
    const client = await clientPromise;
    return client.db("donation_sharing");
};

const getUsersCollection = async (): Promise<Collection<UserDocument>> => {
    const db = await getDb();
    return db.collection<UserDocument>('users');
};

const getPasswordResetTokensCollection = async (): Promise<Collection<PasswordResetTokenDocument>> => {
    const db = await getDb();
    return db.collection<PasswordResetTokenDocument>('password_reset_tokens');
};

const getVerificationTokensCollection = async (): Promise<Collection<VerificationTokenDocument>> => {
    const db = await getDb();
    return db.collection<VerificationTokenDocument>('verification_tokens');
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

export const createUser = async (data: Omit<UserDocument, '_id' | 'createdAt' | 'updatedAt' | 'isEmailVerified' | 'dailyLimit' | 'emailVerified'> & { password: string }) => {
    const usersCollection = await getUsersCollection();
    const hashedPassword = await hash(data.password, 12);

    const newUser = {
        ...data,
        password: hashedPassword,
        isEmailVerified: false,
        emailVerified: null,
        dailyLimit: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await usersCollection.insertOne(newUser as any);
    return result.insertedId;
};

export const createVerificationToken = async (email: string): Promise<string> => {
    const tokensCollection = await getVerificationTokensCollection();
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(new Date().getTime() + 15 * 60 * 1000);

    await tokensCollection.deleteMany({ identifier: email });

    const newVerificationToken = {
        identifier: email,
        token,
        expires,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await tokensCollection.insertOne(newVerificationToken as any);
    return token;
};

export const verifyEmailAndActivateUser = async (email: string, token: string): Promise<boolean> => {
    const tokensCollection = await getVerificationTokensCollection();
    const usersCollection = await getUsersCollection();
    const verificationToken = await tokensCollection.findOne({
        identifier: email,
        token,
        expires: { $gt: new Date() }
    });
    if (!verificationToken) return false;

    await usersCollection.updateOne(
        { email },
        { $set: { emailVerified: new Date(), isEmailVerified: true, updatedAt: new Date() } }
    );
    await tokensCollection.deleteOne({ _id: verificationToken._id });
    return true;
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