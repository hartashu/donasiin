# API Documentation: Post Management (`/api/posts`)

**Last Updated:** 2025-07-27

Endpoint ini menangani semua operasi terkait postingan donasi, mulai dari mengambil daftar hingga membuat postingan baru.

---

## `GET /api/posts`

Mengambil daftar semua postingan donasi yang tersedia dengan fitur paginasi, pencarian, dan filter. Endpoint ini menggabungkan data postingan dengan informasi publik dari penulisnya.

- **Method**: `GET`
- **URL**: `/api/posts`
- **Autentikasi**: Tidak Wajib
- **Query Parameters**:
  - `page` (opsional, `number`): Nomor halaman yang ingin ditampilkan. **Default**: `1`.
  - `limit` (opsional, `number`): Jumlah item per halaman. **Default**: `10`.
  - `category` (opsional, `string`): Filter postingan berdasarkan kategori tertentu (contoh: `Pakaian`).
  - `search` (opsional, `string`): Cari postingan berdasarkan judul (contoh: `kemeja`).

### Response Sukses (`200 OK`)

Mengembalikan objek yang berisi daftar postingan beserta metadata paginasi.

- **Contoh Response Body**:
  ```json
  {
    "statusCode": 200,
    "data": {
      "posts": [
        {
          "_id": "66a3d1f8f4b3e4f1a2c3d4fa",
          "title": "Kemeja Flanel Bekas Layak Pakai",
          "slug": "kemeja-flanel-bekas-layak-pakai",
          "thumbnailUrl": "[https://images.unsplash.com/photo-1589998059171-988d887df646](https://images.unsplash.com/photo-1589998059171-988d887df646)",
          "imageUrls": [
            "[https://images.unsplash.com/photo-1521572163474-6864f9cf17ab](https://images.unsplash.com/photo-1521572163474-6864f9cf17ab)"
          ],
          "description": "Kemeja flanel ukuran L, kondisi 8/10. Jarang dipakai.",
          "category": "Pakaian",
          "isAvailable": true,
          "userId": "66a3d1b9f4b3e4f1a2c3d4e5",
          "aiAnalysis": "Mendonasikan kemeja ini membantu menghemat 7 kg CO2.",
          "createdAt": "2025-07-26T16:00:00.000Z",
          "updatedAt": "2025-07-26T16:00:00.000Z",
          "author": {
            "_id": "66a3d1b9f4b3e4f1a2c3d4e5",
            "avatarUrl": "[https://i.pravatar.cc/150?u=budi_s](https://i.pravatar.cc/150?u=budi_s)",
            "username": "budi_s",
            "fullName": "Budi Santoso",
            "email": "budi.santoso@example.com",
            "address": "Jalan Sudirman Kav. 52-53, Senayan, Jakarta Selatan"
          }
        }
      ],
      "total": 13,
      "page": 1,
      "totalPages": 2
    }
  }
  ```

---

## `POST /api/posts`

Membuat postingan donasi baru.

- **Method**: `POST`
- **URL**: `/api/posts`
- **Autentikasi**: **Wajib**
- **Request Body** (`application/json`):
  ```json
  {
    "title": "Meja Belajar Kayu Jati Kokoh",
    "thumbnailUrl": "https://.../desk_thumb.jpg",
    "imageUrls": ["https://.../desk_1.jpg"],
    "description": "Meja belajar dari kayu jati asli. Kondisi masih sangat kokoh.",
    "category": "Perabotan",
    "carbonKg": 40,
    "aiAnalysis": "Donating this wooden table helps save approximately 40 kg of CO2."
  }
  ```

### Response Sukses (`201 Created`)

Mengembalikan pesan sukses beserta ID dari dokumen yang baru saja dibuat.

- **Contoh Response Body**:
  ```json
  {
    "statusCode": 201,
    "message": "Add post success",
    "data": {
      "insertedId": "66a3d1f8f4b3e4f1a2c3d4f9"
    }
  }
  ```

### Response Error

- **`400 Bad Request`**: Jika _request body_ tidak sesuai dengan skema validasi `postSchema`.
- **`401 Unauthorized`**: Jika pengguna belum login atau token sesi tidak valid.

# API Documentation: Specific Post Management (`/api/posts/[slug]`)

**Last Updated:** 2025-07-27

Endpoint ini menangani operasi pada satu postingan spesifik yang diidentifikasi melalui `slug`-nya.

---

## `GET /api/posts/[slug]`

Mengambil detail lengkap dari satu postingan donasi.

- **Method**: `GET`
- **URL**: `/api/posts/contoh-slug-kemeja-flanel`
- **Autentikasi**: Tidak Wajib

### Response Sukses (`200 OK`)

