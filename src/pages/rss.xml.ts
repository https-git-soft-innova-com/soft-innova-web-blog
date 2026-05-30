import type { APIRoute } from "astro";
import { getEmDashCollection, getSiteSettings, getTermsForEntries } from "emdash";

import { resolveBlogSiteIdentity } from "../utils/site-identity";

function getFeaturedImageSrc(img: unknown): string {
	if (!img || typeof img !== "object") return "";
	const image = img as Record<string, unknown>;
	if (typeof image.src === "string" && image.src) {
		return image.src;
	}
	return "";
}

export const GET: APIRoute = async ({ site, url }) => {
	const siteUrl = site?.toString() || url.origin;
	const { siteTitle, siteTagline } = resolveBlogSiteIdentity(await getSiteSettings());

	const { entries: posts } = await getEmDashCollection("posts", {
		orderBy: { published_at: "desc" },
		limit: 20,
	});

	const tagsByEntry = await getTermsForEntries(
		"posts",
		posts.map((p) => p.data.id),
		"tag",
	);

	const items = posts
		.map((post) => {
			if (!post.data.publishedAt) return null;
			const pubDate = post.data.publishedAt.toUTCString();

			const postUrl = `${siteUrl}/posts/${post.id}`;
			const title = escapeXml(post.data.title || "Untitled");
			const description = escapeXml(post.data.excerpt || "");
			const primaryTag = tagsByEntry.get(post.data.id)?.[0];
			const categoryLine = primaryTag
				? `      <category>${escapeXml(primaryTag.label)}</category>\n`
				: "";
			const featuredImageSrc = getFeaturedImageSrc(post.data.featured_image);
			const mediaLines = featuredImageSrc
				? `      <enclosure url="${escapeXml(featuredImageSrc)}" type="image/jpeg" length="0"/>\n      <media:content url="${escapeXml(featuredImageSrc)}" medium="image"/>\n`
				: "";

			return `    <item>
      <title>${title}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${description}</description>
${categoryLine}${mediaLines}    </item>`;
		})
		.filter(Boolean)
		.join("\n");

	const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${escapeXml(siteTitle)}</title>
    <description>${escapeXml(siteTagline)}</description>
    <link>${siteUrl}</link>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    <language>es-CL</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

	return new Response(rss, {
		headers: {
			"Content-Type": "application/rss+xml; charset=utf-8",
			"Cache-Control": "public, max-age=3600",
			"Access-Control-Allow-Origin": "https://www.soft-innova.com",
		},
	});
};

const XML_ESCAPE_PATTERNS = [
	[/&/g, "&amp;"],
	[/</g, "&lt;"],
	[/>/g, "&gt;"],
	[/"/g, "&quot;"],
	[/'/g, "&apos;"],
] as const;

function escapeXml(str: string): string {
	let result = str;
	for (const [pattern, replacement] of XML_ESCAPE_PATTERNS) {
		result = result.replace(pattern, replacement);
	}
	return result;
}
