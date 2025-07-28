import { connectToDb } from "@/config/mongo";
import { IPost, IUser } from "@/types/types";

const POST_COLLECTION = "posts";
const USERS_COLLECTION = "users";

export class StatsModel {
    static async getTotalUsers(): Promise<number> {
        const db = await connectToDb();
        return db.collection<IUser>(USERS_COLLECTION).countDocuments();
    }

    static async getTotalPosts(): Promise<number> {
        const db = await connectToDb();
        return db.collection<IPost>(POST_COLLECTION).countDocuments();
    }

    static async getTotalCarbonSaved(): Promise<number> {
        const db = await connectToDb();
        const pipeline = [
            {
                $group: {
                    _id: null,
                    total: { $sum: "$carbonKg" }
                }
            }
        ];
        const result = await db.collection<IPost>(POST_COLLECTION).aggregate(pipeline).toArray();
        return result[0]?.total || 0;
    }
}