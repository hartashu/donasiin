import { getPostBySlug } from "@/lib/data";
import { getSession } from "@/utils/getSession";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import DonationDetailClientView from "@/components/donations/DonationDetailClientView";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>;
}): Promise<Metadata> {
  const { slug } = await searchParams;
  console.log("🚀 ~ generateMetadata ~ slug:", slug);
  if (!slug) return { title: "Donation Post" };

  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post Not Found" };

  return {
    title: post.title,
    description: post.description.substring(0, 160),
    openGraph: {
      title: post.title,
      description: post.description.substring(0, 160),
      images: [{ url: post.thumbnailUrl, width: 1200, height: 630 }],
      type: "article",
    },
  };
}

export default async function DonationDetailPage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>;
}) {
  const { slug } = await searchParams;
  if (!slug) return notFound();

  const post = await getPostBySlug(slug);
  if (!post) return notFound();

  const session = await getSession();
  const sessionUserId = session?.user?.id || null;

  const hasRequested =
    post.requests?.some((req) => req.userId === sessionUserId) || false;

  return (
    <DonationDetailClientView
      postData={post}
      sessionUserId={sessionUserId}
      initialHasRequested={hasRequested}
    />
  );
}
