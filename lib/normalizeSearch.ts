/**
 * Folds text for accent- and case-insensitive matching: decomposes it (NFD),
 * drops the combining marks and lower-cases it, so "Épicerie" → "epicerie".
 */
export function normalizeSearch(text: string): string {
  return text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}
