import type { InfoPage } from "../../data/pages.ts";
import { SITE_URL } from "../../data/site.ts";

/** Head tags and JSON-LD for a secondary page. */
export function infoPageHead(page: InfoPage) {
  const url = `${SITE_URL}${page.path.slice(1)}`;
  const title = `${page.title} | Griffin Funding Reviews`;
  const ld = {
    "@context": "https://schema.org",
    "@type": page.schemaType,
    "@id": `${url}#webpage`,
    url,
    name: page.title,
    description: page.description,
    isPartOf: { "@id": `${SITE_URL}#website` },
    about: { "@id": `${SITE_URL}#organization` },
    publisher: { "@id": `${SITE_URL}#organization` },
    inLanguage: "en-US",
  };
  return {
    meta: [
      { title },
      { name: "description", content: page.description },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Griffin Funding Reviews" },
      { property: "og:url", content: url },
      { property: "og:title", content: title },
      { property: "og:description", content: page.description },
      { property: "og:image", content: `${SITE_URL}og.jpg` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "index, follow" },
    ],
    links: [
      { rel: "canonical", href: url },
      {
        rel: "alternate",
        href: page.path,
        type: "text/markdown",
        title: "Markdown version",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(ld).replaceAll("<", "\\u003c"),
      },
    ],
  };
}
