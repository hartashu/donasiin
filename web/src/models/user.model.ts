import { connectToDb } from "@/config/mongo";
import { IUser, IVerificationToken, IPasswordResetToken } from "@/types/types";
import { v4 as uuidv4 } from 'uuid';
import { hash, compare } from 'bcryptjs';
import { Collection, ObjectId, WithId } from 'mongodb';

const USERS_COLLECTION = "users";
const VERIFICATION_TOKENS_COLLECTION = "verification_tokens";
const PASSWORD_RESET_TOKENS_COLLECTION = "password_reset_tokens";

export class UserModel {
    static async getUsersCollection(): Promise<Collection<IUser>> {
        const db = await connectToDb();
        return db.collection<IUser>(USERS_COLLECTION);
    }
    static async getVerificationTokensCollection(): Promise<Collection<IVerificationToken>> {
        const db = await connectToDb();
        return db.collection<IVerificationToken>(VERIFICATION_TOKENS_COLLECTION);
    }
    static async getPasswordResetTokensCollection(): Promise<Collection<IPasswordResetToken>> {
        const db = await connectToDb();
        return db.collection<IPasswordResetToken>(PASSWORD_RESET_TOKENS_COLLECTION);
    }
    static async getUserByEmail(email: string): Promise<WithId<IUser> | null> {
        const usersCollection = await this.getUsersCollection();
        return usersCollection.findOne({ email });
    }
    static async getUserByUsername(username: string): Promise<WithId<IUser> | null> {
        const usersCollection = await this.getUsersCollection();
        return usersCollection.findOne({ username });
    }
    static async verifyUserPassword(password: string, hashedPassword: string): Promise<boolean> {
        return compare(password, hashedPassword);
    }
    static async createUser(data: Omit<IUser, '_id' | 'createdAt' | 'updatedAt'>): Promise<ObjectId> {
        const usersCollection = await this.getUsersCollection();
        const hashedPassword = data.password ? await hash(data.password, 12) : null;
        const newUser: Omit<IUser, '_id'> = { ...data, password: hashedPassword, createdAt: new Date(), updatedAt: new Date() };
        const result = await usersCollection.insertOne(newUser as IUser);
        return result.insertedId;
    }
    static async createVerificationToken(email: string): Promise<string> {
        const token = uuidv4();
        const expires = new Date(new Date().getTime() + 24 * 3600 * 1000);
        const tokensCollection = await this.getVerificationTokensCollection();
        await tokensCollection.deleteMany({ identifier: email });
        const newVerificationToken: Omit<IVerificationToken, '_id'> = { identifier: email, token, expires };
        await tokensCollection.insertOne(newVerificationToken as IVerificationToken);
        return token;
    }
    static async verifyEmailToken(token: string): Promise<WithId<IUser> | null> {
        const tokensCollection = await this.getVerificationTokensCollection();
        const existingToken = await tokensCollection.findOne({ token, expires: { $gt: new Date() } });
        if (!existingToken) return null;
        const usersCollection = await this.getUsersCollection();
        const existingUser = await this.getUserByEmail(existingToken.identifier);
        if (!existingUser) return null;
        await usersCollection.updateOne({ _id: existingUser._id }, { $set: { isEmailVerified: true, updatedAt: new Date() } });
        await tokensCollection.deleteOne({ _id: existingToken._id });
        return this.getUserByEmail(existingUser.email);
    }
    static async createPasswordResetToken(email: string): Promise<string | null> {
        const user = await this.getUserByEmail(email);
        if (!user) return null;
        const token = uuidv4();
        const expires = new Date(new Date().getTime() + 3600 * 1000);
        const tokensCollection = await this.getPasswordResetTokensCollection();
        const newResetToken: Omit<IPasswordResetToken, '_id'> = { email, token, expires };
        await tokensCollection.deleteMany({ email });
        await tokensCollection.insertOne(newResetToken as IPasswordResetToken);
        return token;
    }
    static async getPasswordResetToken(token: string): Promise<WithId<IPasswordResetToken> | null> {
        const tokensCollection = await this.getPasswordResetTokensCollection();
        return tokensCollection.findOne({ token, expires: { $gt: new Date() } });
    }
    static async deletePasswordResetToken(token: string): Promise<void> {
        const tokensCollection = await this.getPasswordResetTokensCollection();
        await tokensCollection.deleteOne({ token });
    }
    static async updateUserPassword(email: string, newPassword: string): Promise<void> {
        const usersCollection = await this.getUsersCollection();
        const hashedPassword = await hash(newPassword, 12);
        await usersCollection.updateOne({ email }, { $set: { password: hashedPassword, updatedAt: new Date() } });
    }
}