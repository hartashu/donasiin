// lib/ocrService.ts

// 🔽 Gunakan library resmi dari Google
import { GoogleGenerativeAI } from "@google/generative-ai";

// Pastikan GOOGLE_API_KEY Anda ada di .env.local
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

// Helper untuk mengubah URL gambar menjadi format yang dibutuhkan Gemini
async function urlToGenerativePart(url: string) {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  return {
    inlineData: {
      data: Buffer.from(buffer).toString("base64"),
      mimeType: response.headers.get("content-type") || "image/jpeg",
    },
  };
}

export async function recognizeTextFromImage(
  imageUrl: string
): Promise<string | null> {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
    });

    const prompt =
      "You are a highly precise OCR tool. Your only task is to transcribe the text from the provided image exactly as you see it. Return only the raw text from the image.";

    const imagePart = await urlToGenerativePart(imageUrl);

    const result = await model.generateContent([prompt, imagePart]);
    const response = result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error("Google AI OCR Service Error:", error);
    return null;
  }
}

export function extractTrackingNumber(ocrText: string): string | null {
  if (!ocrText) return null;

  // Daftar pola regex untuk berbagai kurir di Indonesia
  const patterns = [
    // J&T (e.g., JP1234567890, JD1234567890)
    { name: "J&T", pattern: /\b(JP|JD)\d{10,12}\b/i },

    // SiCepat (e.g., 001234567890)
    // Seringkali hanya angka, tapi kadang diawali '00'.
    // Kita utamakan yang diawali '00' jika ada.
    { name: "SiCepat", pattern: /\b00\d{10,15}\b/ },

    // Anteraja (e.g., 10001234567890)
    { name: "Anteraja", pattern: /\b1000\d{10,15}\b/ },

    // Ninja Xpress (e.g., SHP1234567890, NVID...)
    { name: "Ninja Xpress", pattern: /\b(SHP|NVID)[A-Z0-9]{9,18}\b/i },

    // JNE (e.g., 0123456789012345) - Umumnya angka panjang
    // Ini diletakkan terakhir karena polanya paling umum.
    { name: "JNE/Umum", pattern: /\b\d{12,20}\b/ },
  ];

  // Lakukan loop pada setiap pola
  for (const { name, pattern } of patterns) {
    const match = ocrText.match(pattern);
    if (match) {
      console.log(`Tracking number found with pattern: ${name}`);
      return match[0].toUpperCase(); // Kembalikan hasil yang cocok
    }
  }

  // Jika tidak ada pola yang cocok
  console.log("No specific tracking number format found.");
  return null;
}
