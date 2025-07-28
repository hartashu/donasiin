import { IJsonResponse, IPost } from "@/types/types";
import { ObjectId, WithId } from "mongodb";

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/utils/getSession";
import handleError from "@/errorHandler/errorHandler";
import { PostModel } from "@/models/post";
import { postSchema } from "@/utils/validations/post";
import { uploadFile } from "@/utils/cloudinary/cloudinaryService";
import {
  identifyItemFromImage,
  getCarbonFootprintForItem,
} from "@/utils/carbonCredit/carbonAnalysisService";

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;

    const { posts, total } = await PostModel.getAllPosts({
      page,
      limit,
      category,
      search,
    });

    return NextResponse.json<
      IJsonResponse<{
        posts: WithId<IPost>[];
        total: number;
        page: number;
        totalPages: number;
      }>
    >(
      {
        statusCode: 200,
        data: {
          posts,
          total,
          page,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}

// export async function POST(request: Request) {
//   try {
//     const session = await getSession();
//     if (!session?.user?.id) {
//       return NextResponse.json(
//         { statusCode: 401, error: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     const body = await request.json();

//     const validatedData = postSchema.parse(body);

//     const slug = validatedData.title
//       .toLowerCase()
//       .replace(/\s+/g, "-")
//       .replace(/[^\w-]+/g, "");

//     const result = await PostModel.addPost({
//       ...validatedData,
//       slug: slug,
//       imageUrls: validatedData.imageUrls ?? [],
//       userId: new ObjectId(session.user.id),
//     });

//     if (!result.acknowledged) {
//       throw new Error("Add post failed");
//     }

//     return NextResponse.json(
//       {
//         statusCode: 201,
//         message: "Add post success",
//         data: { insertedId: result.insertedId },
//       },
//       { status: 201 }
//     );
//   } catch (error) {
//     return handleError(error);
//   }
// }

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { statusCode: 401, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();

    // 1. Ekstrak data teks dan file
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const itemImages = formData.getAll("itemImages") as File[];
    console.log("🚀 ~ POST ~ itemImages:", itemImages);

    if (itemImages.length === 0) {
      return NextResponse.json(
        { error: "At least one image is required." },
        { status: 400 }
      );
    }

    // 2. Validasi data teks
    postSchema.parse({ title, description, category });

    // 3. Upload semua gambar ke Cloudinary
    const uploadPromises = itemImages.map(async (file) => {
      const buffer = Buffer.from(await file.arrayBuffer());
      return uploadFile(buffer);
    });
    const uploadResults = await Promise.all(uploadPromises);
    const imageUrls = uploadResults.map((result) => result.secure_url);

    // 4. Lakukan analisis AI pada gambar pertama
    const mainImageBuffer = Buffer.from(await itemImages[0].arrayBuffer());
    const analysisResult = await identifyItemFromImage(
      mainImageBuffer,
      itemImages[0].type
    );

    // Validasi hasil identifikasi
    if (!analysisResult) {
      return NextResponse.json(
        {
          error:
            "AI could not identify the item in the image. Please try another photo.",
        },
        { status: 400 }
      );
    }
    const { itemName, quantity } = analysisResult;

    const singleItemCarbon = await getCarbonFootprintForItem(itemName);

    // Validasi hasil estimasi karbon
    if (singleItemCarbon === null) {
      return NextResponse.json(
        {
          error: `AI could not estimate the carbon footprint for: ${itemName}.`,
        },
        { status: 400 }
      );
    }

    const totalCarbonKg = singleItemCarbon * quantity;
    const aiAnalysis = `Donating ${quantity} ${itemName}(s) helps save approximately ${totalCarbonKg.toFixed(
      1
    )} kg of CO2.`;

    // 5. Siapkan dokumen lengkap untuk disimpan

    // --- LOGIKA SLUG UNIK DIMULAI DI SINI ---
    const baseSlug = title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");
    let finalSlug = baseSlug;
    let counter = 2;
    while (await PostModel.isSlugExist(finalSlug)) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }
    // --- LOGIKA SLUG UNIK SELESAI ---

    const slug = title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");
    const postToSave = {
      title,
      slug,
      description,
      category,
      thumbnailUrl: imageUrls[0],
      imageUrls,
      userId: new ObjectId(session.user.id),
      isAvailable: true,
      carbonKg: totalCarbonKg,
      aiAnalysis,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 6. Simpan ke database
    const result = await PostModel.addPost(postToSave);
    if (!result.acknowledged) {
      throw new Error("Failed to create post in database.");
    }

    return NextResponse.json(
      {
        statusCode: 201,
        message: "Post created successfully!",
        data: { insertedId: result.insertedId, slug: postToSave.slug },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}
