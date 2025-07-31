import { MongoClient, ObjectId } from 'mongodb';
import * as bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';
import 'dotenv/config';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    throw new Error('Harap definisikan variabel environment MONGODB_URI di file .env');
}
const MONGODB_DB = process.env.MONGODB_DB;
if (!MONGODB_DB) {
    throw new Error('Harap definisikan variabel environment MONGODB_DB di file .env');
}

const client = new MongoClient(MONGODB_URI);
const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const shuffleArray = <T>(arr: T[]): T[] => [...arr].sort(() => 0.5 - Math.random());

const allDonationItems = [
    { title: "Cozy Knit Shawl", description: "Looking to donate this beautiful knit shawl. It's in excellent condition, very soft and warm. Perfect for someone who wants an elegant accessory for chilly evenings. Clean and ready to be worn.", category: "fashion-apparel", images: { thumbnail: "https://res.cloudinary.com/dffbvex6y/image/upload/v1752824133/shawl_diff_6_1_jswidn.png", imageUrls: ["https://res.cloudinary.com/dffbvex6y/image/upload/v1752824134/shawl_diff_6_3_vksz8k.png", "https://res.cloudinary.com/dffbvex6y/image/upload/v1752824133/shawl_diff_6_2_bu5dwi.png"] } },
    { title: "Stylish Women's Overcoat", description: "Donating this stylish overcoat. It's in great condition and provides good warmth. Ideal for someone looking for a fashionable coat for work or daily wear. Size M.", category: "fashion-apparel", images: { thumbnail: "https://res.cloudinary.com/dffbvex6y/image/upload/v1752824112/coat_diff_7_3_ixovl0.png", imageUrls: ["https://res.cloudinary.com/dffbvex6y/image/upload/v1752824111/coat_diff_7_2_qnooge.png", "https://res.cloudinary.com/dffbvex6y/image/upload/v1752824110/coat_diff_7_1_wgbxvs.png"] } },
    { title: "Men's Formal Trench Coat", description: "Giving away this formal trench coat. Condition is like new, only worn a couple of times. A great fit for a professional who needs a smart outerwear piece. Size L.", category: "fashion-apparel", images: { thumbnail: "https://res.cloudinary.com/dffbvex6y/image/upload/v1752824108/coat_diff_5_3_ypryjr.png", imageUrls: ["https://res.cloudinary.com/dffbvex6y/image/upload/v1752824106/coat_diff_5_2_qolbr1.png", "https://res.cloudinary.com/dffbvex6y/image/upload/v1752824105/coat_diff_5_1_lq4fjh.png"] } },
    { title: "Pre-loved Casual Shirt", description: "Donating this casual men's shirt. It's in good condition, with a comfortable fit. Perfect for anyone needing a simple and stylish shirt for daily activities. Size M.", category: "fashion-apparel", images: { thumbnail: "https://res.cloudinary.com/dffbvex6y/image/upload/v1752824135/shirt_diff_3_3_uuocbb.jpg", imageUrls: ["https://res.cloudinary.com/dffbvex6y/image/upload/v1752824135/shirt_diff_3_1_ursq74.jpg", "https://res.cloudinary.com/dffbvex6y/image/upload/v1752824135/shirt_diff_3_2_bjdlvc.jpg"] } },
    { title: "Modern Black Suit", description: "This modern black suit needs a new owner. It's in excellent condition, suitable for interviews or formal events. Who wants a sharp suit to boost their confidence?", category: "fashion-apparel", images: { thumbnail: "https://res.cloudinary.com/dffbvex6y/image/upload/v1752824099/Black_suit_1_fdy1st.png", imageUrls: ["https://res.cloudinary.com/dffbvex6y/image/upload/v1752824099/Black_suit_2_ypcfta.png"] } },
    { title: "The Dark Knight Blu-ray Disc", description: "Hoping this iconic movie finds a new home. The disc is in great condition, with no scratches. A must-watch for any movie buff who loves a great story.", category: "books-music-media", images: { thumbnail: "https://th.bing.com/th/id/OIP.NN9rKH-vZbFgtH4FuoW7OwHaLH?r=0&o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3", imageUrls: [] } },
    { title: "Pre-owned Elden Ring Game (PS5)", description: "Donating my copy of this fantastic game. The disc is in perfect working order. Perfect for a gamer who's ready for a beautiful and challenging adventure.", category: "electronics", images: { thumbnail: "https://preview.redd.it/elden-ring-is-the-2022-game-of-the-year-winner-v0-mrqax2gb7u4a1.jpg?auto=webp&s=85d27be4199d332dfadb83aa350888499ddd248f", imageUrls: [] } },
    { title: "University Physics Textbooks", description: "This set of physics textbooks is looking for a new student. In good condition, with some helpful notes in the margins. Perfect for someone studying science or engineering.", category: "books-music-media", images: { thumbnail: "https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg", imageUrls: [] } },
    { title: "Beginner's Digital Piano Keyboard", description: "Donating this digital piano. All keys and functions work perfectly. Great for a child or adult who wants to start learning music. Comes with a stand.", category: "electronics", images: { thumbnail: "https://images.pexels.com/photos/1763067/pexels-photo-1763067.jpeg", imageUrls: [] } },
    { title: "Collection of Classic Novels", description: "Giving away a box of 10 classic literature novels. All books are in good, readable condition. Ideal for a book lover who wants to build their library.", category: "books-music-media", images: { thumbnail: "https://images.pexels.com/photos/159751/book-address-book-learning-learn-159751.jpeg", imageUrls: [] } },
    { title: "Durable Yoga Mat", description: "This yoga mat is in great condition, cleaned and sanitized. I'm hoping someone who wants to get started with a healthy lifestyle can use it.", category: "health-beauty", images: { thumbnail: "https://images.pexels.com/photos/3992933/pexels-photo-3992933.jpeg", imageUrls: [] } },
    { title: "Hunter x Hunter Manga Set (Vol. 1-5)", description: "Donating the first five volumes of Hunter x Hunter. The books are in very good condition. Perfect for an anime fan who wants to start the manga series.", category: "books-music-media", images: { thumbnail: "https://tse1.mm.bing.net/th/id/OIP.kvcywi8r_LrRZezlMf4AygHaFj?r=0&rs=1&pid=ImgDetMain&o=7&rm=3", imageUrls: [] } },
    { title: "Professional Chef's Knife", description: "A high-quality chef's knife, still very sharp. In excellent condition, always hand-washed. I'd like this to go to a culinary student or someone passionate about cooking.", category: "home-kitchen", images: { thumbnail: "https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg", imageUrls: [] } },
    { title: "Wooden Chess Set with Board", description: "A complete wooden chess set. The pieces and board are in great condition. Perfect for a family or anyone who enjoys a strategic board game.", category: "sports-outdoors", images: { thumbnail: "https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg", imageUrls: [] } },
    { title: "Pre-owned The Witcher 3 Game (PS4)", description: "Donating my copy of The Witcher 3. The disc is in perfect condition. A must-play for anyone who loves deep storytelling and open-world RPGs.", category: "electronics", images: { thumbnail: "https://image.api.playstation.com/vulcan/ap/rnd/202211/0914/TvcIHkYqqln1RGbaFqBeuFp6.jpg", imageUrls: [] } },
    { title: "Baby Stroller and Carrier", description: "This baby stroller is clean and in good working condition. All safety straps are intact. Hoping this can help a new family that needs one.", category: "baby-kids", images: { thumbnail: "https://images.pexels.com/photos/3756766/pexels-photo-3756766.jpeg", imageUrls: [] } },
    { title: "Set of Dumbbells (5kg Pair)", description: "A pair of 5kg dumbbells. In good condition, with some minor scuffs from use. Perfect for someone who wants to start a home workout routine.", category: "sports-outdoors", images: { thumbnail: "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg", imageUrls: [] } },
    { title: "Portable Bluetooth Speaker", description: "Donating this portable speaker. It has good sound quality and the battery life is still decent. Perfect for someone who loves listening to music on the go.", category: "electronics", images: { thumbnail: "https://images.pexels.com/photos/1493226/pexels-photo-1493226.jpeg", imageUrls: [] } },
    { title: "Complete Naruto Manga Box Set 1", description: "This is the first box set of the Naruto manga. All volumes are in excellent condition. Looking for a new reader to enjoy this epic ninja story.", category: "books-music-media", images: { thumbnail: "https://th.bing.com/th/id/OIP.8vSeO4dRLy_XttUqprw5BwHaD4?r=0&o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3", imageUrls: [] } },
    { title: "Spider-Man: Spider-Verse Art Book", description: "The official art book for the 'Into the Spider-Verse' movie. In like-new condition. A must-have for any animation student or Spider-Man fan.", category: "books-music-media", images: { thumbnail: "https://www.themoviedb.org/t/p/original/vOpV6HrtAkNQxCWAgtU4NmQ1KPe.jpg", imageUrls: [] } },
    { title: "Basic Automotive Tool Kit", description: "A simple car tool kit for basic maintenance. Contains wrenches and screwdrivers. In good condition. Perfect for a new driver to keep in their car for emergencies.", category: "automotive-tools", images: { thumbnail: "https://images.pexels.com/photos/337909/pexels-photo-337909.jpeg", imageUrls: [] } },
    { title: "Desk Lamp with USB Charging", description: "A modern desk lamp with adjustable brightness and a USB port. In perfect working condition. I hope this can be useful for a student's study area.", category: "electronics", images: { thumbnail: "https://ptanime.com/wp-content/uploads/2015/05/analise-steins-gate-cover-1.jpg", imageUrls: [] } },
    { title: "Camping Tent (2-Person)", description: "Donating this 2-person camping tent. Used only twice, in great condition with all parts included. Perfect for someone who loves the outdoors and adventure.", category: "sports-outdoors", images: { thumbnail: "https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg", imageUrls: [] } },
    { title: "Pet Carrier for a Small Cat or Dog", description: "A sturdy and clean pet carrier. Suitable for a small cat or dog. In good condition, all zippers work. Looking for a pet owner who needs it.", category: "pet-supplies", images: { thumbnail: "https://www.yualexius.com/wp-content/uploads/2022/08/White-Cat-Legend-Season-2-donghua-461x650.jpg", imageUrls: [] } },
    { title: "Basketball - Size 7", description: "A standard size 7 basketball. Still has good grip and holds air well. Donating this so someone can enjoy playing and stay active.", category: "sports-outdoors", images: { thumbnail: "https://i.pinimg.com/736x/c9/33/b2/c933b2cbd62deaa094360b8d059a2518.jpg", imageUrls: [] } },
    { title: "Blender for Smoothies and Juices", description: "This blender works great and is in good, clean condition. The blade is still sharp. Perfect for someone who wants to make healthy smoothies at home.", category: "home-kitchen", images: { thumbnail: "https://images.pexels.com/photos/7089020/pexels-photo-7089020.jpeg", imageUrls: [] } },
    { title: "Office Chair with Lumbar Support", description: "Giving away this ergonomic office chair. The height adjustment works perfectly. It's in good condition and would be great for a student or someone working from home.", category: "office-supplies-stationery", images: { thumbnail: "https://about.vidio.com/wp-content/uploads/2020/12/KV-BLOG_SIGNAL.jpg", imageUrls: [] } },
    { title: "Acoustic Guitar for Beginners", description: "Donating this acoustic guitar. It has a few minor scratches but plays beautifully. Comes with a soft case. Hope this can go to an aspiring musician.", category: "books-music-media", images: { thumbnail: "https://images.pexels.com/photos/402028/pexels-photo-402028.jpeg", imageUrls: [] } },
    { title: "Wall Clock with Modern Design", description: "A simple and modern wall clock. Battery-operated and keeps time accurately. In excellent condition. Who wants a nice clock for their living room or kitchen?", category: "home-kitchen", images: { thumbnail: "https://tse3.mm.bing.net/th/id/OIP.lkq4vC8TgR7yJNmK4gV9ZgHaDt?r=0&rs=1&pid=ImgDetMain&o=7&rm=3", imageUrls: [] } },
    { title: "Set of Painting Supplies", description: "Includes a set of acrylic paints, brushes, and a small easel. Mostly unused. Perfect for a budding artist who wants to explore their creativity.", category: "office-supplies-stationery", images: { thumbnail: "https://wallpaperaccess.com/full/3445902.jpg", imageUrls: [] } },
];


