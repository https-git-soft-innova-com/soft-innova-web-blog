import type { APIRoute } from "astro";
import { getEmDashCollection, getTermsForEntries } from "emdash";

import { getReadingTime } from "../../utils/reading-time";
import { getPostViewCountsForLocals } from "../../utils/post-views";

export const prerender = false;

const ALLOWED_ORIGINS = new Set([
	"https://www.soft-innova.com",
	"https://soft-innova.com",
]);

function corsHeaders(request: Request): HeadersInit {
	const origin = request.headers.get("Origin");
	return {
		"Content-Type": "application/json",
		"Cache-Control": "public, max-age=300",
		"Access-Control-Allow-Origin":
			origin && ALLOWED_ORIGINS.has(origin)
				? origin
				: "https://www.soft-innova.com",
		"Access-Control-Allow-Methods": "GET, OPTIONS",
	};
}

function getFeaturedImageUrl(img: unknown, origin: string): string | undefined {
	if (!img || typeof img !== "object") return undefined;
	const image = img as Record<string, unknown>;
	if (typeof image.src === "string" && image.src) {
		return image.src.startsWith("http")
			? image.src
			: `${origin}${image.src}`;
	}
	const meta = image.meta as Record<string, unknown> | undefined;
	const storageKey =
		(typeof meta?.storageKey === "string" ? meta.storageKey : undefined) ||
		(typeof image.id === "string" ? image.id : undefined);
	if (storageKey) {
		return `${origin}/_emdash/api/media/file/${storageKey}`;
	}
	return undefined;
}

export const OPTIONS: APIRoute = async ({ request }) => {
	return new Response(null, {
		status: 204,
		headers: corsHeaders(request),
	});
};

export const GET: APIRoute = async ({ request, locals, site, url }) => {
	try {
		const siteUrl = site?.toString() || url.origin;

		const { entries: posts } = await getEmDashCollection("posts", {
			orderBy: { published_at: "desc" },
			limit: 3,
		});

		const tagsByEntry = await getTermsForEntries(
			"posts",
			posts.map((p) => p.data.id),
			"tag",
		);

		const viewCounts = await getPostViewCountsForLocals(
			locals,
			posts.map((post) => post.data.id),
		);

		const items = posts.map((post) => {
			const primaryTag = tagsByEntry.get(post.data.id)?.[0];
			const byline = post.data.bylines?.[0];

			return {
				slug: post.id,
				title: post.data.title ?? "Untitled",
				excerpt: post.data.excerpt ?? "",
				publishedAt: post.data.publishedAt?.toISOString() ?? null,
				byline: byline?.displayName ?? "Mila Vivanco",
				category: primaryTag?.label ?? "",
				featuredImage: getFeaturedImageUrl(post.data.featured_image, siteUrl),
				readingTimeMinutes: getReadingTime(post.data.content),
				viewCount: viewCounts.get(post.data.id) ?? 0,
			};
		});

		return new Response(JSON.stringify({ items }), {
			headers: corsHeaders(request),
		});
	} catch (e) {
		const message = e instanceof Error ? e.message : "Unknown error";
		return new Response(JSON.stringify({ error: message }), {
			status: 500,
			headers: corsHeaders(request),
		});
	}
};