Mengembalikan objek postingan tunggal yang digabungkan dengan data publik penulisnya.

- **Contoh Response Body**:
  ```json
  {
    "statusCode": 200,
    "data": {
      "_id": "66a3d1f8f4b3e4f1a2c3d4fa",
      "title": "Kemeja Flanel Bekas Layak Pakai",
      "slug": "kemeja-flanel-bekas-layak-pakai",
      "thumbnailUrl": "[https://images.unsplash.com/](https://images.unsplash.com/)...",
      "imageUrls": [
        "[https://images.unsplash.com/](https://images.unsplash.com/)..."
      ],
      "description": "Kemeja flanel ukuran L, kondisi 8/10. Jarang dipakai.",
      "category": "Pakaian",
      "isAvailable": true,
      "userId": "66a3d1b9f4b3e4f1a2c3d4e5",
      "createdAt": "2025-07-26T16:00:00.000Z",
      "updatedAt": "2025-07-26T16:00:00.000Z",
      "author": {
        "_id": "66a3d1b9f4b3e4f1a2c3d4e5",
        "username": "budi_s",
        "fullName": "Budi Santoso",
        "avatarUrl": "[https://i.pravatar.cc/150?u=budi_s](https://i.pravatar.cc/150?u=budi_s)",
        "address": "Jalan Sudirman Kav. 52-53, Senayan, Jakarta Selatan"
      }
    }
  }
  ```

### Response Error

- **`404 Not Found`**: Jika postingan dengan `slug` tersebut tidak ditemukan.

---

## `PUT /api/posts/[slug]`

Memperbarui detail dari satu postingan. Hanya bisa dilakukan oleh pengguna yang membuat postingan tersebut.

- **Method**: `PUT`
- **URL**: `/api/posts/contoh-slug-kemeja-flanel`
- **Autentikasi**: **Wajib**
- **Request Body** (`application/json`): Objek berisi field-field yang ingin diubah.
  ```json
  {
    "title": "Kemeja Flanel Biru (Direvisi)",
    "description": "Kondisi terbaru: 9/10, sudah dicuci bersih.",
    "isAvailable": false
  }
  ```

### Response Sukses (`200 OK`)

- **Contoh Response Body**:
  ```json
  {
    "statusCode": 200,
    "message": "Post updated successfully"
  }
  ```

### Response Error

- **`400 Bad Request`**: Jika _body_ tidak sesuai skema validasi.
- **`401 Unauthorized`**: Jika pengguna belum login.
- **`403 Forbidden`**: Jika pengguna mencoba mengubah postingan milik orang lain.
- **`404 Not Found`**: Jika postingan tidak ditemukan.

---

## `DELETE /api/posts/[slug]`

Menghapus satu postingan. Hanya bisa dilakukan oleh pengguna yang membuat postingan tersebut.

- **Method**: `DELETE`
- **URL**: `/api/posts/contoh-slug-kemeja-flanel`
- **Autentikasi**: **Wajib**

### Response Sukses (`200 OK`)

- **Contoh Response Body**:
  ```json
  {
    "statusCode": 200,
    "message": "Post deleted successfully"
  }
  ```

### Response Error

- **`401 Unauthorized`**: Jika pengguna belum login.
- **`403 Forbidden`**: Jika pengguna mencoba menghapus postingan milik orang lain.
- **`404 Not Found`**: Jika postingan tidak ditemukan.

# API Documentation: Request Creation (`/api/requests`)

**Last Updated:** 2025-07-27

Endpoint ini digunakan oleh pengguna untuk membuat permintaan baru terhadap sebuah postingan donasi.

---

## `POST /api/requests`

Membuat sebuah entri permintaan baru yang menghubungkan pengguna yang login dengan postingan yang mereka inginkan.

- **Method**: `POST`
- **URL**: `/api/requests`
- **Autentikasi**: **Wajib**

### Request Body

- **Content-Type**: `application/json`
- **Deskripsi**: Body harus berisi ID dari postingan (`postId`) yang ingin diminta.
- **Contoh Request Body**:
  ```json
  {
    "postId": "66a3d1f8f4b3e4f1a2c3d4fa"
  }
  ```

---

### Response Sukses (`201 Created`)

Mengembalikan pesan sukses beserta ID dari dokumen permintaan yang baru saja dibuat.

- **Contoh Response Body**:
  ```json
  {
    "message": "Request created successfully",
    "data": {
      "acknowledged": true,
      "insertedId": "66a4cc3b9f4b3e4f1a2c3d51c"
    }
  }
  ```

### Response Error

- **`400 Bad Request`**:
  - Jika _request body_ tidak valid (misalnya `postId` tidak ada atau formatnya salah).
  - Jika pengguna mencoba meminta barang miliknya sendiri (`You cannot request your own item`).
