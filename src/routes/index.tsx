import { createFileRoute } from "@tanstack/react-router";
import { Page } from "@/components/page";
import { DESCRIPTION, SITE_URL, TITLE, jsonLd } from "@/data/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { name: "author", content: "Griffin Funding" },
      // Full share-card set. The head injector keeps page-supplied share tags
      // when og:description is present (see injectGrokPwaHead).
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Griffin Funding Reviews" },
      { property: "og:url", content: SITE_URL },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:image", content: `${SITE_URL}og.jpg` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Griffin Funding Reviews: the Griffin Funding winged mark with the words Griffin Funding Reviews" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: `${SITE_URL}og.jpg` },
      {
        name: "robots",
        content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      },
    ],
    links: [
      { rel: "canonical", href: SITE_URL },
      {
        rel: "alternate",
        href: "/llms.txt",
        type: "text/plain",
        title: "Plain-text summary for answer engines",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(jsonLd()).replaceAll("<", "\\u003c"),
      },
    ],
  }),
  component: Page,
});
