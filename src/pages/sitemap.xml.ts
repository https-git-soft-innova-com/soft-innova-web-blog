import type { APIRoute } from "astro";
import { getEmDashCollection } from "emdash";

const SITE_URL = "https://blog.soft-innova.com";

export const GET: APIRoute = async () => {
	const { entries: posts } = await getEmDashCollection("posts", {
		orderBy: { published_at: "desc" },
		limit: 100,
	});

	const staticUrls = [
		{
			loc: `${SITE_URL}/`,
			lastmod: new Date().toISOString(),
			changefreq: "daily",
			priority: "1.0",
		},
		{
			loc: `${SITE_URL}/posts`,
			lastmod: new Date().toISOString(),
			changefreq: "daily",
			priority: "0.9",
		},
	];

	const postUrls = posts
		.filter((post) => post.data.publishedAt)
		.map((post) => ({
			loc: `${SITE_URL}/posts/${post.id}`,
			lastmod: (post.data.updatedAt ?? post.data.publishedAt)!.toISOString(),
			changefreq: "weekly",
			priority: "0.8",
		}));

	const allUrls = [...staticUrls, ...postUrls];

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map((u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join("\n")}
</urlset>`;

	return new Response(xml, {
		headers: {
			"Content-Type": "application/xml; charset=utf-8",
			"Cache-Control": "public, max-age=3600",
		},
	});
};

function escapeXml(str: string): string {
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
}
