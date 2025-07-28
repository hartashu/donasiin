import { connectToDb } from '@/config/mongo';
import { IMessage, IConversationInboxItem } from '@/types/types';
import { Collection, ObjectId, WithId } from 'mongodb';

const MESSAGES_COLLECTION = "messages";

export class ChatModel {
    static async getMessagesCollection(): Promise<Collection<IMessage>> {
        const db = await connectToDb();
        return db.collection<IMessage>(MESSAGES_COLLECTION);
    }

    static createConversationId(userId1: string, userId2: string): string {
        return [userId1, userId2].sort().join('_');
    }

    static async getConversations(userId: string): Promise<IConversationInboxItem[]> {
        const messagesCollection = await this.getMessagesCollection();
        const userObjectId = new ObjectId(userId);

        const pipeline = [
            { $match: { $or: [{ senderId: userObjectId }, { receiverId: userObjectId }] } },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: "$conversationId",
                    lastMessage: { $first: "$$ROOT" },
                    allParticipantIds: { $first: { $setUnion: [["$senderId"], ["$receiverId"]] } }
                }
            },
            {
                $addFields: {
                    otherParticipantId: {
                        $arrayElemAt: [{ $filter: { input: "$allParticipantIds", as: "p", cond: { $ne: ["$$p", userObjectId] } } }, 0]
                    }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'otherParticipantId',
                    foreignField: '_id',
                    as: 'otherUserDetails'
                }
            },
            { $unwind: "$otherUserDetails" },
            {
                $project: {
                    _id: 0,
                    conversationId: "$_id",
                    lastMessageText: "$lastMessage.text",
                    lastMessageAt: "$lastMessage.createdAt",
                    otherUser: {
                        _id: "$otherUserDetails._id",
                        fullName: "$otherUserDetails.fullName",
                        username: "$otherUserDetails.username",
                        avatarUrl: "$otherUserDetails.avatarUrl",
                    }
                }
            },
            { $sort: { lastMessageAt: -1 } }
        ];

        const conversations = await messagesCollection.aggregate(pipeline).toArray();
        return conversations as unknown as IConversationInboxItem[];
    }

    static async getMessagesByConversationId(conversationId: string): Promise<WithId<IMessage>[]> {
        const messagesCollection = await this.getMessagesCollection();
        return messagesCollection.find({ conversationId }).sort({ createdAt: 1 }).toArray();
    }

    static async createMessage(senderId: string, receiverId: string, text: string): Promise<WithId<IMessage>> {
        const messagesCollection = await this.getMessagesCollection();
        const conversationId = this.createConversationId(senderId, receiverId);

        const newMessage: Omit<IMessage, '_id'> = {
            conversationId,
            senderId: new ObjectId(senderId),
            receiverId: new ObjectId(receiverId),
            text: text,
            createdAt: new Date(),
        };

        const result = await messagesCollection.insertOne(newMessage as IMessage);
        return { ...newMessage, _id: result.insertedId };
    }

    static async getOrCreateConversation(senderId: string, receiverId: string): Promise<{ conversationId: string }> {
        const conversationId = this.createConversationId(senderId, receiverId);

        const messagesCollection = await this.getMessagesCollection();

        // Cek apakah sudah ada message/conversation yang pakai ID ini
        const existing = await messagesCollection.findOne({ conversationId });

        if (!existing) {
            // Jika belum ada, insert dummy record hanya untuk memastikan conversationId tercatat
            await messagesCollection.insertOne({
            conversationId,
            senderId: new ObjectId(senderId),
            receiverId: new ObjectId(receiverId),
            text: "", // kosong
            createdAt: new Date(),
            } as IMessage);
        }

        return { conversationId };
    }
}