enum RequestStatus {
    PENDING = "PENDING",
    ACCEPTED = "ACCEPTED",
    REJECTED = "REJECTED",
    SHIPPED = "SHIPPED",
    COMPLETED = "COMPLETED",
}

// Data Lokasi di Indonesia dengan Kecamatan
const indonesianCities = [
    { city: "Tangerang Selatan", lat: -6.2887, lon: 106.7103, subdistricts: ["Serpong", "Ciputat", "Pondok Aren", "Pamulang"] },
    { city: "Jakarta Selatan", lat: -6.2615, lon: 106.8106, subdistricts: ["Kebayoran Baru", "Cilandak", "Tebet", "Pasar Minggu"] },
    { city: "Surabaya", lat: -7.2575, lon: 112.7521, subdistricts: ["Gubeng", "Wonokromo", "Tambaksari", "Sawahan"] },
    { city: "Bandung", lat: -6.9175, lon: 107.6191, subdistricts: ["Coblong", "Sukajadi", "Andir", "Regol"] },
    { city: "Medan", lat: 3.5952, lon: 98.6722, subdistricts: ["Medan Baru", "Medan Petisah", "Medan Polonia", "Medan Johor"] },
    { city: "Semarang", lat: -6.9667, lon: 110.4381, subdistricts: ["Semarang Tengah", "Candisari", "Gajahmungkur", "Banyumanik"] },
];

