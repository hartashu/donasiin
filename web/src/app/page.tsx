"use client";

import { getPosts } from "@/actions/action";
import Banner from "@/components/home/Banner";
import PostCards from "@/components/home/PostCards";
import Stories from "@/components/home/Stories";
import Witness from "@/components/home/Witness";
import { IPost } from "@/types/types";
import { useEffect, useState } from "react";

export default function Home() {
  const [data, setData] = useState<IPost[]>([]);

  const fetchData = async () => {
    const dataJson = await getPosts();

    setData(dataJson);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <main className="overflow-x-hidden">
      <section>
        <Banner />
      </section>

      <section>
        <Witness />
      </section>

      <section>
        <Stories />
      </section>

      <section>
        <PostCards data={data} />
      </section>
    </main>
  );
}
