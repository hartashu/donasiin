/**
 * Mengubah alamat string menjadi koordinat [longitude, latitude] menggunakan Nominatim API.
 * @param address Alamat lengkap dalam format string.
 * @returns Array [longitude, latitude] atau null jika tidak ditemukan.
 */
export async function getCoordinates(
  address: string
): Promise<[number, number] | null> {
  const baseUrl = "https://nominatim.openstreetmap.org/search";
  const params = new URLSearchParams({
    q: address,
    format: "json",
    limit: "1",
  });

  const url = `${baseUrl}?${params.toString()}`;

  try {
    const response = await fetch(url, {
      headers: {
        // Header ini wajib diisi sesuai aturan Nominatim
        "User-Agent": "DonationWebApp/1.0 (Contact: begitulah@gmail.com)",
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim API returned status ${response.status}`);
    }

    const data = await response.json();
    console.log("🚀 ~ getCoordinates ~ data:", data);

    // Cek jika alamat ditemukan
    if (data && data.length > 0) {
      const { lon, lat } = data[0];
      // Pastikan mengembalikan dalam format [longitude, latitude]
      return [parseFloat(lon), parseFloat(lat)];
    }

    // Alamat tidak ditemukan
    return null;
  } catch (error) {
    console.error("Geocoding service error:", error);
    return null;
  }
}
