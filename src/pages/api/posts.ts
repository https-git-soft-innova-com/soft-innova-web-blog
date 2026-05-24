import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  try {
    const db = (locals.runtime?.env as any)?.DB;
    
    if (!db) {
      return new Response(JSON.stringify({ error: "DB not available" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const result = await db.prepare(`
      SELECT 
        p.id,
        p.slug,
        json_extract(p.data, '$.title') as title,
        json_extract(p.data, '$.excerpt') as excerpt,
        p.published_at,
        b.display_name as byline
      FROM ec_posts p
      LEFT JOIN _emdash_bylines b ON p.primary_byline_id = b.id
      WHERE p.status = 'published'
      ORDER BY p.published_at DESC
      LIMIT 3
    `).all();

    const items = result.results.map((row: any) => ({
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      publishedAt: row.published_at,
      byline: row.byline,
    }));

    return new Response(JSON.stringify({ items }), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300",
        "Access-Control-Allow-Origin": "https://www.soft-innova.com",
      },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
