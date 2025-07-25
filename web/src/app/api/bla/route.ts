// /app/api/auth/register/route.ts

import handleError from "@/errorHandler/errorHandler";
import { getCoordinates } from "@/utils/geocoding/geocodingService";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // const body = await request.json();

    // ... (logika hash password, dll.)

    // Panggil Geocoding API untuk mendapatkan koordinat
    const coordinates = await getCoordinates(
      "AEON Mall BSD City, Jalan BSD Raya Utama, Pagedangan, Kabupaten Tangerang"
    );

    const userToCreate = {
      // fullName: validatedData.fullName,
      // username: validatedData.username,
      // email: validatedData.email,
      // password: hashedPassword,
      // address: validatedData.address,
      // Simpan lokasi jika berhasil ditemukan
      location: coordinates
        ? { type: "Point" as const, coordinates: coordinates }
        : undefined,
      // ... field user lainnya
    };

    // Simpan userToCreate ke database...
    // const result = await UserModel.createUser(userToCreate);

    return NextResponse.json(
      { message: "User registered successfully", data: coordinates },
      { status: 201 }
    );
  } catch (error) {
    // ... error handling
    return handleError(error);
  }
}
