// import { NextRequest, NextResponse } from "next/server";
// import { getSession } from "@/utils/getSession";
// import handleError from "@/errorHandler/errorHandler";
// import { ObjectId } from "mongodb";
// import { PostModel } from "@/models/post";
// import { RequestModel } from "@/models/request";
// import { UserModel } from "@/models/user.model";
// import { IJsonResponse } from "@/types/types";
// import { updateProfileSchema } from "@/utils/validations/user";

// export async function GET(_request: NextRequest) { // <--- FIX DI SINI
//   try {
//     const session = await getSession();
//     if (!session?.user?.id) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const userId = new ObjectId(session.user.id);

//     const [userProfile, userPosts, userRequests] = await Promise.all([
//       UserModel.getUserById(session.user.id),
//       PostModel.findUserPostsWithRequesters(userId),
//       RequestModel.findUserRequests(session.user.id)
//     ]);

//     if (!userProfile) {
//       return NextResponse.json({ error: "User not found" }, { status: 404 });
//     }

//     // eslint-disable-next-line @typescript-eslint/no-unused-vars
//     const { password: _, ...safeUserProfile } = userProfile;

//     return NextResponse.json({
//       statusCode: 200,
//       data: {
//         profile: safeUserProfile,
//         posts: userPosts,
//         requests: userRequests,
//       },
//     });
//   } catch (error) {
//     return handleError(error);
//   }
// }

// export async function PATCH(request: NextRequest) {
//   try {
//     const session = await getSession();
//     if (!session?.user?.id) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const body = await request.json();
//     const validatedData = updateProfileSchema.parse(body);

//     await UserModel.updateUserProfile(
//       new ObjectId(session.user.id),
//       validatedData
//     );

//     return NextResponse.json<IJsonResponse<null>>({ statusCode: 200, message: "Profile updated successfully." });

//   } catch (error) {
//     return handleError(error);
//   }
// }


import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/utils/getSession";
import handleError from "@/errorHandler/errorHandler";
import { ObjectId } from "mongodb";
import { PostModel } from "@/models/post";
import { RequestModel } from "@/models/request.model"; // Pastikan path ini benar
import { UserModel } from "@/models/user.model";
import { IJsonResponse, RequestStatus, IRequestWithPostDetails, Achievement, Activity } from "@/types/types";
import { updateProfileSchema } from "@/utils/validations/user";

// Definisikan achievements di sini agar bisa diakses oleh GET handler
const allAchievements: Omit<Achievement, 'unlocked' | 'icon'> & { icon: string }[] = [
  { id: "FIRST_DONATION", icon: "PackagePlus", title: "First Step", description: "Make your first donation." },
  { id: "FIVE_DONATIONS", icon: "Award", title: "Generous Giver", description: "Donate 5 items." },
  { id: "TEN_DONATIONS", icon: "Crown", title: "Donation Champion", description: "Donate 10 items." },
  { id: "FIRST_REQUEST", icon: "GitMerge", title: "Active Requester", description: "Make your first request." },
  { id: "FIVE_REQUESTS", icon: "Users", title: "Community Pillar", description: "Make 5 requests." },
  { id: "HIGH_DEMAND", icon: "Zap", title: "In High Demand", description: "Receive 10 requests on your items." },
  { id: "GOOD_SAMARITAN", icon: "HeartHandshake", title: "Good Samaritan", description: "Have 5 of your donations completed." },
  { id: "FAST_STARTER", icon: "Rocket", title: "Fast Starter", description: "Make a donation within 24 hours of joining." },
  { id: "NIGHT_OWL", icon: "Moon", title: "Night Owl", description: "Post a donation between 10 PM and 6 AM." },
  { id: "EARLY_BIRD", icon: "Sun", title: "Early Bird", description: "Post a donation between 6 AM and 9 AM." },
  { id: "CONSISTENT", icon: "CalendarCheck", title: "Consistent Contributor", description: "Donate at least once a week for a month." },
  { id: "BOOKWORM", icon: "Feather", title: "Bookworm", description: "Donate a book." },
  { id: "FASHIONISTA", icon: "Star", title: "Fashionista", "description": "Donate a fashion item." },
  { id: "TECH_SAVVY", icon: "Coffee", title: "Tech Savvy", description: "Donate an electronic item." },
  { id: "TRUSTED_MEMBER", icon: "ShieldCheck", title: "Trusted Member", description: "Be an active member of the community." },
];

