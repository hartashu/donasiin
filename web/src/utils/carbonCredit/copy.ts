// lib/carbonAnalysisService.ts
import { CarbonFootprintModel } from "@/models/carbonFootprint";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

const model = google("models/gemini-1.5-flash-latest");

/**
 * Mengidentifikasi item dan jumlahnya dari gambar.
 */
export async function identifyItemFromImage(
  imageBuffer: Buffer,
  mimeType: string
) {
  try {
    const { object } = await generateObject({
      model,
      schema: z.object({
        itemName: z.string(),
        quantity: z.number(),
      }),
      // 👇 Gunakan 'messages' untuk input kompleks (teks + gambar)
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `From the provided image, identify the main, identical objects and count them.`,
            },
            {
              type: "image",
              image: imageBuffer,
              mimeType,
            },
          ],
        },
      ],
    });
    return object;
  } catch (error) {
    console.error("AI item identification error:", error);
    return null;
  }
}

/**
 * Mengestimasi jejak karbon dari nama barang.
 */
export async function getCarbonFootprintForItem(
  itemName: string
): Promise<number | null> {
  try {
    const { object } = await generateObject({
      model,
      schema: z.object({
        carbonKg: z.number(),
      }),
      // 👇 Untuk teks saja, 'prompt' sudah benar
      prompt: `What is the estimated carbon footprint in kg of CO2 to produce one new "${itemName}"?`,
    });

    return object.carbonKg;
  } catch (error) {
    console.error("Carbon footprint estimation error:", error);
    return null;
  }
}
