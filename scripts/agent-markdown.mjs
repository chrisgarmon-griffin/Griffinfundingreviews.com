/**
 * Content negotiation for Markdown responses (acceptmarkdown.com).
 * Shared by server/middleware/agent-markdown.ts and its tests.
 */

/** Parse an Accept header into [{ type, q }], in header order. */
export function parseAccept(accept) {
  return String(accept ?? "")
    .split(",")
    .map((part) => {
      const [rawType, ...params] = part.trim().split(";");
      const type = (rawType ?? "").trim().toLowerCase();
      let q = 1;
      for (const param of params) {
        const [key, value] = param.trim().split("=");
        if (key?.trim().toLowerCase() === "q") {
          const parsed = Number.parseFloat(value ?? "");
          q = Number.isFinite(parsed) ? Math.min(Math.max(parsed, 0), 1) : 0;
        }
      }
      return { type, q };
    })
    .filter((entry) => entry.type);
}

function qualityFor(entries, type) {
  const exact = entries.find((e) => e.type === type);
  if (exact) return exact.q;
  const [major] = type.split("/");
  const range = entries.find((e) => e.type === `${major}/*`);
  if (range) return range.q;
  const any = entries.find((e) => e.type === "*/*");
  return any ? any.q : 0;
}

/**
 * True when the client names text/markdown explicitly and ranks it at least as
 * high as text/html. Browsers never name text/markdown, so they keep getting HTML;
 * a bare "*\/*" also gets HTML.
 */
export function wantsMarkdown(accept) {
  const entries = parseAccept(accept);
  const markdown = entries.find((e) => e.type === "text/markdown");
  if (!markdown || markdown.q <= 0) return false;
  return markdown.q >= qualityFor(entries, "text/html");
}

/** Add a token to a Vary header value without duplicating it. */
export function mergeVary(existing, token) {
  const parts = String(existing ?? "")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.includes("*")) return "*";
  if (!parts.some((p) => p.toLowerCase() === token.toLowerCase()))
    parts.push(token);
  return parts.join(", ");
}

/** Response headers for a Markdown body. */
export function markdownHeaders(canonicalUrl) {
  const headers = {
    "content-type": "text/markdown; charset=utf-8",
    vary: "Accept",
    "cache-control": "public, max-age=0, must-revalidate",
    "x-content-type-options": "nosniff",
  };
  if (canonicalUrl) headers.link = `<${canonicalUrl}>; rel="canonical"`;
  return headers;
}