- **`401 Unauthorized`**: Jika pengguna belum login atau token sesi tidak valid.
- **`404 Not Found`**: Jika `postId` yang diberikan tidak ada di database atau jika postingan tersebut sudah tidak tersedia (`isAvailable: false`).

# API Documentation: Request Status Management (`/api/requests/[id]`)

**Last Updated:** 2025-07-27

Endpoint ini digunakan untuk memperbarui status sebuah permintaan. Aksi yang diizinkan tergantung pada peran pengguna (Donatur atau Penerima).

---

## `PATCH /api/requests/[id]`

Memperbarui status sebuah permintaan yang diidentifikasi melalui ID-nya.

- **Method**: `PATCH`
- **URL**: `/api/requests/66a3d22cf4b3e4f1a2c3d50f`
- **Autentikasi**: **Wajib**
- **URL Parameter**:
  - `id` (wajib, `string`): ID dari dokumen permintaan yang akan diperbarui.

---

### Skenario & Request Body

#### 1. Aksi oleh Donatur

Donatur dapat mengubah status permintaan menjadi `ACCEPTED`, `REJECTED`, atau `SHIPPED`.

- **Contoh Request Body** (`application/json`):
  ```json
  {
    "status": "SHIPPED",
    "trackingCode": "JP1234567890"
  }
  ```
  _Catatan: `trackingCode` bersifat opsional._

#### 2. Aksi oleh Penerima (Requester)

Penerima dapat mengubah status permintaan menjadi `COMPLETED` hanya jika status sebelumnya adalah `SHIPPED`.

- **Contoh Request Body** (`application/json`):
  ```json
  {
    "status": "COMPLETED"
  }
  ```

---

### Response Sukses (`200 OK`)

Mengembalikan pesan konfirmasi status yang baru.

- **Contoh Response Body**:
  ```json
  {
    "message": "Request status updated to SHIPPED"
  }
  ```
  _Atau jika penerima yang mengonfirmasi:_
  ```json
  {
    "message": "Request completed successfully"
  }
  ```

### Response Error

- **`400 Bad Request`**: Jika _request body_ tidak valid atau tidak berisi status yang diizinkan.
- **`401 Unauthorized`**: Jika pengguna belum login.
- **`403 Forbidden`**: Jika pengguna mencoba melakukan aksi yang tidak diizinkan (misalnya, penerima mencoba me-reject, atau aksi tidak sesuai dengan status saat ini).
- **`404 Not Found`**: Jika `id` permintaan atau postingan terkait tidak ditemukan di database.

# API Documentation: User History

**Last Updated:** 2025-07-27

Endpoint ini menyediakan data spesifik untuk halaman riwayat aktivitas pengguna.

---

## 1. Histori Donatur (`GET /api/users/me/posts`)

Mengambil semua postingan yang dibuat oleh pengguna yang sedang login, lengkap dengan daftar siapa saja yang meminta setiap barang.

- **Method**: `GET`
- **URL**: `/api/users/me/posts`
- **Autentikasi**: **Wajib**

### Response Sukses (`200 OK`)

Mengembalikan sebuah array berisi postingan milik pengguna. Setiap postingan memiliki properti `requests` yang berisi array para peminta barang tersebut.

- **Contoh Response Body**:
  ```json
  {
    "data": [
      {
        "_id": "66a3d1f8f4b3e4f1a2c3d4fa",
        "title": "Kemeja Flanel Bekas Layak Pakai",
        "thumbnailUrl": "https://.../image.jpg",
        "isAvailable": true,
        "requests": [
          {
            "_id": "66a3d22cf4b3e4f1a2c3d50f",
            "status": "PENDING",
            "requester": {
              "_id": "66a3d1b9f4b3e4f1a2c3d4ef",
              "username": "lia_n",
              "fullName": "Lia Novita",
              "avatarUrl": "[https://i.pravatar.cc/150?u=lia_n](https://i.pravatar.cc/150?u=lia_n)"
            }
          }
        ]
      }
    ]
  }
  ```

---

## 2. Histori Peminta (`GET /api/users/me/requests`)

Mengambil semua permintaan yang pernah dibuat oleh pengguna yang sedang login, lengkap dengan detail barang yang diminta.

- **Method**: `GET`
- **URL**: `/api/users/me/requests`
- **Autentikasi**: **Wajib**

### Response Sukses (`200 OK`)

Mengembalikan sebuah array berisi permintaan milik pengguna. Setiap permintaan memiliki properti `postDetails` yang berisi detail dari barang yang diminta.

