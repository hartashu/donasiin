import { connectToDb } from "@/config/mongo";
import { IPost } from "@/types/types";
import { ObjectId, WithId } from "mongodb";

const POST_COLLECTION = "posts";

export class PostModel {
  static async getAllPosts(): Promise<WithId<IPost>[]> {
    try {
      const db = await connectToDb();
      const posts = await db
        .collection<IPost>(POST_COLLECTION)
        .find({})
        .toArray();

      return posts;
    } catch (error) {
      throw error;
    }
  }

  static async getPostBySlug(slug: string): Promise<WithId<IPost> | null> {
    try {
      const db = await connectToDb();
      const post = await db.collection<IPost>(POST_COLLECTION).findOne({
        slug,
      });

      return post;
    } catch (error) {
      throw error;
    }
  }
}
