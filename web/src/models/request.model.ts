import { connectToDb } from "@/config/mongo";
import {
    IRequest,
    IPost,
    RequestStatus,
    IRequestWithPostDetails,
} from "@/types/types";
import { ObjectId, WithId, InsertOneResult } from "mongodb";

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
            // 1. Cari semua request dari user ini
            { $match: { userId: userObjectId } },

            // 2. Lakukan lookup ke collection 'posts'
            {
                $lookup: {
                    from: POST_COLLECTION,
                    localField: "postId",
                    foreignField: "_id",
                    // Lakukan lookup bersarang untuk mengambil author-nya juga
                    pipeline: [
                        {
                            $lookup: {
                                from: USER_COLLECTION,
                                localField: "userId",
                                foreignField: "_id",
                                as: "authorArr"
                            }
                        },
                        {
                            $unwind: {
                                path: "$authorArr",
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        {
                            $addFields: {
                                "author": "$authorArr"
                            }
                        },
                        {
                            $project: { // Pilih hanya field yang kita butuhkan dari post dan author
                                title: 1, slug: 1, thumbnailUrl: 1, category: 1,
                                "author._id": 1, "author.fullName": 1, "author.avatarUrl": 1
                            }
                        }
                    ],
                    as: "postArr"
                }
            },

            // 3. Unwind hasil lookup post. Ini penting untuk kasus post yang dihapus.
            {
                $unwind: {
                    path: "$postArr",
                    preserveNullAndEmptyArrays: true
                }
            },

            // 4. Rapikan nama field menjadi 'postDetails'
            {
                $addFields: {
                    postDetails: "$postArr"
                }
            },

            // 5. Proyeksi akhir. INI PERBAIKANNYA.
            // Kita hanya melakukan INKLUSI (memilih field yang akan diambil).
            // Kita tidak mencampur dengan EKSKLUSI (membuang field).
            {
                $project: {
                    _id: 1,
                    userId: 1,
                    postId: 1,
                    status: 1,
                    createdAt: 1,
                    postDetails: 1
                    // Field 'postArr' otomatis tidak akan terbawa karena tidak disebutkan di sini.
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
                    localField: "postDetails.userId",
                    foreignField: "_id",
                    as: "authorDetails",
                },
            },
            {
                $unwind: {
                    path: "$authorDetails",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $addFields: {
                    "postDetails.author": "$authorDetails",
                },
            },
            { $sort: { createdAt: -1 } },
        ];
        return db
            .collection<IRequest>(REQUEST_COLLECTION)
            .aggregate<IRequestWithPostDetails>(pipeline)
            .toArray();
    }

    static async updateRequestStatus(
        requestId: string,
        status: RequestStatus,
        trackingCode?: string
    ): Promise<boolean> {
        const db = await connectToDb();
        const updateData: Partial<IRequest> = { status, updatedAt: new Date() };
        if (trackingCode) {
            updateData.trackingCode = trackingCode;
        }

        const requestCollection = db.collection<IRequest>(REQUEST_COLLECTION);

        const result = await requestCollection.updateOne(
            { _id: new ObjectId(requestId) },
            { $set: updateData }
        );

        // Auto set isAvailable: false
        if (
            result.modifiedCount > 0 &&
            (status === RequestStatus.ACCEPTED || status === RequestStatus.COMPLETED)
        ) {
            const updatedRequest = await requestCollection.findOne({
                _id: new ObjectId(requestId),
            });
            if (updatedRequest) {
                const postCollection = db.collection<IPost>(POST_COLLECTION);
                await postCollection.updateOne(
                    { _id: updatedRequest.postId },
                    { $set: { isAvailable: false } }
                );
            }
        }

        return result.modifiedCount > 0;
    }
}
