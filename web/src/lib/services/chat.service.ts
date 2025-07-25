import clientPromise from '@/lib/db';
import { Collection, ObjectId } from 'mongodb';

export interface MessageDocument {
    _id: ObjectId;
    conversationId: string;
    senderId: ObjectId;
    receiverId: ObjectId;
    text: string;
    createdAt: Date;
}

export type Conversation = {
    conversationId: string;
    lastMessageText: string;
    lastMessageAt: Date;
    otherUser: {
        _id: string;
        fullName: string;
        username: string;
        avatarUrl?: string;
    };
};

const getDb = async () => {
    const client = await clientPromise;
    return client.db("donasiin");
};

const getMessagesCollection = async (): Promise<Collection<MessageDocument>> => {
    const db = await getDb();
    return db.collection<MessageDocument>('messages');
};

const createConversationId = (userId1: string, userId2: string) => {
    return [userId1, userId2].sort().join('_');
};

export const getConversations = async (userId: string): Promise<Conversation[]> => {
    const messagesCollection = await getMessagesCollection();
    const userObjectId = new ObjectId(userId);

    const pipeline = [
        { $match: { $or: [{ senderId: userObjectId }, { receiverId: userObjectId }] } },
        { $sort: { createdAt: -1 } },
        {
            $group: {
                _id: "$conversationId",
                lastMessage: { $first: "$$ROOT" },
                participants: { $addToSet: "$senderId" },
                participants2: { $addToSet: "$receiverId" },
            }
        },
        {
            $addFields: {
                allParticipantIds: { $setUnion: ["$participants", "$participants2"] }
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
    return conversations as Conversation[];
};

export const getMessagesByConversationId = async (conversationId: string) => {
    const messagesCollection = await getMessagesCollection();
    return messagesCollection.find({ conversationId }).sort({ createdAt: 1 }).toArray();
};

export const createMessage = async (senderId: string, receiverId: string, text: string) => {
    const messagesCollection = await getMessagesCollection();
    const conversationId = createConversationId(senderId, receiverId);

    const newMessage: Omit<MessageDocument, '_id'> = {
        conversationId,
        senderId: new ObjectId(senderId),
        receiverId: new ObjectId(receiverId),
        text,
        createdAt: new Date(),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await messagesCollection.insertOne(newMessage as any);
    return { ...newMessage, _id: result.insertedId };
};