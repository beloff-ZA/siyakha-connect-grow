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
  return path.replace(/[^a-zA-Z0-9/_-]/g, '').replace(/\/+$/, '');
}
