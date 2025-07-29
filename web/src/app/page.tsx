import { PostModel } from "@/models/post";
import Banner from "@/components/home/Banner";
import PostCards from "@/components/home/PostCards";
import Witness from "@/components/home/Witness";
import TalkingSection from "@/components/home/Stories";

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
      <Banner />
      <Witness />
      <PostCards data={JSON.parse(JSON.stringify(posts))} />
      <TalkingSection />
    </main>
  );
}