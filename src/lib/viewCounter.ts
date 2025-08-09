export async function getViews(namespace: string, key: string): Promise<number> {
  try {
    const res = await fetch(`https://api.countapi.xyz/get/${encodeURIComponent(namespace)}/${encodeURIComponent(key)}`);
    if (!res.ok) throw new Error('Failed to get views');
    const data = await res.json();
    return typeof data?.value === 'number' ? data.value : 0;
  } catch {
    return 0;
  }
}

export async function hitView(namespace: string, key: string): Promise<number> {
  try {
    const res = await fetch(`https://api.countapi.xyz/hit/${encodeURIComponent(namespace)}/${encodeURIComponent(key)}`);
    if (!res.ok) throw new Error('Failed to increment views');
    const data = await res.json();
    return typeof data?.value === 'number' ? data.value : 0;
  } catch {
    return 0;
  }
}

export function defaultNamespace() {
  // Use host-based namespace to avoid collisions across deployments
  const host = typeof window !== 'undefined' ? window.location.host : 'local';
  return `siyakha-blog-${host.replace(/\./g, '-')}`;
}

export function keyFromSlug(slug?: string) {
  const path = slug || (typeof window !== 'undefined' ? window.location.pathname : 'unknown');
  return path.replace(/[^a-zA-Z0-9\/_-]/g, '').replace(/\/+$/, '');
}

// Display helpers: provide a stable baseline per key so new posts don't show 0
export function baselineForKey(key: string): number {
  // stable hash
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) - hash) + key.charCodeAt(i);
    hash |= 0; // 32-bit
  }
  const bucket = Math.abs(hash) % 10;
  if (bucket === 0) return 600;
  if (bucket === 1 || bucket === 2) return 100;
  if (bucket === 3) return 59;
  return 90; // default baseline
}

export function applyDisplayOffset(key: string, raw: number): number {
  const base = baselineForKey(key);
  const safe = Number.isFinite(raw) && raw > 0 ? raw : 0;
  return base + safe;
}
