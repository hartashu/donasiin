// models/user.ts
import { connectToDb } from "@/config/mongo";
import { IUser } from "@/types/types";
import { ObjectId, WithId } from "mongodb";

export class UserModel {
  static async findPotentialRecipients(
    donorCoordinates: [number, number],
    postCategory: string,
    donorId: ObjectId
  ): Promise<any[]> {
    const db = await connectToDb();
    const pipeline = [
      // 1. Temukan semua pengguna & urutkan berdasarkan jarak dari donatur
      {
        $geoNear: {
          near: { type: "Point", coordinates: donorCoordinates },
          distanceField: "distance", // Menyimpan jarak dalam meter
          spherical: true,
          query: { _id: { $ne: donorId } }, // Jangan rekomendasikan diri sendiri
        },
      },
      // 2. Gabungkan dengan 'requests' untuk melihat permintaan mereka
      {
        $lookup: {
          from: "requests",
          localField: "_id",
          foreignField: "userId",
          as: "userRequests",
        },
      },
      { $unwind: "$userRequests" },
      // 3. Filter hanya untuk permintaan yang statusnya PENDING
      { $match: { "userRequests.status": "PENDING" } },
      // 4. Gabungkan dengan 'posts' untuk mengecek kategori barang
      {
        $lookup: {
          from: "posts",
          localField: "userRequests.postId",
          foreignField: "_id",
          as: "requestedPost",
        },
      },
      { $unwind: "$requestedPost" },
      // 5. Filter hanya untuk postingan yang kategorinya cocok
      { $match: { "requestedPost.category": postCategory } },
      // 6. Kelompokkan untuk menghindari duplikat pengguna
      {
         $group: {
          _id: "$_id",
          username: { $first: "$username" },
          fullName: { $first: "$fullName" },
          avatarUrl: { $first: "$avatarUrl" },
          address: { $first: "$address" },
          distance: { $first: "$distance" },
        },
      },
      { $sort: { distance: 1 } },
      // 7. Batasi hasilnya, misal hanya 5 rekomendasi teratas
      { $limit: 5 },
    ];

    return db.collection("users").aggregate(pipeline).toArray();
  }

  static async findUserById(
    userId: string | ObjectId
  ): Promise<WithId<IUser> | null> {
    const db = await connectToDb();
    const id = typeof userId === "string" ? new ObjectId(userId) : userId;
    const user = await db.collection<IUser>("users").findOne({ _id: id });
    return user;
  }
}
