// /app/api/ocr-ai/route.ts
import {
  extractTrackingNumber,
  recognizeTextFromImage,
} from "@/utils/ocr/ocrService";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    // 1. Panggil service untuk mendapatkan semua teks dari gambar
    const fullText = await recognizeTextFromImage(imageUrl);
    console.log("🚀 ~ POST ~ fullText:", fullText);

    if (!fullText) {
      return NextResponse.json(
        { error: "Failed to recognize text from image" },
        { status: 500 }
      );
    }

    // 2. Ekstrak nomor resi dari teks tersebut
    const trackingNumber = extractTrackingNumber(fullText);
    console.log("🚀 ~ POST ~ trackingNumber:", trackingNumber);

    if (!trackingNumber) {
      return NextResponse.json(
        { error: "Tracking number not found in image" },
        { status: 404 }
      );
    }

    // 3. Kirim kembali nomor resi dalam format JSON biasa
    return NextResponse.json({ trackingNumber });
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { error: "An internal server error occurred" },
      { status: 500 }
    );
  }
}
