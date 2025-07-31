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

    const analysisResult = await identifyItemFromImage(buffer, itemImage.type);
    if (!analysisResult) {
      return NextResponse.json(
        { error: "Could not identify item in image." },
        { status: 400 }
      );
    }

    const { itemName, quantity } = analysisResult;

    const singleItemCarbon = await getCarbonFootprintForItem(itemName);

    const uploadResult = await uploadFile(buffer);
    const imageUrl = uploadResult.secure_url;

    let totalCarbonKg = null;
    let aiAnalysis = `Carbon footprint for ${itemName} could not be estimated.`;

    if (singleItemCarbon) {
      totalCarbonKg = singleItemCarbon * quantity;
      aiAnalysis = `Donating ${quantity} ${itemName}(s) helps save approximately ${totalCarbonKg.toFixed(
        1
      )} kg of CO2.`;
    }

    return NextResponse.json({
      statusCode: 200,
      message: "Analysis complete",
      data: {
        itemName,
        quantity,
        carbonKg: totalCarbonKg,
        aiAnalysis,
        imageUrl,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
