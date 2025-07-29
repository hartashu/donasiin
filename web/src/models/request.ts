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
import { IRequest, IPost, RequestStatus } from "@/types/types";
import { ObjectId, WithId, InsertOneResult } from "mongodb";

const REQUEST_COLLECTION = "requests";
const POST_COLLECTION = "posts"; // <-- Tambahkan ini

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

    return db.collection<Omit<IRequest, "_id">>(REQUEST_COLLECTION).insertOne(requestDoc);
  }

  static async getRequestById(
    requestId: string
  ): Promise<WithId<IRequest> | null> {
    const db = await connectToDb();
    return db.collection<IRequest>(REQUEST_COLLECTION).findOne({ _id: new ObjectId(requestId) });
  }

  static async findUserRequests(userId: string): Promise<any[]> {
    const db = await connectToDb();
    const userObjectId = new ObjectId(userId);
    const pipeline = [
      { $match: { userId: userObjectId } },
      { $lookup: { from: "posts", localField: "postId", foreignField: "_id", as: "postDetails" } },
      { $unwind: { path: "$postDetails", preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: -1 } },
    ];
    return db.collection("requests").aggregate(pipeline).toArray();
  }

  static async getIncomingRequestsForMyPosts(userId: string): Promise<any[]> {
    const db = await connectToDb();
    const userObjectId = new ObjectId(userId);
    const pipeline = [
      { $lookup: { from: "posts", localField: "postId", foreignField: "_id", as: "post" } },
      { $unwind: "$post" },
      { $match: { "post.userId": userObjectId } },
      { $sort: { createdAt: -1 } },
    ];
    return db.collection(REQUEST_COLLECTION).aggregate(pipeline).toArray();
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

    // --- LOGIKA BARU DITAMBAHKAN DI SINI ---
    if (result.modifiedCount > 0 && (status === RequestStatus.ACCEPTED || status === RequestStatus.COMPLETED)) {
      const updatedRequest = await requestCollection.findOne({ _id: new ObjectId(requestId) });
      if (updatedRequest) {
        const postCollection = db.collection<IPost>(POST_COLLECTION);
        await postCollection.updateOne(
          { _id: updatedRequest.postId },
          { $set: { isAvailable: false } }
        );
      }
    }
    // ------------------------------------

    return result.modifiedCount > 0;
  }
}