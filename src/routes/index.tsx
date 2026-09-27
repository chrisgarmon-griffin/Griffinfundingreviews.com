import { createFileRoute } from "@tanstack/react-router";
import { Page } from "@/components/page";
import { DESCRIPTION, SITE_URL, TITLE, jsonLd } from "@/data/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { name: "author", content: "Griffin Funding" },
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
