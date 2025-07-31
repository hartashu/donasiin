import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject, generateText } from "ai";
import { z } from "zod";
import { CarbonFootprintModel } from "@/models/carbonFootprint";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

const model = google("gemini-2.5-flash");


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

    console.log("🚀 ~ identifyItemFromImage ~ object:", object);
    return object;
  } catch (error) {
    console.error("AI item identification error:", error);
    return null;
  }
}


export async function getCarbonFootprintForItem(
  itemName: string
): Promise<number | null> {

  try {
    const { text } = await generateText({
      model,
      prompt: `What is the estimated carbon footprint in kg of CO2 to produce one new "${itemName}"? Answer with only a single number.`,
    });

    const carbonKg = parseFloat(text);
    return isNaN(carbonKg) ? null : carbonKg;
  } catch (error) {
    console.error("Carbon footprint AI estimation error:", error);
    return null;
  }
}

export async function analyzeItem(imageBuffer: Buffer, mimeType: string) {
  try {
    const { object } = await generateObject({
      model,
      schema: z.object({
        itemName: z
          .string()
          .describe("Lowercase name of the item, e.g., 'cotton t-shirt'"),
        quantity: z
          .number()
          .describe("The number of identical items in the image."),
        carbonKg: z
          .number()
          .describe("Estimated carbon footprint in kg CO2 for ONE new item."),
      }),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `From the provided image, identify the main object, count it, and estimate the carbon footprint in kg CO2 to produce a single new one.`,
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
    console.error("AI analysis error:", error);
    return null;
  }
}
