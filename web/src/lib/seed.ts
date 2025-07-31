// seed.ts
import { ObjectId } from 'mongodb';
import { faker } from '@faker-js/faker/locale/id_ID';
import bcrypt from 'bcrypt';
import fs from 'fs/promises';

// =================================================================
// --- INTERFACES & ENUMS (Tipe Data) ---
// =================================================================

// Enum dari prompt Anda
export enum RequestStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  SHIPPED = "SHIPPED",
  COMPLETED = "COMPLETED",
}

// Interface berdasarkan struktur data Anda
interface IUser {
  _id: ObjectId;
  fullName: string;
  username: string;
  email: string;
  password?: string;
  avatarUrl: string;
  address: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  dailyLimit: number;
  createdAt: Date;
  updatedAt: Date;
}

interface IPost {
  _id: ObjectId;
  title: string;
  slug: string;
  description: string;
  category: string;
  thumbnailUrl: string;
  imageUrls: string[];
  isAvailable: boolean;
  userId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

interface IRequest {
  _id: ObjectId;
  userId: ObjectId;
  postId: ObjectId;
  status: RequestStatus;
  trackingCode: string | null;
  trackingCodeUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface IItemTemplate {
  title: string;
  description: string;
  category: string;
  images: {
    thumbnail: string;
    imageUrls: string[];
  };
}

// --- KONFIGURASI ---
const NUM_USERS = 20;
const MIN_POSTS_PER_USER = 3;
const MAX_POSTS_PER_USER = 5;
const MIN_REQUESTS_PER_POST = 3;
const MAX_REQUESTS_PER_POST = 5;
const PASSWORD_SALT_ROUNDS = 10;
const DEFAULT_PASSWORD = "password123";

// =================================================================
// --- TEMPLATE BARANG DONASI (DATA KONSISTEN) ---
// =================================================================
const ITEM_TEMPLATES: IItemTemplate[] = [
  // Fashion & Apparel
  {
    title: "Shawl Hangat Warna-warni",
    description: "Shawl atau selendang bahan tebal, kondisi 95% seperti baru. Cocok untuk cuaca dingin atau sebagai aksesoris fashion. Jarang dipakai.",
    category: "fashion-apparel",
    images: { thumbnail: "https://res.cloudinary.com/dffbvex6y/image/upload/v1752824133/shawl_diff_6_1_jswidn.png", imageUrls: ["https://res.cloudinary.com/dffbvex6y/image/upload/v1752824134/shawl_diff_6_3_vksz8k.png"] }
  },
  {
    title: "Coat Musim Dingin Elegan",
    description: "Coat tebal warna cokelat, ukuran M. Kondisi sangat baik, tidak ada sobek. Cocok untuk yang mau traveling ke tempat dingin.",
    category: "fashion-apparel",
    images: { thumbnail: "https://res.cloudinary.com/dffbvex6y/image/upload/v1752824112/coat_diff_7_3_ixovl0.png", imageUrls: ["https://res.cloudinary.com/dffbvex6y/image/upload/v1752824111/coat_diff_7_2_qnooge.png"] }
  },
  {
    title: "Kemeja Kantor Formal",
    description: "Kemeja formal lengan panjang warna putih. Ukuran L, bahan katun adem. Ada sedikit noda di kerah tapi bisa hilang dicuci.",
    category: "fashion-apparel",
    images: { thumbnail: "https://res.cloudinary.com/dffbvex6y/image/upload/v1752824135/shirt_diff_3_3_uuocbb.jpg", imageUrls: ["https://res.cloudinary.com/dffbvex6y/image/upload/v1752824135/shirt_diff_3_1_ursq74.jpg"] }
  },
  {
    title: "Trench Coat Klasik",
    description: "Trench coat abu-abu model klasik, unisex. Ukuran All Size fit to L. Bahan bagus dan tebal, ada beberapa kancing yang perlu dikencangkan.",
    category: "fashion-apparel",
    images: { thumbnail: "https://res.cloudinary.com/dffbvex6y/image/upload/v1752824130/grey_short_trenchcoat_suit_jaiyeh.png", imageUrls: [] }
  },
  // Electronics
  {
    title: "Monitor Komputer LG 24 inch",
    description: "Monitor bekas LG ukuran 24 inch, resolusi Full HD. Kondisi normal, tidak ada dead pixel. Hanya ada sedikit goresan di bodi. Kabel power & HDMI disertakan.",
    category: "electronics",
    images: { thumbnail: "https://source.unsplash.com/400x400/?computer-monitor", imageUrls: ["https://source.unsplash.com/800x600/?monitor,desk"] }
  },
  {
    title: "Keyboard Mechanical Gaming",
    description: "Keyboard mechanical bekas, switch biru (clicky). Semua tombol berfungsi normal, lampu RGB masih menyala terang. Cocok untuk main game atau ngetik.",
    category: "electronics",
    images: { thumbnail: "https://source.unsplash.com/400x400/?mechanical-keyboard", imageUrls: ["https://source.unsplash.com/800x600/?keyboard,rgb"] }
  },
  // Home & Kitchen
  {
    title: "Set Panci Anti Lengket",
    description: "Satu set panci anti lengket isi 3. Ukuran kecil, sedang, besar. Lapisan anti lengket sedikit tergores di panci besar, tapi masih sangat layak pakai.",
    category: "home-kitchen",
    images: { thumbnail: "https://source.unsplash.com/400x400/?cooking-pan", imageUrls: ["https://source.unsplash.com/800x600/?kitchenware"] }
  },
  // Books, Music & Media
  {
    title: "Koleksi Novel Fiksi (5 Buku)",
    description: "Paket 5 novel fiksi terjemahan. Judul-judul populer, kondisi masih bagus, hanya sedikit menguning di pinggir kertas karena disimpan lama.",
    category: "books-music-media",
    images: { thumbnail: "https://source.unsplash.com/400x400/?books-collection", imageUrls: ["https://source.unsplash.com/800x600/?bookshelf"] }
  },
];

// --- FUNGSI BANTU ---

const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
const createSlug = (title: string): string => title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

// --- FUNGSI GENERATOR DATA ---

async function generateUsers(): Promise<IUser[]> {
  console.log('🌱 Generating users...');
  const users: IUser[] = [];
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, PASSWORD_SALT_ROUNDS);

