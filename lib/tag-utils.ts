export function normalizeTag(tag: string) {
  return tag.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function canonicalizeTag(tag: string) {
  return normalizeTag(tag).replace(/[\s._-]+/g, '').replace(/[^a-z0-9#+]/g, '');
}

export function normalizeTags(tags: string[]) {
  const seen = new Set<string>();

  return tags.flatMap((tag) => {
    const normalized = normalizeTag(tag);
    if (!normalized) {
      return [];
    }

    const canonical = canonicalizeTag(normalized);
    if (!canonical || seen.has(canonical)) {
      return [];
    }

    seen.add(canonical);
    return [normalized];
  });
}
