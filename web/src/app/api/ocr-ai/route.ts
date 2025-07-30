// import {
//   extractTrackingNumber,
//   recognizeTextFromImage,
// } from "@/utils/ocr/ocrService";
// import { NextRequest, NextResponse } from "next/server";

// export const maxDuration = 30;

// export async function POST(req: NextRequest) {
//   try {
//     const { imageUrl } = await req.json();

//     if (!imageUrl) {
//       return NextResponse.json(
//         { error: "Image URL is required" },
//         { status: 400 }
//       );
//     }

//     // 1. Panggil service untuk mendapatkan semua teks dari gambar
//     const fullText = await recognizeTextFromImage(imageUrl);
//     console.log("🚀 ~ POST ~ fullText:", fullText);

//     if (!fullText) {
//       return NextResponse.json(
//         { error: "Failed to recognize text from image" },
//         { status: 500 }
//       );
//     }

//     // 2. Ekstrak nomor resi dari teks tersebut
//     const trackingNumber = extractTrackingNumber(fullText);
//     console.log("🚀 ~ POST ~ trackingNumber:", trackingNumber);

//     if (!trackingNumber) {
//       return NextResponse.json(
//         { error: "Tracking number not found in image" },
//         { status: 404 }
//       );
//     }

//     // 3. Kirim kembali nomor resi dalam format JSON biasa
//     return NextResponse.json({ trackingNumber });
//   } catch (error) {
//     console.error("API Route Error:", error);
//     return NextResponse.json(
//       { error: "An internal server error occurred" },
//       { status: 500 }
//     );
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/utils/cloudinary/cloudinaryService";
import {
  recognizeTextFromImage,
  extractTrackingNumber,
} from "@/utils/ocr/ocrService";
import { RequestModel } from "@/models/request"; // Import RequestModel
import handleError from "@/errorHandler/errorHandler";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // 1. Ambil file gambar resi dan ID permintaan dari FormData
    const receiptImage = formData.get("receiptImage") as File | null;
    const requestId = formData.get("requestId") as string | null;

    if (!receiptImage || !requestId) {
      return NextResponse.json(
        { error: "receiptImage and requestId are required." },
        { status: 400 }
      );
    }

    // 2. Upload gambar resi ke Cloudinary
    const buffer = Buffer.from(await receiptImage.arrayBuffer());
    const uploadResult = await uploadFile(buffer);
    const imageUrl = uploadResult.secure_url;

    // 3. Lakukan OCR pada gambar yang sudah di-upload
    const fullText = await recognizeTextFromImage(imageUrl);
    if (!fullText) {
      return NextResponse.json(
        { error: "Failed to recognize text from receipt image" },
        { status: 500 }
      );
    }

    const trackingNumber = extractTrackingNumber(fullText);
    if (!trackingNumber) {
      return NextResponse.json(
        { error: "Tracking number not found in receipt image" },
        { status: 404 }
      );
    }

    // 4. Simpan nomor resi dan URL gambar ke database
    await RequestModel.updateTrackingInfo(requestId, trackingNumber, imageUrl);

    // 5. Kirim kembali nomor resi yang berhasil didapat
    return NextResponse.json({
      trackingNumber: trackingNumber,
      trackingCodeUrl: imageUrl,
    });
  } catch (error) {
    return handleError(error);
  }
}