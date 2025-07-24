import clientPromise from '@/lib/db'
import { hash, compare } from 'bcryptjs'
import { Collection, ObjectId } from 'mongodb'

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

interface VerificationTokenDocument {
    _id: ObjectId;
    identifier: string;
    token: string;
    expires: Date;
}

const getDb = async () => {
    const client = await clientPromise
    return client.db("donation_sharing")
}

const getUsersCollection = async (): Promise<Collection<UserDocument>> => {
    const db = await getDb()
    return db.collection<UserDocument>('users')
}

const getVerificationTokensCollection = async (): Promise<Collection<VerificationTokenDocument>> => {
    const db = await getDb()
    return db.collection<VerificationTokenDocument>('verification_tokens')
}

export const getUserByEmail = async (email: string): Promise<UserDocument | null> => {
    const usersCollection = await getUsersCollection()
    return await usersCollection.findOne({ email })
}

export const getUserByUsername = async (username: string): Promise<UserDocument | null> => {
    const usersCollection = await getUsersCollection()
    return await usersCollection.findOne({ username })
}

export const verifyUserPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    return await compare(password, hashedPassword)
}

export const createUser = async (data: Omit<UserDocument, '_id' | 'createdAt' | 'updatedAt' | 'isEmailVerified' | 'dailyLimit' | 'emailVerified'> & { password: string }) => {
    const usersCollection = await getUsersCollection()
    const hashedPassword = await hash(data.password, 12)
    const result = await usersCollection.insertOne({
        ...data,
        password: hashedPassword,
        isEmailVerified: false,
        emailVerified: null,
        dailyLimit: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
    } as any)
    return result.insertedId
}

export const createVerificationToken = async (email: string): Promise<string> => {
    const tokensCollection = await getVerificationTokensCollection()
    const token = Math.floor(100000 + Math.random() * 900000).toString()
    const expires = new Date(new Date().getTime() + 15 * 60 * 1000)

    await tokensCollection.deleteMany({ identifier: email })

    await tokensCollection.insertOne({
        identifier: email,
        token,
        expires,
    } as any)

    return token
}

export const verifyEmailAndActivateUser = async (email: string, token: string): Promise<boolean> => {
    const tokensCollection = await getVerificationTokensCollection()
    const usersCollection = await getUsersCollection()

    const verificationToken = await tokensCollection.findOne({
        identifier: email,
        token,
        expires: { $gt: new Date() }
    })

    if (!verificationToken) {
        return false
    }

    await usersCollection.updateOne(
        { email },
        { $set: { emailVerified: new Date(), isEmailVerified: true, updatedAt: new Date() } }
    )

    await tokensCollection.deleteOne({ _id: verificationToken._id })

    return true
}