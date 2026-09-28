/**
 * Markdown versions of each page, served when a client sends `Accept: text/markdown`
 * (see server/middleware/agent-markdown.ts). Built from the same data as the HTML.
 */
import {
  AS_OF,
  AS_OF_ISO,
  BRAND,
  COMPANY_URL,
  DESCRIPTION,
  LEGAL_NAME,
  NMLS,
  NMLS_URL,
  SITE_URL,
  TITLE,
  TYPICALITY,
  averageScope,
  faqPlain,
  faqs,
  formatInt,
  formatRating,
  officeSentence,
  offices,
  platforms,
  stats,
  type Inline,
} from "../../data/site.ts";
import { infoPages, type Block, type InfoPage } from "../../data/pages.ts";
import { reviews, spotlight } from "../../data/reviews.ts";

function inline(nodes: Inline[]): string {
  return nodes
    .map((node) =>
      node.kind === "text" ? node.text : `[${node.text}](${node.href})`,
    )
    .join("");
}

function block(b: Block): string {
  if (b.kind === "h2") return `## ${b.text}`;
  if (b.kind === "p") return inline(b.nodes);
  return b.items.map((item) => `- ${inline(item)}`).join("\n");
}

const footer = [
  "---",
  "",
  `Operated by ${LEGAL_NAME}, NMLS #${NMLS} ([NMLS Consumer Access](${NMLS_URL})). Not a commitment to lend. Equal Housing Lender.`,
  "",
  `More: [Home](${SITE_URL}) · [About](${SITE_URL}about) · [Contact](${SITE_URL}contact) · [llms.txt](${SITE_URL}llms.txt) · [Full text](${SITE_URL}llms-full.txt) · [Sitemap](${SITE_URL}sitemap.xml)`,
].join("\n");

export function infoPageMarkdown(page: InfoPage): string {
  return [
    `# ${page.heading}`,
    "",
    `> ${page.lede}`,
    "",
    ...page.blocks.flatMap((b) => [block(b), ""]),
    footer,
    "",
  ].join("\n");
}

export function homeMarkdown(): string {
  const cell = (value: string) => value.replaceAll("|", "\\|");
  const rows = platforms.map(
    (p) =>
      `| [${p.name}](${p.href}) | ${p.rating == null ? (p.grade ?? "") : formatRating(p.rating)} | ${formatInt(p.count)} | ${cell(p.method)} |`,
  );
  const quote = (text: string) =>
    text
      .split("\n")
      .map((line) => `> ${line}`)
      .join("\n");
  const selected = [spotlight, ...reviews.filter((r) => r.id !== spotlight.id)];
  return [
    `# ${TITLE}`,
    "",
    `> ${DESCRIPTION}`,
    "",
    `**Weighted average: ${stats.shownText} out of 5** ${averageScope}. Last checked ${AS_OF} (${AS_OF_ISO}). Operated by ${BRAND}; not an independent review site.`,
    "",
    "## Ratings by platform",
    "",
    "| Platform | Rating | Reviews | How it was checked |",
    "|---|---|---|---|",
    ...rows,
    `| **Weighted average** | **${stats.shownText}** | **${formatInt(stats.ratedCount)}** | Sum of rating × count, divided by total count |`,
    "",
    "## Ratings by office",
    "",
    ...offices.map((o) => `- ${officeSentence(o)}`),
    "",
    "## Frequently asked questions",
    "",
    ...faqs.flatMap((faq) => [`### ${faq.question}`, "", faqPlain(faq), ""]),
    "## Selected Google reviews",
    "",
    `A selection, quoted as written. ${TYPICALITY}`,
    "",
    ...selected.flatMap((r) => [
      quote(r.quote),
      "",
      `${r.author}, ${r.date}, [original review](${r.url})`,
      "",
    ]),
    `For loan questions, start at [griffinfunding.com](${COMPANY_URL}).`,
    "",
    footer,
    "",
  ].join("\n");
}

export function notFoundMarkdown(path: string): string {
  return [
    "# 404: page not found",
    "",
    `There is no page at \`${path}\` on Griffin Funding Reviews.`,
    "",
    "Pages on this site:",
    "",
    `- [Griffin Funding reviews and ratings](${SITE_URL})`,
    ...infoPages.map(
      (page) => `- [${page.heading}](${SITE_URL}${page.path.slice(1)})`,
    ),
    "",
    `A plain-text summary is at [llms.txt](${SITE_URL}llms.txt), and every page is listed in the [sitemap](${SITE_URL}sitemap.xml).`,
    "",
  ].join("\n");
}

/** Markdown for a known path, or null when the path has no page. */
export function markdownForPath(path: string): string | null {
  const normalized = path.length > 1 ? path.replace(/\/+$/, "") : path;
  if (normalized === "/" || normalized === "") return homeMarkdown();
  const page = infoPages.find((p) => p.path === normalized);
  return page ? infoPageMarkdown(page) : null;
}
