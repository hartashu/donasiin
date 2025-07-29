import { connectToDb } from "@/config/mongo";
import { IRequest, RequestStatus } from "@/types/types";
import { ObjectId, WithId, InsertOneResult } from "mongodb";

const REQUEST_COLLECTION = "requests";

export class RequestModel {
  // models/request.ts

  static async createRequest(
    postId: ObjectId,
    userId: ObjectId
  ): Promise<InsertOneResult<IRequest> | string> {
    const db = await connectToDb();
    const usersCollection = db.collection("users");
    const requestsCollection = db.collection("requests");

    // 1. Cari user dan cek limitnya
    const user = await usersCollection.findOne({ _id: userId });

    if (!user) {
      return "USER_NOT_FOUND";
    }

    if (user.dailyLimit <= 0) {
      return "LIMIT_EXCEEDED";
    }

    // 2. Kurangi dailyLimit sebesar 1
    await usersCollection.updateOne(
      { _id: userId },
      { $inc: { dailyLimit: -1 } }
    );

    // 3. Buat dokumen request baru
    const requestDoc: Omit<IRequest, "_id"> = {
      postId,
      userId,
      status: RequestStatus.PENDING,
      trackingCode: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return requestsCollection.insertOne(requestDoc);
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

  static async findUserRequests(userId: ObjectId): Promise<any[]> {
    const db = await connectToDb();
    const pipeline = [
      // 1. Cari semua request dari user ini
      { $match: { userId: userId } },

      // 2. Gabungkan dengan data post terkait
      {
        $lookup: {
          from: "posts",
          localField: "postId",
          foreignField: "_id",
          as: "postDetails",
        },
      },

      // 3. 'Bongkar' array postDetails
      {
        $unwind: {
          path: "$postDetails",
          preserveNullAndEmptyArrays: true, // Jaga request tetap ada meskipun post-nya sudah dihapus
        },
      },

      // 4. Urutkan berdasarkan tanggal request terbaru
      { $sort: { createdAt: -1 } },
    ];
    return db.collection("requests").aggregate(pipeline).toArray();
  }

  static async deleteRequestById(requestId: string): Promise<boolean> {
    const db = await connectToDb();
    const result = await db.collection(REQUEST_COLLECTION).deleteOne({
      _id: new ObjectId(requestId),
    });
    return result.deletedCount > 0;
  }
}