export async function GET(_request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = new ObjectId(session.user.id);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [userProfile, userPosts, userRequests] = await Promise.all([
      UserModel.getUserById(session.user.id),
      PostModel.findUserPostsWithRequesters(userId),
      RequestModel.findUserRequests(session.user.id)
    ]);

    if (!userProfile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Kalkulasi Stats
    const dailyRequestsMade = userRequests.filter(req => new Date(req.createdAt) >= todayStart).length;
    const totalIncomingRequests = userPosts.reduce((sum, post) => (post.requests as IRequestWithPostDetails[]).length + sum, 0);
    const completedDonations = userPosts.filter(p => !p.isAvailable).length;
    const stats = {
      totalPosts: userPosts.length,
      totalIncomingRequests,
      totalOutgoingRequests: userRequests.length,
      totalCarbonSavings: userPosts.filter(p => !p.isAvailable).reduce((sum, p) => sum + (p.carbonKg || 0), 0),
      completedDonations,
      dailyRequestsMade,
    };

    // Kalkulasi Achievements
    const unlockedAchievements = allAchievements.map(ach => {
      let unlocked = false;
      const userJoinedDate = new Date(userProfile.createdAt);
      switch (ach.id) {
        case "FIRST_DONATION": unlocked = stats.totalPosts > 0; break;
        case "FIVE_DONATIONS": unlocked = stats.totalPosts >= 5; break;
        case "TEN_DONATIONS": unlocked = stats.totalPosts >= 10; break;
        case "FIRST_REQUEST": unlocked = stats.totalOutgoingRequests > 0; break;
        case "FIVE_REQUESTS": unlocked = stats.totalOutgoingRequests >= 5; break;
        case "HIGH_DEMAND": unlocked = stats.totalIncomingRequests >= 10; break;
        case "GOOD_SAMARITAN": unlocked = stats.completedDonations >= 5; break;
        case "FAST_STARTER":
          const firstPostDate = userPosts.length > 0 ? new Date(userPosts[userPosts.length - 1].createdAt) : null;
          if (firstPostDate) { unlocked = (firstPostDate.getTime() - userJoinedDate.getTime()) < 24 * 60 * 60 * 1000; }
          break;
        case "NIGHT_OWL": unlocked = userPosts.some(p => { const hour = new Date(p.createdAt).getHours(); return hour >= 22 || hour < 6; }); break;
        case "EARLY_BIRD": unlocked = userPosts.some(p => { const hour = new Date(p.createdAt).getHours(); return hour >= 6 && hour < 9; }); break;
        case "BOOKWORM": unlocked = userPosts.some(p => p.category.toLowerCase() === 'books'); break;
        case "FASHIONISTA": unlocked = userPosts.some(p => p.category.toLowerCase() === 'fashion'); break;
        case "TECH_SAVVY": unlocked = userPosts.some(p => p.category.toLowerCase() === 'electronics'); break;
        case "TRUSTED_MEMBER": unlocked = true; break;
      }
      return { ...ach, unlocked };
    });

    // Buat Activity Feed
    const activityFeed: Activity[] = [];
    userPosts.forEach(post => {
      activityFeed.push({ type: 'I_CREATED_A_POST', title: post.title, date: post.createdAt });
      (post.requests as IRequestWithPostDetails[]).forEach(req => {
        activityFeed.push({ type: 'SOMEONE_REQUESTED_MY_ITEM', title: post.title, otherUserName: req.requester.fullName, date: req.createdAt });
        if (req.status !== RequestStatus.PENDING) {
          activityFeed.push({ type: 'I_UPDATED_A_REQUEST', title: post.title, otherUserName: req.requester.fullName, status: req.status, date: req.updatedAt || req.createdAt });
        }
      });
    });
    userRequests.forEach(req => {
      if (req.postDetails) {
        activityFeed.push({ type: 'I_MADE_A_REQUEST', title: req.postDetails.title, otherUserName: req.postDetails.author.fullName, date: req.createdAt });
        if (req.status !== RequestStatus.PENDING) {
          activityFeed.push({ type: 'MY_REQUEST_WAS_UPDATED', title: req.postDetails.title, otherUserName: req.postDetails.author.fullName, status: req.status, date: req.updatedAt || req.createdAt });
        }
      }
    });
    const uniqueActivities = Array.from(new Map(activityFeed.map(act => [JSON.stringify(act), act])).values());
    uniqueActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...safeUserProfile } = userProfile;

    return NextResponse.json({
      statusCode: 200,
      data: {
        profile: safeUserProfile,
        posts: userPosts,
        requests: userRequests,
        stats,
        achievements: unlockedAchievements,
        activityFeed: uniqueActivities,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);

    await UserModel.updateUserProfile(
      new ObjectId(session.user.id),
      validatedData
    );

    return NextResponse.json<IJsonResponse<null>>({ statusCode: 200, message: "Profile updated successfully." });

  } catch (error) {
    return handleError(error);
  }
}
