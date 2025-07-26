import { NextRequest, NextResponse } from "next/server";
import handleError from "@/errorHandler/errorHandler";
import { uploadFile } from "@/utils/cloudinary/cloudinaryService";
import {
  identifyItemFromImage,
  getCarbonFootprintForItem,
} from "@/utils/carbonCredit/carbonAnalysisService";

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const itemImage = formData.get("itemImage") as File | null;

    if (!itemImage) {
      return NextResponse.json(
        { error: "No item image provided." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await itemImage.arrayBuffer());

    // 1. Panggil service untuk identifikasi (sekarang mengembalikan objek)
    const analysisResult = await identifyItemFromImage(buffer, itemImage.type);
    if (!analysisResult) {
      return NextResponse.json(
        { error: "Could not identify item in image." },
        { status: 400 }
      );
    }

    // Ambil itemName dan quantity dari hasil analisis
    const { itemName, quantity } = analysisResult;

    // 2. Dapatkan estimasi karbon untuk SATU item
    const singleItemCarbon = await getCarbonFootprintForItem(itemName);

    // 3. Upload gambar ke Cloudinary untuk mendapatkan URL
    const uploadResult = await uploadFile(buffer);
    const imageUrl = uploadResult.secure_url;

    let totalCarbonKg = null;
    let aiAnalysis = `Carbon footprint for ${itemName} could not be estimated.`;

    if (singleItemCarbon) {
      // 4. Kalikan dengan jumlah item untuk mendapatkan total
      totalCarbonKg = singleItemCarbon * quantity;
      aiAnalysis = `Donating ${quantity} ${itemName}(s) helps save approximately ${totalCarbonKg.toFixed(
        1
      )} kg of CO2.`;
    }

    // 5. Kirim kembali semua data yang relevan ke frontend
    return NextResponse.json({
      statusCode: 200,
      message: "Analysis complete",
      data: {
        itemName,
        quantity, // <-- Sertakan jumlah
        carbonKg: totalCarbonKg, // <-- Sertakan total karbon
        aiAnalysis,
        imageUrl,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
