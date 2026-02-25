export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function isSlugConflict(error: { code?: string | null; message?: string | null }): boolean {
  const normalized = `${error.code ?? ''} ${error.message ?? ''}`.toLowerCase();
  return (
    normalized.includes('23505') ||
    normalized.includes('duplicate key') ||
    normalized.includes('(slug)')
  );
}
