import type { APIRoute } from "astro";
import { getEmDashCollection } from "emdash";

export const GET: APIRoute = async () => {
  const { entries: posts } = await getEmDashCollection("posts", {
    orderBy: { published_at: "desc" },
    limit: 3,
  });

  const items = posts.map((post) => ({
    slug: post.id,
    title: post.data.title,
    excerpt: post.data.excerpt,
    publishedAt: post.data.publishedAt,
    byline: post.data.bylines?.[0]?.byline?.displayName ?? null,
  }));

  return new Response(JSON.stringify({ items }), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=300",
      "Access-Control-Allow-Origin": "https://www.soft-innova.com",
    },
  });
};
