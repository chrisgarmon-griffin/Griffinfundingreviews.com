/**
 * Markdown content negotiation for agents (acceptmarkdown.com).
 *
 * - `Accept: text/markdown` on a page path → the Markdown version of that page,
 *   `Content-Type: text/markdown`, `Vary: Accept`.
 * - Same header on a path with no page → HTTP 404 with a Markdown body that
 *   links to the pages, llms.txt, and the sitemap.
 * - Every other request passes through; HTML documents gain `Vary: Accept` so
 *   caches keep the two representations apart.
 *
 * Auto-registered like grok-pwa.ts (vite.config.ts sets `serverDir: "./server"`).
 */
import { isDocumentPath } from "../../scripts/grok-pwa-shared.mjs";
import {
  markdownHeaders,
  mergeVary,
  wantsMarkdown,
} from "../../scripts/agent-markdown.mjs";
import {
  markdownForPath,
  notFoundMarkdown,
} from "../../src/lib/agent/markdown.ts";
import { SITE_URL } from "../../src/data/site.ts";

interface AgentMarkdownEvent {
  url: URL;
  req: { method: string; headers: Headers };
}

export default async function agentMarkdownMiddleware(
  event: AgentMarkdownEvent,
  next: () => unknown | Promise<unknown>,
): Promise<unknown> {
  const method = (event.req.method ?? "GET").toUpperCase();
  const path = event.url.pathname;
  if ((method !== "GET" && method !== "HEAD") || !isDocumentPath(path))
    return next();

  if (wantsMarkdown(event.req.headers.get("accept"))) {
    const markdown = markdownForPath(path);
    const body = markdown ?? notFoundMarkdown(path);
    const canonical = markdown ? new URL(path, SITE_URL).href : undefined;
    return new Response(method === "HEAD" ? null : body, {
      status: markdown ? 200 : 404,
      headers: markdownHeaders(canonical),
    });
  }

  const result = await next();
  if (
    result instanceof Response &&
    String(result.headers.get("content-type") ?? "").includes("text/html")
  ) {
    const headers = new Headers(result.headers);
    headers.set("vary", mergeVary(headers.get("vary"), "Accept"));
    return new Response(result.body, {
      status: result.status,
      statusText: result.statusText,
      headers,
    });
  }
  return result;
}
