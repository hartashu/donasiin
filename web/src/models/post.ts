import { connectToDb } from "@/config/mongo";
import { IPost } from "@/types/types";
import { InsertOneResult, ObjectId, WithId } from "mongodb";

const POST_COLLECTION = "posts";
const USER_COLLECTION = "users";

interface IGetAllPostsParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}

export class PostModel {
  static async isSlugExist(slug: string): Promise<boolean> {
    const db = await connectToDb();
    const post = await db
      .collection(POST_COLLECTION)
      .findOne({ slug }, { projection: { _id: 1 } });
    return !!post;
  }

  static async getAllPosts({
    page = 1,
    limit = 10,
    category,
    search,
  }: IGetAllPostsParams): Promise<{ posts: any[]; total: number }> {
    // Tipe 'posts' diubah ke any[] untuk mengakomodasi data user
    try {
      const db = await connectToDb();
      const skip = (page - 1) * limit;

      // Tahap filter awal
      const matchStage: any = { isAvailable: true };
      if (category) {
        matchStage.category = category;
      }
      if (search) {
        matchStage.title = { $regex: search, $options: "i" };
      }

      const pipeline = [
        // 1. Filter postingan berdasarkan kriteria
        { $match: matchStage },
        // 2. Urutkan postingan terbaru di atas
        { $sort: { createdAt: -1 } },
        // 3. Gabungkan dengan koleksi 'users'
        {
          $lookup: {
            from: "users", // Nama koleksi user
            localField: "userId", // Field dari koleksi 'posts'
            foreignField: "_id", // Field dari koleksi 'users'
            as: "author", // Simpan hasilnya di field 'author'
          },
        },
        // 4. 'Bongkar' array 'author' menjadi objek tunggal
        { $unwind: "$author" },
        // 5. Pilih field yang ingin ditampilkan (buang data sensitif user)
        {
          $project: {
            // Semua field dari Post
            _id: 1,
            title: 1,
            slug: 1,
            thumbnailUrl: 1,
            imageUrls: 1,
            description: 1,
            category: 1,
            isAvailable: 1,
            userId: 1,
            aiAnalysis: 1,
            createdAt: 1,
            updatedAt: 1,

            // Field dari Author (User) yang Anda inginkan
            "author._id": 1,
            "author.avatarUrl": 1,
            "author.username": 1,
            "author.fullName": 1,
            "author.email": 1,
            "author.address": 1,
          },
        },
        // 6. Lakukan paginasi dan hitung total dalam satu query
        {
          $facet: {
            posts: [{ $skip: skip }, { $limit: limit }],
            totalCount: [{ $count: "total" }],
          },
        },
      ];

      const results = await db
        .collection(POST_COLLECTION)
        .aggregate(pipeline)
        .toArray();

      const posts = results[0].posts;
      const total = results[0].totalCount[0]
        ? results[0].totalCount[0].total
        : 0;

      return { posts, total };
    } catch (error) {
      throw error;
    }
  }

  static async getPostBySlug(slug: string): Promise<WithId<IPost> | null> {
    try {
      const db = await connectToDb();
      const pipeline = [
        {
          $match: {
            slug: slug,
          },
        },
        {
          $lookup: {
            from: USER_COLLECTION,
            localField: "userId",
            foreignField: "_id",
            as: "author",
          },
        },
        {
          $unwind: {
            path: "$author",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            password: 0,
            "author.password": 0,
            "author.email": 0,
            "author.isEmailVerified": 0,
            "author.dailyLimit": 0,
            "author.createdAt": 0,
            "author.updatedAt": 0,
          },
        },
      ];

      const results = await db
        .collection<IPost>(POST_COLLECTION)
        .aggregate(pipeline)
        .toArray();

      return (results[0] as WithId<IPost>) || null;
    } catch (error) {
      throw error;
    }
  }

