// export async function getSession() {
//   return { user: { id: "66a07e8a3b3e4f1a2c3d4e51" } };
// }


import { auth } from '@/lib/auth';

export async function getSession() {
  return await auth();
}