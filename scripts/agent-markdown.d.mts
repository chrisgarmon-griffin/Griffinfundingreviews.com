export function parseAccept(
  accept: string | null | undefined,
): { type: string; q: number }[];
export function wantsMarkdown(accept: string | null | undefined): boolean;
export function mergeVary(
  existing: string | null | undefined,
  token: string,
): string;
export function markdownHeaders(canonicalUrl?: string): Record<string, string>;