const COMPLETED_POST_THUMBNAIL = "https://res.cloudinary.com/dffbvex6y/image/upload/v1753868155/Logo_donasiin_lojeyk.png";
const TRACKING_CODE_URL = "https://res.cloudinary.com/dffbvex6y/image/upload/v1753868155/Logo_donasiin_lojeyk.png";

// --- Logika Seeding Utama ---
async function seedDatabase() {
    try {
        await client.connect();
        console.log("✅ Berhasil terhubung ke MongoDB untuk seeding.");
        const db = client.db(MONGODB_DB);

        console.log("🧹 Membersihkan koleksi lama (users, posts, requests)...");
        await db.collection("users").deleteMany({});
        await db.collection("posts").deleteMany({});
        await db.collection("requests").deleteMany({});
        console.log("🧹 Koleksi berhasil dibersihkan.");

        const TOTAL_USERS = 63;
        console.log(`👤 Membuat ${TOTAL_USERS} data pengguna...`);
        const usersToInsert = [];
        const hashedPassword = await bcrypt.hash("password123", 10);
        for (let i = 0; i < TOTAL_USERS; i++) {
            const cityInfo = getRandomElement(indonesianCities);
            const subdistrict = getRandomElement(cityInfo.subdistricts);
            usersToInsert.push({
                _id: new ObjectId(),
                fullName: faker.person.fullName(),
                username: faker.internet.userName().toLowerCase().replace(/[^a-z0-9_]/g, '') + faker.string.numeric(3),
                email: faker.internet.email().toLowerCase(),
                password: hashedPassword,
                avatarUrl: `https://i.pravatar.cc/150?u=${faker.string.uuid()}`,
                address: `${subdistrict}, ${cityInfo.city}`,
                location: {
                    type: "Point",
                    coordinates: [
                        parseFloat(faker.location.longitude({ min: cityInfo.lon - 0.05, max: cityInfo.lon + 0.05 }).toFixed(7)),
                        parseFloat(faker.location.latitude({ min: cityInfo.lat - 0.05, max: cityInfo.lat + 0.05 }).toFixed(7)),
                    ],
                },
                dailyLimit: 5,
                createdAt: faker.date.past({ years: 1 }),
                updatedAt: new Date(),
            });
        }
        await db.collection("users").insertMany(usersToInsert);
        const users = await db.collection("users").find({}).toArray();
        console.log(`👤 Berhasil membuat ${users.length} pengguna.`);

        console.log("📝 Membuat postingan & permintaan sesuai logika baru...");
        const postsToInsert = [];
        const requestsToInsert = [];

        const AVAILABLE_LIMIT = allDonationItems.length;
        const availableItemPool = shuffleArray(allDonationItems);
        const completedItemPool = shuffleArray(allDonationItems);

        for (let i = 0; i < users.length; i++) {
            const currentUser = users[i];
            const otherUsers = users.filter(u => u._id.toHexString() !== currentUser._id.toHexString());

            if (otherUsers.length < 2) continue;

            // --- 1. Post Lama (Selalu COMPLETED) ---
            const oldItem = completedItemPool[i % completedItemPool.length];
            const oldPostId = new ObjectId();
            const oldCarbonKg = parseFloat((Math.random() * 14 + 1).toFixed(2));

            postsToInsert.push({
                _id: oldPostId,
                title: oldItem.title,
                slug: faker.helpers.slugify(oldItem.title).toLowerCase() + '-' + faker.string.alphanumeric(4),
                thumbnailUrl: COMPLETED_POST_THUMBNAIL,
                imageUrls: oldItem.images.imageUrls,
                description: oldItem.description,
                category: oldItem.category,
                isAvailable: false,
                userId: currentUser._id,
                createdAt: faker.date.past({ years: 1 }),
                updatedAt: faker.date.recent({ days: 60 }),
                carbonKg: oldCarbonKg,
                aiAnalysis: `Donating this item helps save approximately ${oldCarbonKg} kg of CO2.`,
            });

            let [requester1, requester2] = shuffleArray(otherUsers);
            requestsToInsert.push({
                _id: new ObjectId(), userId: requester1._id, postId: oldPostId, status: RequestStatus.COMPLETED,
                trackingCode: `DONS${faker.string.numeric(10)}`, // TRACKING CODE DIPERBARUI
                trackingCodeUrl: TRACKING_CODE_URL,               // TRACKING URL DIPERBARUI
                createdAt: faker.date.recent({ days: 90 }), updatedAt: new Date(),
            });
            requestsToInsert.push({
                _id: new ObjectId(), userId: requester2._id, postId: oldPostId, status: RequestStatus.REJECTED,
                trackingCode: "", trackingCodeUrl: "",
                createdAt: faker.date.recent({ days: 90 }), updatedAt: new Date(),
            });

            // --- 2. Post Baru (Status Tergantung Limit) ---
            const newPostId = new ObjectId();
            const newCarbonKg = parseFloat((Math.random() * 14 + 1).toFixed(2));

            if (i < AVAILABLE_LIMIT) {
                const newItem = availableItemPool.pop()!;
                let [requester3, requester4] = shuffleArray(otherUsers);

                postsToInsert.push({
                    _id: newPostId, title: newItem.title, slug: faker.helpers.slugify(newItem.title).toLowerCase() + '-' + faker.string.alphanumeric(4),
                    thumbnailUrl: newItem.images.thumbnail, imageUrls: newItem.images.imageUrls,
                    description: newItem.description, category: newItem.category, isAvailable: true,
                    userId: currentUser._id, createdAt: faker.date.recent({ days: 7 }), updatedAt: faker.date.recent({ days: 1 }),
                    carbonKg: newCarbonKg, aiAnalysis: `Donating this item helps save approximately ${newCarbonKg} kg of CO2.`,
                });

                requestsToInsert.push({ _id: new ObjectId(), userId: requester3._id, postId: newPostId, status: RequestStatus.PENDING, trackingCode: "", trackingCodeUrl: "", createdAt: faker.date.recent({ days: 2 }), updatedAt: new Date() });
                requestsToInsert.push({ _id: new ObjectId(), userId: requester4._id, postId: newPostId, status: RequestStatus.PENDING, trackingCode: "", trackingCodeUrl: "", createdAt: faker.date.recent({ days: 1 }), updatedAt: new Date() });

            } else {
                const newItem = completedItemPool[(i + 5) % completedItemPool.length];
                let [requester3, requester4] = shuffleArray(otherUsers);

                postsToInsert.push({
                    _id: newPostId, title: newItem.title, slug: faker.helpers.slugify(newItem.title).toLowerCase() + '-' + faker.string.alphanumeric(4),
                    thumbnailUrl: COMPLETED_POST_THUMBNAIL, imageUrls: newItem.images.imageUrls,
                    description: newItem.description, category: newItem.category, isAvailable: false,
                    userId: currentUser._id, createdAt: faker.date.recent({ days: 20 }), updatedAt: faker.date.recent({ days: 5 }),
                    carbonKg: newCarbonKg, aiAnalysis: `Donating this item helps save approximately ${newCarbonKg} kg of CO2.`,
                });

                requestsToInsert.push({
                    _id: new ObjectId(), userId: requester3._id, postId: newPostId, status: RequestStatus.COMPLETED,
                    trackingCode: `DONS${faker.string.numeric(10)}`, // TRACKING CODE DIPERBARUI
                    trackingCodeUrl: TRACKING_CODE_URL,               // TRACKING URL DIPERBARUI
                    createdAt: faker.date.recent({ days: 15 }), updatedAt: new Date(),
                });
                requestsToInsert.push({
                    _id: new ObjectId(), userId: requester4._id, postId: newPostId, status: RequestStatus.REJECTED,
                    trackingCode: "", trackingCodeUrl: "",
                    createdAt: faker.date.recent({ days: 15 }), updatedAt: new Date(),
                });
            }
        }

        if (postsToInsert.length > 0) await db.collection("posts").insertMany(postsToInsert);
        if (requestsToInsert.length > 0) await db.collection("requests").insertMany(requestsToInsert);

        console.log(`📝 Berhasil membuat ${postsToInsert.length} postingan.`);
        console.log(`🤝 Berhasil membuat ${requestsToInsert.length} permintaan.`);
        console.log("✅ Seeding data selesai!");

    } catch (error) {
        console.error("❌ Gagal melakukan seeding:", error);
    } finally {
        await client.close();
        console.log("🔚 Koneksi ke MongoDB ditutup.");
    }
}

seedDatabase();