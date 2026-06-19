import type { APIRoute } from "astro";
import { getEmDashCollection, getTermsForEntries } from "emdash";

import { getReadingTime } from "../../utils/reading-time";
import { getPostViewCountsForLocals } from "../../utils/post-views";

export const prerender = false;

const ALLOWED_ORIGINS = new Set([
	"https://www.soft-innova.com",
	"https://soft-innova.com",
]);

/** Primary tag label por slug (fallback si content_taxonomies no tiene filas). */
const CATEGORY_BY_SLUG: Record<string, string> = {
	"muerte-clic-tradicional": "AEO",
	"laberinto-cognitivo-ecommerce": "Annie-AI",
	"fin-marketing-creencias": "Growth Marketing",
	"fragilidad-del-gigante-wordpress": "WordPress",
	"fabricas-2040-venta-autonoma": "Fábricas 2040",
	"pymes-crecer-annie-ai": "Annie-AI",
	"soberania-digital": "Soberanía Digital",
	"hubspot-ia-chile-2026": "HubSpot",
	"magnifica-humanitas-ia-etica": "Dirección",
	"sobrevivir-recesion-2026": "Comercial",
	"ia-ventas-mineria-exponor-2026": "Comercial",
	"agente-olvidadizo-continual-learning": "emDASH",
};

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

		const items = posts
			.map((post) => {
			const entryId = post.data.id;
			const publicSlug = post.id;
			const tags = tagsByEntry.get(entryId) ?? [];
			const primaryTag = tags[0];
			const byline = post.data.bylines?.[0];
			const bylineCredit = byline as
				| { byline?: { displayName?: string }; displayName?: string }
				| undefined;

			return {
				slug: publicSlug,
				link: `${siteUrl}/posts/${publicSlug}`,
				title: post.data.title ?? "Untitled",
				excerpt: post.data.excerpt ?? "",
				publishedAt: post.data.publishedAt?.toISOString() ?? null,
				byline:
					bylineCredit?.byline?.displayName ??
					bylineCredit?.displayName ??
					"Mila Vivanco",
				category:
					primaryTag?.label ??
					primaryTag?.slug ??
					CATEGORY_BY_SLUG[publicSlug] ??
					"",
				featuredImage: getFeaturedImageUrl(post.data.featured_image, siteUrl),
				readingTimeMinutes: getReadingTime(post.data.content),
				viewCount: viewCounts.get(entryId) ?? 0,
			};
		})
			.sort(
				(a, b) =>
					new Date(b.publishedAt ?? 0).getTime() -
					new Date(a.publishedAt ?? 0).getTime(),
			);

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
