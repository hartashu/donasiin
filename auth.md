# Dokumentasi API Donasiin

Dokumentasi ini menjelaskan semua endpoint API yang terkait dengan fitur Otentikasi dan Chat untuk klien Web dan Native.

**Base URL (Development):** `http://<IP_KOMPUTER_ANDA>:3000`

---

## Authentication API

### 1. Registrasi Akun Baru

Membuat akun pengguna baru dan mengirimkan email verifikasi.

- **URL:** `/api/account/register`
- **Method:** `POST`
- **Body Request:**
  ```json
  {
    "fullName": "Nama Lengkap Baru",
    "username": "usernamebaru",
    "email": "userbaru@example.com",
    "password": "passwordminimal8karakter"
  }
  ```
- **Respon Sukses (201):**
  ```json
  {
    "statusCode": 201,
    "message": "User registered. Please check your email to verify.",
    "data": { "userId": "..." }
  }
  ```

### 2. Login (Email & Password)

Endpoint ini digunakan oleh **web dan native** untuk login via email & password dan mendapatkan token sesi.

- **URL:** `/api/account/login`
- **Method:** `POST`
- **Body Request:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Respon Sukses (200):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "...",
      "email": "user@example.com",
      "name": "Nama Lengkap",
      "username": "namapengguna"
    }
  }
  ```
- **Respon Error (401):**
  ```json
  { "error": "Invalid credentials" }
  ```

### 3. Lupa Password

Meminta server mengirimkan email berisi link untuk reset password.

- **URL:** `/api/account/forgot-password`
- **URL (dari Native):** `/api/account/forgot-password?from=native`
- **Method:** `POST`
- **Body Request:**
  ```json
  { "email": "user@example.com" }
  ```
- **Respon Sukses (200):**
  ```json
  {
    "statusCode": 200,
    "message": "If an account with this email exists, a reset link has been sent."
  }
  ```

### 4. Reset Password

Mengatur password baru menggunakan token dari email.

- **URL:** `/api/account/reset-password`
- **Method:** `POST`
- **Body Request:**
  ```json
  {
    "token": "token-unik-dari-link-email",
    "password": "passwordbaruminimal8karakter",
    "confirmPassword": "passwordbaruminimal8karakter"
  }
  ```
- **Respon Sukses (200):**
  ```json
  {
    "statusCode": 200,
    "message": "Password updated successfully!"
  }
  ```

---

## Authenticated Requests (Untuk Native)

Untuk semua _endpoint_ yang membutuhkan login (seperti API Chat), aplikasi native **wajib** menyertakan _header_ `Authorization`.

- **Header:** `Authorization`
- **Value:** `Bearer <TOKEN_YANG_DIDAPAT_SAAT_LOGIN>`
- **Contoh:** `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## Chat API

Semua endpoint di bawah ini membutuhkan _header_ `Authorization` jika diakses dari native.

### 1. Mendapatkan Daftar Percakapan (Inbox)

- **URL:** `/api/chat/conversations`
- **Method:** `GET`
- **Respon Sukses (200):** Array berisi objek percakapan.

### 2. Mengambil Riwayat Pesan

- **URL:** `/api/chat/messages/[conversationId]`
- **Method:** `GET`
- **Respon Sukses (200):** Array berisi objek pesan.

### 3. Mengirim Pesan Baru

- **URL:** `/api/chat/messages`
- **Method:** `POST`
- **Body Request:**
  ```json
  {
    "receiverId": "idUserPenerima",
    "text": "Pesan baru di sini."
  }
  ```
- **Respon Sukses (201):** Objek pesan yang baru saja dibuat.
