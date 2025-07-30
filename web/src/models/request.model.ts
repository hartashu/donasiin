import { connectToDb } from "@/config/mongo";
import {
    IRequest,
    IPost,
    RequestStatus,
    IRequestWithPostDetails,
} from "@/types/types";
import { ObjectId, WithId, InsertOneResult, DeleteResult } from "mongodb";

const REQUEST_COLLECTION = "requests";
const POST_COLLECTION = "posts";
const USER_COLLECTION = "users";

export class RequestModel {
    static async createRequest(
        postId: ObjectId,
        userId: ObjectId
    ): Promise<InsertOneResult<IRequest>> {
        const db = await connectToDb();
        const requestDoc: Omit<IRequest, "_id"> = {
            postId,
            userId,
            status: RequestStatus.PENDING,
            trackingCode: "",
            trackingCodeUrl: "",
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        return db
            .collection<Omit<IRequest, "_id">>(REQUEST_COLLECTION)
            .insertOne(requestDoc);
    }

    static async getRequestById(
        requestId: string
    ): Promise<WithId<IRequest> | null> {
        const db = await connectToDb();
        return db
            .collection<IRequest>(REQUEST_COLLECTION)
            .findOne({ _id: new ObjectId(requestId) });
    }

    static async findUserRequests(
        userId: string
    ): Promise<IRequestWithPostDetails[]> {
        const db = await connectToDb();
        const userObjectId = new ObjectId(userId);

        const pipeline = [
            { $match: { userId: userObjectId } },
            {
                $lookup: {
                    from: POST_COLLECTION,
                    localField: "postId",
                    foreignField: "_id",
                    pipeline: [
                        {
                            $lookup: {
                                from: USER_COLLECTION,
                                localField: "userId",
                                foreignField: "_id",
                                as: "authorArr"
                            }
                        },
                        { $unwind: { path: "$authorArr", preserveNullAndEmptyArrays: true } },
                        { $addFields: { "author": "$authorArr" } },
                        {
                            $project: {
                                title: 1, slug: 1, thumbnailUrl: 1, category: 1,
                                "author._id": 1, "author.fullName": 1, "author.avatarUrl": 1
                            }
                        }
                    ],
                    as: "postArr"
                }
            },
            { $unwind: { path: "$postArr", preserveNullAndEmptyArrays: true } },
            { $addFields: { postDetails: "$postArr" } },
            {
                $project: {
                    _id: 1,
                    userId: 1,
                    postId: 1,
                    status: 1,
                    createdAt: 1,
                    updatedAt: 1, // 🔥 FIX DI SINI: Tambahkan field updatedAt
                    trackingCode: 1,
                    trackingCodeUrl: 1,
                    postDetails: 1
                }
            },
            { $sort: { createdAt: -1 } },
        ];

        return db
            .collection<IRequest>(REQUEST_COLLECTION)
            .aggregate<IRequestWithPostDetails>(pipeline)
            .toArray();
    }

    static async getIncomingRequestsForMyPosts(
        userId: string
    ): Promise<IRequestWithPostDetails[]> {
        const db = await connectToDb();
        const userObjectId = new ObjectId(userId);
        const pipeline = [
            {
                $lookup: {
                    from: POST_COLLECTION,
                    localField: "postId",
                    foreignField: "_id",
                    as: "postDetails",
                },
            },
            { $unwind: "$postDetails" },
            { $match: { "postDetails.userId": userObjectId } },
            {
                $lookup: {
                    from: USER_COLLECTION,
                    localField: "userId",
                    foreignField: "_id",
                    as: "requesterDetails",
                },
            },
            { $unwind: { path: "$requesterDetails", preserveNullAndEmptyArrays: true } },
            { $addFields: { requester: "$requesterDetails" } },
            { $sort: { createdAt: -1 } },
            {
                $project: {
                    postDetails: 0,
                    requesterDetails: 0,
                }
            }
        ];
        return db
            .collection<IRequest>(REQUEST_COLLECTION)
            .aggregate<IRequestWithPostDetails>(pipeline)
            .toArray();
    }

    static async updateRequestStatus(
        requestId: string,
        status: RequestStatus,
        trackingInfo?: { code?: string; url?: string }
    ): Promise<boolean> {
        const db = await connectToDb();
        const updateData: Partial<IRequest> = { status, updatedAt: new Date() };

        if (trackingInfo?.code) {
            updateData.trackingCode = trackingInfo.code;
        }
        if (trackingInfo?.url) {
            updateData.trackingCodeUrl = trackingInfo.url;
        }

        const requestCollection = db.collection<IRequest>(REQUEST_COLLECTION);

        const result = await requestCollection.updateOne(
            { _id: new ObjectId(requestId) },
            { $set: updateData }
        );

        if (result.modifiedCount > 0 && (status === RequestStatus.ACCEPTED || status === RequestStatus.COMPLETED)) {
            const theRequestThatWasJustUpdated = await requestCollection.findOne({
                _id: new ObjectId(requestId),
            });

            if (theRequestThatWasJustUpdated) {
                const postId = theRequestThatWasJustUpdated.postId;

                const postCollection = db.collection<IPost>(POST_COLLECTION);
                await postCollection.updateOne(
                    { _id: postId },
                    { $set: { isAvailable: false } }
                );

                await requestCollection.updateMany(
                    {
                        postId: postId,
                        _id: { $ne: new ObjectId(requestId) },
                        status: RequestStatus.PENDING
                    },
                    {
                        $set: { status: RequestStatus.REJECTED, updatedAt: new Date() }
                    }
                );
            }
        }

        return result.modifiedCount > 0;
    }

    static async deleteRequest(
        requestId: string,
        userId: string
    ): Promise<DeleteResult> {
        const db = await connectToDb();
        return db.collection<IRequest>(REQUEST_COLLECTION).deleteOne({
            _id: new ObjectId(requestId),
            userId: new ObjectId(userId),
            status: RequestStatus.PENDING,
        });
    }
}
