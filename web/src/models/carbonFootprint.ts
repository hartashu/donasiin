import { connectToDb } from "@/config/mongo";
import { ICarbonFootprint } from "@/types/types";
import { WithId } from "mongodb";

const CARBON_FOOTPRINTS_COLLECTION = "carbon_footprints";

export class CarbonFootprintModel {
  /**
   * Mencari data jejak karbon berdasarkan nama item atau aliasnya.
   * Pencarian bersifat case-insensitive.
   * @param itemName Nama item yang dicari (e.g., "t-shirt" atau "kaos")
   * @returns Dokumen ICarbonFootprint atau null jika tidak ditemukan.
   */
  static async findByItemName(
    itemName: string
  ): Promise<WithId<ICarbonFootprint> | null> {
    const db = await connectToDb();

    const searchTerm = new RegExp(`^${itemName.trim()}$`, "i");

    const result = await db
      .collection<ICarbonFootprint>(CARBON_FOOTPRINTS_COLLECTION)
      .findOne({
        $or: [{ itemName: searchTerm }, { aliases: searchTerm }],
      });

    return result;
  }
}
