import { connectToDb } from "@/config/mongo";
import { IPost } from "@/types/types";
import { InsertOneResult, ObjectId, WithId } from "mongodb";

const POST_COLLECTION = "posts";
const USER_COLLECTION = "users";

interface IGetAllPostsParams {
  page?: number;
  limit?: number;
  tag?: string;
  search?: string;
}

export class PostModel {
  static async getAllPosts({
    page = 1,
    limit = 10,
    tag,
    search,
  }: IGetAllPostsParams): Promise<{ posts: WithId<IPost>[]; total: number }> {
    try {
      const db = await connectToDb();
      const skip = (page - 1) * limit;

      const query: any = { isAvailable: true };
      if (tag) {
        query.tags = tag;
      }
      if (search) {
        query.title = { $regex: search, $options: "i" };
      }

      const posts = await db
        .collection<IPost>(POST_COLLECTION)
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      const total = await db.collection(POST_COLLECTION).countDocuments(query);

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
}
