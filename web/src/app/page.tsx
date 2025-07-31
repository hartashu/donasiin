// import { PostModel } from "@/models/post";
// import Banner from "@/components/home/Banner";
// import PostCards from "@/components/home/PostCards";
// import Witness from "@/components/home/Witness";
// import TalkingSection from "@/components/home/Stories";

// async function getPostsData() {
//   try {
//     const { posts } = await PostModel.getAllPosts({ limit: 8 });
//     return posts;
//   } catch (error) {
//     console.error("Failed to fetch posts for homepage:", error);
//     return [];
//   }
// }

// export default async function HomePage() {
//   const posts = await getPostsData();

//   return (
//     <main>
//       <Banner />
//       <Witness />
//       <PostCards data={JSON.parse(JSON.stringify(posts))} />
//       <TalkingSection />
//     </main>
//   );
// }

// src/app/page.tsx

import { PostModel } from "@/models/post";
import Banner from "@/components/home/Banner";
import PostCards from "@/components/home/PostCards";
import Witness from "@/components/home/Witness";
import TalkingSection from "@/components/home/Stories";
import WaveSeparator from "@/components/home/WaveSeparator";
import WaveSeparatorFlipped from "@/components/home/WaveSeparatorFlipped";
import About from "@/components/home/About";

async function getPostsData() {
  try {
    const { posts } = await PostModel.getAllPosts({ limit: 8 });
    return posts;
  } catch (error) {
    console.error("Failed to fetch posts for homepage:", error);
    return [];
  }
}

export default async function HomePage() {
  const posts = await getPostsData();

  return (
    <main>
      <div className="relative">
        <Banner />
        <WaveSeparator />
      </div>

      <About />
      <div className="relative">
        <svg
          className="w-full"
          viewBox="0 0 1440 140"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 0 C 360 160 1080 -40 1440 100 L1440 140L0 140Z"
            fill="#2F5F61"
            className="drop-shadow-[0_8px_16px_rgba(34,197,94,0.2)]"
          />
        </svg>
      </div>
      <div className="relative -mt-[1px]">
        <svg
          className="w-full scale-x-[-1]"
          viewBox="0 0 1440 140"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 140 C 360 -20 1080 180 1440 40 L1440 0L0 0Z"
            fill="#2F5F61"
            className="drop-shadow-[0_-8px_16px_rgba(34,197,94,0.2)]"
          />
        </svg>
      </div>

      <Witness />
      <WaveSeparatorFlipped />

      <div className="relative z-10">
        <PostCards data={JSON.parse(JSON.stringify(posts))} />
        <div className="relative">
          <svg
            className="absolute left-0 w-full"
            viewBox="0 0 1440 100"
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 0C180 100 360 100 540 50C720 0 900 0 1080 50C1260 100 1440 100 1440 100V0H0Z"
              fill="white"
            />
          </svg>
        </div>
      </div>

      <TalkingSection />
    </main>
  );
}