  for (let i = 0; i < NUM_USERS; i++) {
    const fullName = faker.person.fullName();
    const user: IUser = {
      _id: new ObjectId(),
      fullName: fullName,
      username: faker.internet.userName({ firstName: fullName.split(' ')[0] }).toLowerCase(),
      email: faker.internet.email({ firstName: fullName.split(' ')[0] }).toLowerCase(),
      password: hashedPassword,
      avatarUrl: faker.image.avatar(),
      address: faker.location.streetAddress(true),
      location: {
        type: "Point",
        coordinates: [faker.location.longitude({ min: 106.60, max: 106.75 }), faker.location.latitude({ min: -6.40, max: -6.20 })]
      },
      dailyLimit: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    users.push(user);
  }
  return users;
}

function generatePosts(users: IUser[]): IPost[] {
  console.log('📝 Generating posts with consistent & logical data...');
  const posts: IPost[] = [];
  let postDataIndex = 0;

  for (const user of users) {
    const numPosts = randomInt(MIN_POSTS_PER_USER, MAX_POSTS_PER_USER);
    for (let i = 0; i < numPosts; i++) {
      const template = ITEM_TEMPLATES[postDataIndex % ITEM_TEMPLATES.length];

      const post: IPost = {
        _id: new ObjectId(),
        title: template.title,
        slug: createSlug(template.title),
        description: template.description,
        category: template.category,
        thumbnailUrl: template.images.thumbnail,
        imageUrls: template.images.imageUrls,
        isAvailable: true,
        userId: user._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      posts.push(post);
      postDataIndex++;
    }
  }
  return posts;
}

function generateRequests(users: IUser[], posts: IPost[]): IRequest[] {
  console.log('📤 Generating requests...');
  const requests: IRequest[] = [];
  const allUserIds = users.map(u => u._id);
  const usersWhoHaventRequested = new Set(allUserIds.map(id => id.toString()));

  for (const post of posts) {
    const authorId = post.userId;
    const potentialRequesters = allUserIds.filter(id => !id.equals(authorId));
    const numRequests = randomInt(MIN_REQUESTS_PER_POST, MAX_REQUESTS_PER_POST);

    for (let i = 0; i < numRequests; i++) {
      if (potentialRequesters.length === 0) continue;

      let requesterId: ObjectId;
      const nonRequestingUsers = potentialRequesters.filter(id => usersWhoHaventRequested.has(id.toString()));

      if (nonRequestingUsers.length > 0) {
        requesterId = nonRequestingUsers[randomInt(0, nonRequestingUsers.length - 1)];
      } else {
        requesterId = potentialRequesters[randomInt(0, potentialRequesters.length - 1)];
      }

      usersWhoHaventRequested.delete(requesterId.toString());

      const statusValues = Object.values(RequestStatus);
      const status = statusValues[randomInt(0, statusValues.length - 1)];

      const request: IRequest = {
        _id: new ObjectId(),
        userId: requesterId,
        postId: post._id,
        status: status,
        trackingCode: status === 'SHIPPED' ? faker.string.alphanumeric(12).toUpperCase() : null,
        trackingCodeUrl: status === 'SHIPPED' ? 'https://cekresi.com/' : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      requests.push(request);

      if (status === RequestStatus.COMPLETED) {
        post.isAvailable = false;
      }
    }
  }
  return requests;
}

// --- LOGIKA UTAMA ---
async function generateSeedData(): Promise<void> {
  try {
    const users = await generateUsers();
    const posts = generatePosts(users);
    const requests = generateRequests(users, posts);

    console.log('\n✅ Seeding complete!');
    console.log(`   - ${users.length} users created.`);
    console.log(`   - ${posts.length} posts created.`);
    console.log(`   - ${requests.length} requests created.`);

    const seedData = { users, posts, requests };

    await fs.writeFile('seed-data.json', JSON.stringify(seedData, null, 2));
    console.log('\n💾 Data saved to seed-data.json');

  } catch (error) {
    console.error('Error generating seed data:', error);
  }
}

generateSeedData();