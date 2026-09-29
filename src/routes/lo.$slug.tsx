import { createFileRoute, notFound } from "@tanstack/react-router";
import { officerBySlug, qualifyingOfficers } from "@/data/loan-officers";
import { reviews, spotlight } from "@/data/reviews";
import { OfficerPageView } from "@/components/officer-page";
import { SITE_URL } from "@/data/site";

const allReviews = [spotlight, ...reviews];

export const Route = createFileRoute("/lo/$slug")({
  loader: ({ params }) => {
    const officer = officerBySlug(params.slug);
    const qualifies =
      officer && qualifyingOfficers(allReviews).some((o) => o.id === officer.id);
    if (!qualifies) throw notFound();
    return officer!;
  },
  head: ({ loaderData: officer }) => {
    if (!officer) return {};
    const url = `${SITE_URL}lo/${officer.id}`;
    const title = `${officer.name}'s Griffin Funding Reviews`;
    const description = `${officer.name}, ${officer.title} at Griffin Funding: ${officer.experienceRating} out of 5 on Experience.com from ${officer.experienceCount} reviews, plus selected Google reviews that name them.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:type", content: "profile" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { name: "robots", content: "index, follow" },
      ],
      links: [
        { rel: "canonical", href: url },
        {
          rel: "alternate",
          href: `/lo/${officer.id}`,
          type: "text/markdown",
          title: "Markdown version",
        },
      ],
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <OfficerPageView officer={Route.useLoaderData()} />;
}