  static async addPost(
    post: Omit<IPost, "_id">
  ): Promise<InsertOneResult<IPost>> {
    const db = await connectToDb();
    const result = await db
      .collection<Omit<IPost, "_id">>(POST_COLLECTION)
      .insertOne({
        ...post,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    return result;
  }

  static async updatePost(
    slug: string,
    data: Partial<IPost>
  ): Promise<boolean> {
    const db = await connectToDb();
    const result = await db
      .collection<IPost>(POST_COLLECTION)
      .updateOne({ slug }, { $set: { ...data, updatedAt: new Date() } });
    return result.modifiedCount > 0;
  }

  static async deletePost(slug: string): Promise<boolean> {
    const db = await connectToDb();
    const result = await db
      .collection<IPost>(POST_COLLECTION)
      .deleteOne({ slug });
    return result.deletedCount > 0;
  }

  static async getPostById(id: string): Promise<WithId<IPost> | null> {
    try {
      const db = await connectToDb();

      if (!ObjectId.isValid(id)) {
        return null;
      }

      const post = await db.collection<IPost>(POST_COLLECTION).findOne({
        _id: new ObjectId(id),
      });

      return post;
    } catch (error) {
      throw error;
    }
  }

  static async findUserPostsWithRequesters(userId: ObjectId): Promise<any[]> {
    const db = await connectToDb();
    const pipeline = [
      // 1. Cari semua post yang dibuat oleh user ini
      { $match: { userId: userId } },
      // 2. Urutkan berdasarkan post terbaru
      { $sort: { createdAt: -1 } },
      // 3. Gabungkan dengan 'requests' untuk mendapatkan semua permintaan terkait post ini
      {
        $lookup: {
          from: "requests",
          localField: "_id",
          foreignField: "postId",
          as: "requests", // Simpan semua request dalam array bernama 'requests'
        },
      },
      // 4. (Opsional tapi direkomendasikan) Gabungkan request dengan data requester-nya
      {
        $lookup: {
          from: "users",
          localField: "requests.userId", // 'userId' dari dalam array 'requests'
          foreignField: "_id",
          as: "requesterDetails",
        },
      },
      // 5. Bentuk ulang data agar rapi
      {
        $addFields: {
          requests: {
            $map: {
              input: "$requests",
              as: "req",
              in: {
                $mergeObjects: [
                  "$$req",
                  {
                    requester: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$requesterDetails",
                            as: "userDetail",
                            cond: { $eq: ["$$userDetail._id", "$$req.userId"] },
                          },
                        },
                        0,
                      ],
                    },
                  },
                ],
              },
            },
          },
        },
      },
      // 6. Pilih field akhir yang ingin ditampilkan
      {
        $project: {
          // Ambil semua field dari post
          title: 1,
          slug: 1,
          thumbnailUrl: 1,
          category: 1,
          isAvailable: 1,
          createdAt: 1,
          // Pilih field dari request dan requester-nya
          "requests._id": 1,
          "requests.status": 1,
          "requests.createdAt": 1,
          "requests.requester._id": 1,
          "requests.requester.username": 1,
          "requests.requester.avatarUrl": 1,
          "requests.requester.fullName": 1,
        },
      },
    ];

    return db.collection("posts").aggregate(pipeline).toArray();
  }

  static async getTotalCarbonSaved(): Promise<number> {
    const db = await connectToDb();

    const pipeline = [
      // Tahap 1: Cari semua request yang sudah selesai
      {
        $match: {
          status: "COMPLETED",
        },
      },
      // Tahap 2: Gabungkan dengan koleksi 'posts' untuk mendapatkan data karbon
      {
        $lookup: {
          from: "posts",
          localField: "postId",
          foreignField: "_id",
          as: "donatedPost",
        },
      },
      // Tahap 3: 'Bongkar' array hasil join
      {
        $unwind: "$donatedPost",
      },
      // Tahap 4: Kelompokkan semua hasil dan jumlahkan nilai 'carbonKg'
      {
        $group: {
          _id: null, // Mengelompokkan semua dokumen menjadi satu
          totalCarbonSaved: { $sum: "$donatedPost.carbonKg" }, // Jumlahkan semua nilai carbonKg
        },
      },
    ];

    const result = await db
      .collection("requests")
      .aggregate(pipeline)
      .toArray();

    // Jika ada donasi yang selesai, kembalikan totalnya. Jika tidak, kembalikan 0.
    if (result.length > 0 && result[0].totalCarbonSaved) {
      return result[0].totalCarbonSaved;
    } else {
      return 0;
    }
  }
}
