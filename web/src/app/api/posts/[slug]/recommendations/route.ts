import { NextRequest, NextResponse } from "next/server";
import { PostModel } from "@/models/post";
import { getSession } from "@/utils/getSession";
import { ObjectId } from "mongodb";
import handleError from "@/errorHandler/errorHandler";
import { UserModel } from "@/models/user";

// export async function getSession() {
//   return { user: { id: "66a4d5b7f4b3e4f1a2c3d520" } };
// }

// export async function GET(
//   _request: NextRequest,
//   { params }: { params: { slug: string } }
// ) {
//   try {
//     const session = await getSession();
//     if (!session?.user?.id) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     // Ambil data lengkap donatur dari database
//     const donor = await UserModel.findUserById(session.user.id);
//     if (!donor?.location) {
//       return NextResponse.json(
//         { error: "Lokasi donatur belum diatur." },
//         { status: 400 }
//       );
//     }

//     // Dapatkan kategori dari postingan yang baru dibuat
//     const post = await PostModel.getPostBySlug(params.slug);
//     if (!post) {
//       return NextResponse.json(
//         { error: "Postingan tidak ditemukan." },
//         { status: 404 }
//       );
//     }

//     // Panggil "mesin" rekomendasi
//     const recommendations = await UserModel.findPotentialRecipients(
//       donor.location.coordinates,
//       post.category,
//       new ObjectId(session.user.id)
//     );

//     return NextResponse.json({ data: recommendations });
//   } catch (error) {
//     return handleError(error);
//   }
// }

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ambil data lengkap donatur dari database
    const donor = await UserModel.findUserById(session.user.id);
    if (!donor?.location) {
      return NextResponse.json(
        { error: "Lokasi donatur belum diatur." },
        { status: 400 }
      );
    }

    // Dapatkan kategori dari postingan yang baru dibuat
    const post = await PostModel.getPostBySlug((await params).slug);
    if (!post) {
      return NextResponse.json(
        { error: "Postingan tidak ditemukan." },
        { status: 404 }
      );
    }

    // Panggil "mesin" rekomendasi
    const recommendations = await UserModel.findPotentialRecipients(
      donor.location.coordinates,
      post.category,
      new ObjectId(session.user.id)
    );

    return NextResponse.json({ data: recommendations });
  } catch (error) {
    return handleError(error);
  }
}
