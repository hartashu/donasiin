import { connectToDb } from "@/config/mongo";
import {
  IUser,
  IPendingRegistration,
  IPasswordResetToken,
} from "@/types/types";
import { v4 as uuidv4 } from "uuid";
import { hash, compare } from "bcryptjs";
import { Collection, ObjectId, WithId } from "mongodb";
import { IIncompleteProfile } from "@/types/types";

const INCOMPLETE_PROFILES_COLLECTION = "incomplete_profiles";
const USERS_COLLECTION = "users";
const PENDING_REGISTRATIONS_COLLECTION = "pending_registrations";
const PASSWORD_RESET_TOKENS_COLLECTION = "password_reset_tokens";

export class UserModel {

  static async getTotalUsers(): Promise<number> {
    const usersCollection = await this.getUsersCollection();
    return usersCollection.countDocuments();
  }

  static async getIncompleteProfilesCollection(): Promise<Collection<IIncompleteProfile>> {
    const db = await connectToDb();
    return db.collection<IIncompleteProfile>(INCOMPLETE_PROFILES_COLLECTION);
  }

  static async createIncompleteProfile(data: { email: string; fullName?: string | null; avatarUrl?: string | null; }): Promise<string> {
    const incompleteCollection = await this.getIncompleteProfilesCollection();
    const token = uuidv4();
    const expires = new Date(new Date().getTime() + 15 * 60 * 1000); // Token valid 15 menit

    await incompleteCollection.deleteMany({ email: data.email });

    const newProfile: Omit<IIncompleteProfile, '_id'> = { ...data, token, expires };
    await incompleteCollection.insertOne(newProfile as IIncompleteProfile);
    return token;
  }

  static async getIncompleteProfileByToken(token: string): Promise<WithId<IIncompleteProfile> | null> {
    const incompleteCollection = await this.getIncompleteProfilesCollection();
    return incompleteCollection.findOne({ token, expires: { $gt: new Date() } });
  }

  static async deleteIncompleteProfile(email: string): Promise<void> {
    const incompleteCollection = await this.getIncompleteProfilesCollection();
    await incompleteCollection.deleteOne({ email });
  }

  static async getUserById(id: string): Promise<WithId<IUser> | null> {
    if (!ObjectId.isValid(id)) return null;
    const usersCollection = await this.getUsersCollection();
    return usersCollection.findOne({ _id: new ObjectId(id) });
  }

  static async getUsersCollection(): Promise<Collection<IUser>> {
    const db = await connectToDb();
    return db.collection<IUser>(USERS_COLLECTION);
  }

  static async getPendingRegistrationsCollection(): Promise<
    Collection<IPendingRegistration>
  > {
    const db = await connectToDb();
    return db.collection<IPendingRegistration>(
      PENDING_REGISTRATIONS_COLLECTION
    );
  }

  static async getPasswordResetTokensCollection(): Promise<
    Collection<IPasswordResetToken>
  > {
    const db = await connectToDb();
    return db.collection<IPasswordResetToken>(PASSWORD_RESET_TOKENS_COLLECTION);
  }

  static async getUserByEmail(email: string): Promise<WithId<IUser> | null> {
    const usersCollection = await this.getUsersCollection();
    return usersCollection.findOne({ email });
  }

  static async getPendingRegistrationByEmail(
    email: string
  ): Promise<WithId<IPendingRegistration> | null> {
    const pendingCollection = await this.getPendingRegistrationsCollection();
    return pendingCollection.findOne({ email });
  }

  static async getUserByUsername(
    username: string
  ): Promise<WithId<IUser> | null> {
    const usersCollection = await this.getUsersCollection();
    return usersCollection.findOne({ username });
  }