- **Contoh Response Body**:
  ```json
  {
    "data": [
      {
        "_id": "66a3d22cf4b3e4f1a2c3d50f",
        "userId": "66a3d1b9f4b3e4f1a2c3d4ef",
        "postId": "66a3d1f8f4b3e4f1a2c3d4fa",
        "status": "PENDING",
        "createdAt": "2025-07-26T17:00:00.000Z",
        "postDetails": {
          "_id": "66a3d1f8f4b3e4f1a2c3d4fa",
          "title": "Kemeja Flanel Bekas Layak Pakai",
          "slug": "kemeja-flanel-bekas-layak-pakai",
          "thumbnailUrl": "https://.../image.jpg"
        }
      }
    ]
  }
  ```

# API Documentation: Utilities & AI

**Last Updated:** 2025-07-27

Endpoint ini menyediakan fungsionalitas khusus seperti analisis gambar dengan AI dan upload file.

---

## `POST /api/analyze-item`

Menganalisis **satu gambar barang** untuk mengidentifikasi item, menghitung jumlahnya, dan mengestimasi jejak karbon yang dihemat.

- **Method**: `POST`
- **URL**: `/api/analyze-item`
- **Autentikasi**: Wajib
- **Request Body**: `multipart/form-data`
  - **Key**: `itemImage`
  - **Type**: `File`
  - **Value**: (Pilih satu file gambar barang)

### Response Sukses (`200 OK`)

Mengembalikan hasil analisis lengkap.

- **Contoh Response Body**:
  ```json
  {
    "statusCode": 200,
    "message": "Analysis complete",
    "data": {
      "itemName": "running shoes",
      "quantity": 2,
      "carbonKg": 28.0,
      "aiAnalysis": "Donating 2 running shoes(s) helps save approximately 28.0 kg of CO2.",
      "imageUrl": "[https://res.cloudinary.com/demo/image/upload/v1689888998/shoes.jpg](https://res.cloudinary.com/demo/image/upload/v1689888998/shoes.jpg)"
    }
  }
  ```

### Response Error

- **`400 Bad Request`**: Jika tidak ada file `itemImage` yang dikirim atau jika AI tidak dapat mengidentifikasi barang di dalam gambar.

---

## `POST /api/ocr-ai`

Menerima **URL gambar resi** dan mengekstrak nomor resi darinya menggunakan AI.

- **Method**: `POST`
- **URL**: `/api/ocr-ai`
- **Autentikasi**: Wajib
- **Request Body** (`application/json`):
  ```json
  {
    "imageUrl": "[https://res.cloudinary.com/demo/image/upload/v1689888998/receipt.jpg](https://res.cloudinary.com/demo/image/upload/v1689888998/receipt.jpg)"
  }
  ```

### Response Sukses (`200 OK`)

Mengembalikan nomor resi yang berhasil diekstrak.

- **Contoh Response Body**:
  ```json
  {
    "trackingNumber": "JP1234567890"
  }
  ```

### Response Error

- **`400 Bad Request`**: Jika `imageUrl` tidak ada di dalam body.
- **`404 Not Found`**: Jika tidak ada nomor resi yang ditemukan di dalam gambar.
- **`500 Internal Server Error`**: Jika terjadi kegagalan pada proses OCR.

---

## `POST /api/upload`

Endpoint serbaguna untuk mengunggah **gambar barang tambahan** dan/atau **gambar resi**. Jika gambar resi diunggah, endpoint ini juga akan mencoba melakukan OCR.

- **Method**: `POST`
- **URL**: `/api/upload`
- **Autentikasi**: Wajib
- **Request Body**: `multipart/form-data`
  - **Key**: `itemImages` (opsional) | **Type**: `File` | **Value**: (Pilih satu atau lebih file gambar barang)
  - **Key**: `receiptImage` (opsional) | **Type**: `File` | **Value**: (Pilih satu file gambar resi)

### Response Sukses (`200 OK`)

Mengembalikan URL dari semua file yang berhasil diunggah dan nomor resi jika terdeteksi.

- **Contoh Response Body**:
  ```json
  {
    "statusCode": 200,
    "message": "Uploads processed successfully",
    "data": {
      "itemUrls": [
        "[https://res.cloudinary.com/demo/image/upload/v1689888998/item1.jpg](https://res.cloudinary.com/demo/image/upload/v1689888998/item1.jpg)"
      ],
      "receiptUrl": "[https://res.cloudinary.com/demo/image/upload/v1689888998/receipt.jpg](https://res.cloudinary.com/demo/image/upload/v1689888998/receipt.jpg)",
      "trackingNumber": "073120019471019"
    }
  }
  ```

### Response Error

- **`400 Bad Request`**: Jika tidak ada file `itemImages` maupun `receiptImage` yang dikirim.
