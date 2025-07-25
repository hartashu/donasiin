export async function getSession() {
  return { user: { id: "66a07e8a3b3e4f1a2c3d4e51" } };
}

// import { auth } from '@/lib/auth';

// export async function getSession() {
//   return await auth();
// }

// import { auth } from '@/lib/auth';
// import { getToken } from 'next-auth/jwt';
// import { NextRequest } from 'next/server';

// // Di Next.js, kita bisa mendapatkan request object dari 'next/headers'
// import { headers } from 'next/headers';

// /**
//  * Mengambil sesi pengguna, baik dari cookie (untuk web)
//  * maupun dari Bearer Token (untuk native/Postman).
//  */
// export async function getSession() {
//     const webSession = await auth();
//     if (webSession?.user) {
//         return webSession;
//     }

//     // Jika tidak ada sesi web, coba cari Bearer Token
//     const authorizationHeader = headers().get('authorization');
//     if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
//         const token = authorizationHeader.split(' ')[1];

//         // Buat objek request palsu untuk getToken
//         const req = new NextRequest('http://localhost', {
//             headers: {
//                 cookie: `authjs.session-token=${token}`
//             }
//         });

//         const decodedToken = await getToken({ req, secret: process.env.AUTH_SECRET });

//         if (decodedToken) {
//             return { user: { id: decodedToken.id, name: decodedToken.name, email: decodedToken.email, username: decodedToken.username } };
//         }
//     }

//     return null;
// }
