import { env } from "cloudflare:workers";

const VIEW_KEY_PREFIX = "post:views:";

export type RuntimeLocals = Record<string, unknown>;

export function getPostViewsKv(_locals: RuntimeLocals): KVNamespace | undefined {
	return (env as any).POST_VIEWS ?? (env as any).SESSION;
}

export function postViewKey(postId: string): string {
	return `${VIEW_KEY_PREFIX}${postId}`;
}

export async function getPostViewCounts(
	kv: KVNamespace | undefined,
	postIds: string[],
): Promise<Map<string, number>> {
	const counts = new Map<string, number>();
	if (!kv || postIds.length === 0) return counts;

	await Promise.all(
		postIds.map(async (postId) => {
			try {
				const raw = await kv.get(postViewKey(postId));
				if (!raw) return;
				const value = Number.parseInt(raw, 10);
				if (Number.isFinite(value) && value > 0) {
					counts.set(postId, value);
				}
			} catch {
				/* KV unavailable in some dev setups */
			}
		}),
	);

	return counts;
}

export async function getPostViewCountsForLocals(
	locals: RuntimeLocals,
	postIds: string[],
): Promise<Map<string, number>> {
	return getPostViewCounts(getPostViewsKv(locals), postIds);
}

export async function incrementPostView(
	kv: KVNamespace | undefined,
	postId: string,
): Promise<number> {
	if (!kv) return 0;

	const key = postViewKey(postId);
	const current = Number.parseInt((await kv.get(key)) ?? "0", 10);
	const next = (Number.isFinite(current) ? current : 0) + 1;
	await kv.put(key, String(next));
	return next;
}

export function formatViewCount(count: number): string {
	if (count >= 1_000_000) {
		return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
	}
	if (count >= 1_000) {
		return `${(count / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
	}
	return String(count);
}
