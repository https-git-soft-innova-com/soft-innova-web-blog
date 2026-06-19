import type { APIRoute } from "astro";
import { getEmDashCollection, getSiteSettings } from "emdash";

import { resolveBlogSiteIdentity } from "../utils/site-identity";

export const GET: APIRoute = async ({ site, url }) => {
	const siteUrl = (site?.toString() || url.origin).replace(/\/$/, "");
	const { siteTitle, siteTagline } = resolveBlogSiteIdentity(
		await getSiteSettings(),
	);

	const { entries: posts } = await getEmDashCollection("posts", {
		orderBy: { published_at: "desc" },
		limit: 15,
	});

	const articleLines = posts
		.map((post) => {
			const slug = post.id;
			const title = post.data.title ?? slug;
			return `- [${title}](${siteUrl}/posts/${slug})`;
		})
		.join("\n");

	const content = `# ${siteTitle}
> ${siteTagline}

## Blog
${siteUrl}

## Artículos recientes
${articleLines || "- (sin artículos publicados)"}

## Contacto
Web: https://www.soft-innova.com
Email: info@soft-innova.com
`;

	return new Response(content, {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
			"Cache-Control": "public, max-age=86400",
		},
	});
};
