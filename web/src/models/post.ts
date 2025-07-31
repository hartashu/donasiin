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

interface IPostWithAuthor extends Omit<IPost, "author"> {
  author: {
    _id: ObjectId;
    avatarUrl: string;
    username: string;
    fullName: string;
    email: string;
    address: string;
  };
}


interface IPostWithRequests {
  title: string;
  slug: string;
  thumbnailUrl: string;
  category: string;
  isAvailable: boolean;
  createdAt: Date;
  requests: {
    _id: ObjectId;
    status: string;
    createdAt: Date;
    requester: {
      _id: ObjectId;
      username: string;
      avatarUrl: string;
      fullName: string;
    };
  }[];
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
  }: IGetAllPostsParams): Promise<{ posts: IPostWithAuthor[]; total: number }> {
    try {
      const db = await connectToDb();
      const skip = (page - 1) * limit;

      type MatchStageType = {
        isAvailable: boolean;
        category?: string;
        title?: { $regex: string; $options: string };
      };

      const matchStage: MatchStageType = { isAvailable: true };

      if (category) matchStage.category = category;
      if (search) matchStage.title = { $regex: search, $options: "i" };


      const pipeline = [
        { $match: matchStage },
        { $sort: { createdAt: -1 } },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "author",
          },
        },
        { $unwind: "$author" },
        {
          $project: {
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
            carbonKg: 1, // <<<--- PERBAIKAN DI SINI
            createdAt: 1,
            updatedAt: 1,
            "author._id": 1,
            "author.avatarUrl": 1,
            "author.username": 1,
            "author.fullName": 1,
            "author.email": 1,
            "author.address": 1,
          },
        },
        {
          $facet: {
            posts: [{ $skip: skip }, { $limit: limit }],
            totalCount: [{ $count: "total" }],
          },
        },
      ];

      const results = await db.collection(POST_COLLECTION).aggregate(pipeline).toArray();
      const posts = results[0].posts;
      const total = results[0].totalCount[0] ? results[0].totalCount[0].total : 0;

      return { posts, total };
    } catch (error) {
      throw error;
    }
  }

  static async getPostBySlug(slug: string): Promise<WithId<IPost> | null> {
    try {
      const db = await connectToDb();
      const pipeline = [
        { $match: { slug: slug } },
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

      const results = await db.collection<IPost>(POST_COLLECTION).aggregate(pipeline).toArray();
      return (results[0] as WithId<IPost>) || null;
    } catch (error) {
      throw error;
    }
  }

  static async addPost(post: Omit<IPost, "_id">): Promise<InsertOneResult<IPost>> {
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

  static async updatePost(slug: string, data: Partial<IPost>): Promise<boolean> {
    const db = await connectToDb();
    const result = await db
      .collection<IPost>(POST_COLLECTION)
      .updateOne({ slug }, { $set: { ...data, updatedAt: new Date() } });
    return result.modifiedCount > 0;
  }

  static async deletePost(slug: string): Promise<boolean> {
    const db = await connectToDb();
    const result = await db.collection<IPost>(POST_COLLECTION).deleteOne({ slug });
    return result.deletedCount > 0;
  }

  static async getPostById(id: string): Promise<WithId<IPost> | null> {
    try {
      const db = await connectToDb();
      if (!ObjectId.isValid(id)) return null;
      const post = await db.collection<IPost>(POST_COLLECTION).findOne({
        _id: new ObjectId(id),
      });
      return post;
    } catch (error) {
      throw error;
    }
  }

  static async findUserPostsWithRequesters(userId: ObjectId): Promise<IPostWithRequests[]> {
    const db = await connectToDb();
    const pipeline = [
      { $match: { userId: userId } },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "requests",
          localField: "_id",
          foreignField: "postId",
          as: "requests",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "requests.userId",
          foreignField: "_id",
          as: "requesterDetails",
        },
      },
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
      {
        $project: {
          title: 1,
          slug: 1,
          thumbnailUrl: 1,
          category: 1,
          isAvailable: 1,
          createdAt: 1,
          description: 1, // Tambahkan description untuk Featured Card
          carbonKg: 1, // <<<--- PERBAIKAN DI SINI
          "requests._id": 1,
          "requests.status": 1,
          "requests.trackingCodeUrl": 1, // Tambahan trackingCodeUrl
          "requests.createdAt": 1,
          "requests.requester._id": 1,
          "requests.requester.username": 1,
          "requests.requester.avatarUrl": 1,
          "requests.requester.fullName": 1,
        },
      },
    ];

    return db.collection("posts").aggregate<IPostWithRequests>(pipeline).toArray();
  }

  static async getTotalCarbonSaved(): Promise<number> {
    const db = await connectToDb();

    const pipeline = [
      { $match: { status: "COMPLETED" } },
      {
        $lookup: {
          from: "posts",
          localField: "postId",
          foreignField: "_id",
          as: "donatedPost",
        },
      },
      { $unwind: "$donatedPost" },
      {
        $group: {
          _id: null,
          totalCarbonSaved: { $sum: "$donatedPost.carbonKg" },
        },
      },
    ];

    const result = await db.collection("requests").aggregate(pipeline).toArray();
    return result[0]?.totalCarbonSaved || 0;
  }
}