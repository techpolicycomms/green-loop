const hits = new Map<string, { count: number; ts: number }>();

const MAX_ENTRIES = 10_000;

export function rateLimit(key: string, limit = 30, windowMs = 60_000) {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || now - entry.ts > windowMs) {
    if (hits.size > MAX_ENTRIES) {
      for (const [k, v] of hits) {
        if (now - v.ts > windowMs) hits.delete(k);
      }
    }
    hits.set(key, { count: 1, ts: now });
    return { ok: true };
  }

  if (entry.count >= limit) return { ok: false };

  entry.count += 1;
  return { ok: true };
}