  static async verifyUserPassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return compare(password, hashedPassword);
  }

  static async createUser(
    data: Omit<IUser, "_id" | "createdAt" | "updatedAt">
  ): Promise<ObjectId> {
    const usersCollection = await this.getUsersCollection();
    const newUser: Omit<IUser, "_id"> = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await usersCollection.insertOne(newUser as IUser);
    return result.insertedId;
  }

  // static async createPendingRegistration(data: { email: string; password?: string; fullName?: string; username?: string; address?: string; }): Promise<string> {
  //     const pendingCollection = await this.getPendingRegistrationsCollection();
  //     const hashedPassword = data.password ? await hash(data.password, 12) : undefined;
  //     const token = uuidv4();
  //     const expires = new Date(new Date().getTime() + 24 * 3600 * 1000);
  //     await pendingCollection.deleteMany({ email: data.email });
  //     const newPendingUser: Omit<IPendingRegistration, '_id'> = { ...data, password: hashedPassword, token, expires };
  //     await pendingCollection.insertOne(newPendingUser as IPendingRegistration);
  //     return token;
  // }

  static async createPendingRegistration(data: {
    email: string;
    password?: string;
    fullName?: string;
    username?: string;
    address?: string;
    location?: { type: "Point"; coordinates: [number, number] };
  }): Promise<string> {
    const pendingCollection = await this.getPendingRegistrationsCollection();
    const hashedPassword = data.password
      ? await hash(data.password, 12)
      : undefined;
    const token = uuidv4();
    const expires = new Date(new Date().getTime() + 24 * 3600 * 1000); // 24 jam

    await pendingCollection.deleteMany({ email: data.email });

    const newPendingUser: Omit<IPendingRegistration, "_id"> = {
      ...data,
      password: hashedPassword,
      token,
      expires,
    };

    await pendingCollection.insertOne(newPendingUser as IPendingRegistration);
    return token;
  }

  static async getPendingRegistrationByToken(
    token: string
  ): Promise<WithId<IPendingRegistration> | null> {
    const pendingCollection = await this.getPendingRegistrationsCollection();
    return pendingCollection.findOne({ token, expires: { $gt: new Date() } });
  }

  static async deletePendingRegistration(email: string): Promise<void> {
    const pendingCollection = await this.getPendingRegistrationsCollection();
    await pendingCollection.deleteOne({ email });
  }

  static async createPasswordResetToken(email: string): Promise<string | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;
    const token = uuidv4();
    const expires = new Date(new Date().getTime() + 3600 * 1000);
    const tokensCollection = await this.getPasswordResetTokensCollection();
    const newResetToken: Omit<IPasswordResetToken, "_id"> = {
      email,
      token,
      expires,
    };
    await tokensCollection.deleteMany({ email });
    await tokensCollection.insertOne(newResetToken as IPasswordResetToken);
    return token;
  }

  static async getPasswordResetToken(
    token: string
  ): Promise<WithId<IPasswordResetToken> | null> {
    const tokensCollection = await this.getPasswordResetTokensCollection();
    return tokensCollection.findOne({ token, expires: { $gt: new Date() } });
  }

  static async deletePasswordResetToken(token: string): Promise<void> {
    const tokensCollection = await this.getPasswordResetTokensCollection();
    await tokensCollection.deleteOne({ token });
  }

  static async updateUserPassword(
    email: string,
    newPassword: string
  ): Promise<void> {
    const usersCollection = await this.getUsersCollection();
    const hashedPassword = await hash(newPassword, 12);
    await usersCollection.updateOne(
      { email },
      { $set: { password: hashedPassword, updatedAt: new Date() } }
    );
  }

  // Tambahkan di dalam class UserModel
  // Tambahkan di dalam class UserModel
  static async updateUserProfile(userId: ObjectId, data: Partial<IUser>): Promise<boolean> {
    const usersCollection = await this.getUsersCollection();

    const updateData: Partial<IUser> = {};
    if (data.fullName) updateData.fullName = data.fullName;
    if (data.username) updateData.username = data.username;
    if (data.address) updateData.address = data.address;
    if (data.avatarUrl) updateData.avatarUrl = data.avatarUrl;
    if (data.location) updateData.location = data.location;

    if (Object.keys(updateData).length === 0) return true;

    updateData.updatedAt = new Date();

    const result = await usersCollection.updateOne({ _id: userId }, { $set: updateData });
    return result.modifiedCount > 0;
  }
}
