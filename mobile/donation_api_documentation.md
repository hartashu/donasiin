# Donation API Documentation

Panduan lengkap endpoint API untuk aplikasi donasi, dikelompokkan berdasarkan fungsinya.

---

## 📑 Daftar Isi

1. [Post Management](#post-management)
2. [Specific Post Management](#specific-post-management)
3. [Request Management](#request-management)
4. [Utilities & AI](#utilities--ai)

---

## 📁 Post Management (`/api/posts`)

Endpoint untuk membuat, mengambil, dan mengelola donation post.

### `GET /api/posts`

- **Authentication**: Tidak diperlukan
- **Query Parameters**:
  - `page` (optional, number, default: 1)
  - `limit` (optional, number, default: 10)
  - `category` (optional, string) — filter berdasarkan kategori
  - `search` (optional, string) — cari berdasarkan judul

**Response 200 OK**:

```json
{
  "statusCode": 200,
  "data": {
    "posts": [ /* array of IPost */ ],
    "total": 25,
    "page": 1,
    "totalPages": 3
  }
}
```

### `POST /api/posts`

- **Authentication**: **Diperlukan**
- **Request Body** (`application/json`):

```json
{
  "title": "Wooden Study Desk",
  "thumbnailUrl": "https://.../desk.jpg",
  "description": "A sturdy wooden study desk.",
  "category": "Furniture"
}
```

- **Response 201 Created**:

```json
{
  "statusCode": 201,
  "message": "Add post success",
  "data": { "insertedId": "66a200f4a275e3c1b4b5e6f8" }
}
```

---

## 📄 Specific Post Management (`/api/posts/[slug]`)

### `GET /api/posts/[slug]`

- **Authentication**: Tidak diperlukan
- **Response 200 OK**: objek lengkap `IPost`
- **Error 404 Not Found** jika slug tidak ada

### `PUT /api/posts/[slug]`

- **Authentication**: **Diperlukan**
- **Request Body**: partial object dengan field yang diubah
- **Response 200 OK**:

```json
{ "statusCode": 200, "message": "Post updated successfully" }
```

- **Errors**: 401, 403, 404

### `DELETE /api/posts/[slug]`

- **Authentication**: **Diperlukan**
- **Response 200 OK**:

```json
{ "statusCode": 200, "message": "Post deleted successfully" }
```

- **Errors**: 401, 403, 404

---

## 📥 Request Management (`/api/requests`)

Endpoint untuk alur request antara penerima dan donatur.

### `POST /api/requests`

- **Authentication**: **Diperlukan**
- **Request Body**:

```json
{ "postId": "66a200f4a275e3c1b4b5e6f7" }
```

- **Response 201 Created**: objek `IRequest` baru
- **Errors**: 400, 401, 404

### `GET /api/requests/me`

- **Authentication**: **Diperlukan**
- **Response 200 OK**: array `IRequest` yang dibuat user

### `GET /api/requests/incoming`

- **Authentication**: **Diperlukan**
- **Response 200 OK**: array `IRequest` masuk (terpopulasi dengan data post)

### `PATCH /api/requests/[id]`

- **Authentication**: **Diperlukan**
- **Logic**:
  - Donor: ubah status ke `ACCEPTED`, `REJECTED`, atau `SHIPPED`
  - Recipient: ubah status ke `COMPLETED` (jika sebelumnya `SHIPPED`)
- **Request Body**:

```json
{ "status": "SHIPPED", "trackingCode": "JP1234567890" }
```

- **Response 200 OK**: konfirmasi perubahan

---

## ⚙️ Utilities & AI

### `POST /api/upload`

Upload gambar item/receipt + OCR.

- **Authentication**: **Diperlukan**
- **Content-Type**: `multipart/form-data`
- **Form Data**:
  - `itemImages`: file gambar item
  - `receiptImage`: file gambar receipt
- **Response 200 OK**:

```json
{
  "statusCode": 200,
  "message": "Uploads processed successfully",
  "data": {
    "itemUrls": ["https://.../item1.jpg"],
    "receiptUrl": "https://.../receipt.jpg",
    "trackingNumber": "JP1234567890"
  }
}
```

### `POST /api/ocr-ai`

OCR standalone via URL.

- **Authentication**: **Diperlukan**
- **Request Body**:

```json
{ "imageUrl": "https://.../receipt.jpg" }
```

- **Response 200 OK**:

```json
{ "trackingNumber": "JP1234567890" }
```

