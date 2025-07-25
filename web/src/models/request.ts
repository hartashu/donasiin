import { connectToDb } from "@/config/mongo";
import { IRequest, RequestStatus } from "@/types/types";
import { ObjectId, WithId, InsertOneResult } from "mongodb";

const REQUEST_COLLECTION = "requests";

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

  /**
   * Mendapatkan semua permintaan yang DIBUAT oleh seorang user (outgoing)
   */
  static async getMyRequests(userId: ObjectId): Promise<WithId<IRequest>[]> {
    const db = await connectToDb();
    return db
      .collection<IRequest>(REQUEST_COLLECTION)
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();
  }

  /**
   * Mendapatkan semua permintaan yang MASUK untuk semua post milik seorang user (incoming)
   */
  static async getIncomingRequestsForMyPosts(userId: ObjectId): Promise<any[]> {
    const db = await connectToDb();
    const pipeline = [
      {
        $lookup: {
          from: "posts",
          localField: "postId",
          foreignField: "_id",
          as: "post",
        },
      },
      { $unwind: "$post" },
      { $match: { "post.userId": userId } },
      { $sort: { createdAt: -1 } },
    ];
    return db.collection(REQUEST_COLLECTION).aggregate(pipeline).toArray();
  }

  /**
   * Memperbarui status sebuah permintaan
   */
  static async updateRequestStatus(
    requestId: ObjectId,
    status: RequestStatus,
    trackingCode?: string
  ): Promise<boolean> {
    const db = await connectToDb();
    const updateData: any = { status, updatedAt: new Date() };
    if (trackingCode) {
      updateData.trackingCode = trackingCode;
    }

    const result = await db
      .collection<IRequest>(REQUEST_COLLECTION)
      .updateOne({ _id: requestId }, { $set: updateData });
    return result.modifiedCount > 0;
  }
}
