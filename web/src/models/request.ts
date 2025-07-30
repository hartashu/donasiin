// import { connectToDb } from "@/config/mongo";
// import { IRequest, RequestStatus } from "@/types/types";
// import { ObjectId, WithId, InsertOneResult } from "mongodb";

// const REQUEST_COLLECTION = "requests";

// export class RequestModel {
//   static async createRequest(
//     postId: ObjectId,
//     userId: ObjectId
//   ): Promise<InsertOneResult<IRequest>> {
//     const db = await connectToDb();
//     const requestDoc: Omit<IRequest, "_id"> = {
//       postId,
//       userId,
//       status: RequestStatus.PENDING,
//       trackingCode: "",
//       createdAt: new Date(),
//       updatedAt: new Date(),
//     };

//     return db
//       .collection<Omit<IRequest, "_id">>(REQUEST_COLLECTION)
//       .insertOne(requestDoc);
//   }

//   static async getRequestById(
//     requestId: string
//   ): Promise<WithId<IRequest> | null> {
//     const db = await connectToDb();
//     return db
//       .collection<IRequest>(REQUEST_COLLECTION)
//       .findOne({ _id: new ObjectId(requestId) });
//   }

//   /**
//    * Mendapatkan semua permintaan yang DIBUAT oleh seorang user (outgoing)
//    */
//   static async getMyRequests(userId: ObjectId): Promise<WithId<IRequest>[]> {
//     const db = await connectToDb();
//     return db
//       .collection<IRequest>(REQUEST_COLLECTION)
//       .find({ userId })
//       .sort({ createdAt: -1 })
//       .toArray();
//   }

//   /**
//    * Mendapatkan semua permintaan yang MASUK untuk semua post milik seorang user (incoming)
//    */
//   static async getIncomingRequestsForMyPosts(userId: ObjectId): Promise<any[]> {
//     const db = await connectToDb();
//     const pipeline = [
//       {
//         $lookup: {
//           from: "posts",
//           localField: "postId",
//           foreignField: "_id",
//           as: "post",
//         },
//       },
//       { $unwind: "$post" },
//       { $match: { "post.userId": userId } },
//       { $sort: { createdAt: -1 } },
//     ];
//     return db.collection(REQUEST_COLLECTION).aggregate(pipeline).toArray();
//   }

//   /**
//    * Memperbarui status sebuah permintaan
//    */
//   static async updateRequestStatus(
//     requestId: ObjectId,
//     status: RequestStatus,
//     trackingCode?: string
//   ): Promise<boolean> {
//     const db = await connectToDb();
//     const updateData: any = { status, updatedAt: new Date() };
//     if (trackingCode) {
//       updateData.trackingCode = trackingCode;
//     }

//     const result = await db
//       .collection<IRequest>(REQUEST_COLLECTION)
//       .updateOne({ _id: requestId }, { $set: updateData });
//     return result.modifiedCount > 0;
//   }

//   static async findUserRequests(userId: ObjectId): Promise<any[]> {
//     const db = await connectToDb();
//     const pipeline = [
//       // 1. Cari semua request dari user ini
//       { $match: { userId: userId } },

//       // 2. Gabungkan dengan data post terkait
//       {
//         $lookup: {
//           from: "posts",
//           localField: "postId",
//           foreignField: "_id",
//           as: "postDetails",
//         },
//       },

//       // 3. 'Bongkar' array postDetails
//       {
//         $unwind: {
//           path: "$postDetails",
//           preserveNullAndEmptyArrays: true, // Jaga request tetap ada meskipun post-nya sudah dihapus
//         },
//       },

//       // 4. Urutkan berdasarkan tanggal request terbaru
//       { $sort: { createdAt: -1 } },
//     ];
//     return db.collection("requests").aggregate(pipeline).toArray();
//   }
// }

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
      trackingCodeUrl: "",
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
          as: "postDetails",
        },
      },
      { $unwind: { path: "$postDetails", preserveNullAndEmptyArrays: true } },
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

  static async deleteRequestById(requestId: string): Promise<boolean> {
    const db = await connectToDb();
    const result = await db.collection(REQUEST_COLLECTION).deleteOne({
      _id: new ObjectId(requestId),
    });
    return result.deletedCount > 0;
  }

  static async getMyRequests(userId: ObjectId): Promise<WithId<IRequest>[]> {
    const db = await connectToDb();
    return db
      .collection<IRequest>(REQUEST_COLLECTION)
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();
  }

  static async updateTrackingInfo(
    requestId: string,
    trackingCode: string,
    trackingCodeUrl: string
  ): Promise<boolean> {
    const db = await connectToDb();
    const result = await db.collection("requests").updateOne(
      { _id: new ObjectId(requestId) },
      {
        $set: {
          trackingCode,
          trackingCodeUrl,
          updatedAt: new Date(),
        },
      }
    );
    return result.modifiedCount > 0;
  }
}