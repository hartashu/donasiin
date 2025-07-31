import { NextRequest, NextResponse } from "next/server";
import handleError from "@/errorHandler/errorHandler";
import { uploadFile } from "@/utils/cloudinary/cloudinaryService";
import {
  recognizeTextFromImage,
  extractTrackingNumber,
} from "@/utils/ocr/ocrService";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const itemImages = formData.getAll("itemImages") as File[];
    const receiptImage = formData.get("receiptImage") as File | null;

    if (itemImages.length === 0 && !receiptImage) {
      return NextResponse.json(
        { error: "No files were provided." },
        { status: 400 }
      );
    }

    const responseData = {
      itemUrls: [] as string[],
      receiptUrl: null as string | null,
      trackingNumber: null as string | null,
    };

    if (itemImages.length > 0) {
      const itemUploadPromises = itemImages.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        return uploadFile(buffer);
      });
      const itemResults = await Promise.all(itemUploadPromises);
      responseData.itemUrls = itemResults.map((r) => r.secure_url);
    }

    if (receiptImage) {
      const buffer = Buffer.from(await receiptImage.arrayBuffer());
      const receiptResult = await uploadFile(buffer);
      responseData.receiptUrl = receiptResult.secure_url;

      const ocrText = await recognizeTextFromImage(responseData.receiptUrl);
      if (ocrText) {
        responseData.trackingNumber = extractTrackingNumber(ocrText);
      }
    }

    return NextResponse.json({
      statusCode: 200,
      message: "Uploads processed successfully",
      data: responseData,
    });
  } catch (error) {
    return handleError(error);
  }
}
