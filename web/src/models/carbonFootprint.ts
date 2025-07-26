// models/carbonFootprint.ts
import { connectToDb } from "@/config/mongo";
import { ICarbonFootprint } from "@/types/types"; // Asumsi Anda sudah membuat interface ini
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

    // Buat pencarian case-insensitive
    const searchTerm = new RegExp(`^${itemName.trim()}$`, "i");

    const result = await db
      .collection<ICarbonFootprint>(CARBON_FOOTPRINTS_COLLECTION)
      .findOne({
        // Cari di field 'itemName' ATAU di dalam array 'aliases'
        $or: [{ itemName: searchTerm }, { aliases: searchTerm }],
      });

    return result;
  }
}
