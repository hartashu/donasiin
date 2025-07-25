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
      // Tahap 1: Temukan semua pengguna & urutkan berdasarkan jarak dari donatur
      {
        $geoNear: {
          near: { type: "Point", coordinates: donorCoordinates },
          distanceField: "distance", // Menyimpan jarak (dalam meter)
          spherical: true,
          query: { _id: { $ne: donorId } }, // Jangan rekomendasikan diri sendiri
        },
      },
      // Tahap 2: Gabungkan dengan 'requests' untuk melihat permintaan mereka
      {
        $lookup: {
          from: "requests",
          localField: "_id",
          foreignField: "userId",
          as: "userRequests",
        },
      },
      // Tahap 3: 'Bongkar' array permintaan
      { $unwind: "$userRequests" },
      // Tahap 4: Filter hanya untuk permintaan yang statusnya PENDING
      { $match: { "userRequests.status": "PENDING" } },
      // Tahap 5: Gabungkan dengan 'posts' untuk melihat kategori barang yang diminta
      {
        $lookup: {
          from: "posts",
          localField: "userRequests.postId",
          foreignField: "_id",
          as: "requestedPost",
        },
      },
      // Tahap 6: 'Bongkar' array postingan
      { $unwind: "$requestedPost" },
      // Tahap 7: Filter hanya untuk postingan yang kategorinya cocok
      { $match: { "requestedPost.category": postCategory } },
      // Tahap 8: Kelompokkan kembali untuk menghindari duplikat pengguna
      {
        $group: {
          _id: "$_id",
          username: { $first: "$username" },
          fullName: { $first: "$fullName" },
          avatarUrl: { $first: "$avatarUrl" },
          distance: { $first: "$distance" },
        },
      },
      // Tahap 9: Urutkan lagi berdasarkan jarak terdekat
      { $sort: { distance: 1 } },
      // Tahap 10: Batasi hasilnya, misal hanya 5 rekomendasi teratas
      { $limit: 5 },
    ];

    const recommendedUsers = await db
      .collection("users")
      .aggregate(pipeline)
      .toArray();
    return recommendedUsers;
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
