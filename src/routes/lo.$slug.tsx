import { createFileRoute, notFound } from "@tanstack/react-router";
import {
  officerBySlug,
  qualifyingOfficers,
  teamProfileUrl,
} from "@/data/loan-officers";
import { reviews, spotlight } from "@/data/reviews";
import { OfficerPageView } from "@/components/officer-page";
import { COMPANY_URL, SITE_URL } from "@/data/site";

const allReviews = [spotlight, ...reviews];

export const Route = createFileRoute("/lo/$slug")({
  loader: ({ params }) => {
    const officer = officerBySlug(params.slug);
    const qualifies =
      officer &&
      qualifyingOfficers(allReviews).some((o) => o.id === officer.id);
    if (!qualifies) throw notFound();
    return officer!;
  },
  head: ({ loaderData: officer }) => {
    if (!officer) return {};
    const url = `${SITE_URL}lo/${officer.id}`;
    const title = `${officer.name}'s Griffin Funding Reviews`;
    const description = `${officer.name}, ${officer.title} at Griffin Funding: ${officer.experienceRating} out of 5 on Experience.com from ${officer.experienceCount} reviews, plus selected Google reviews that name them.`;
    // Ties this reviews page to the officer's team-page profile so search and
    // answer engines treat both as the same person.
    const profile = {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      url,
      name: title,
      mainEntity: {
        "@type": "Person",
        name: officer.name,
        jobTitle: officer.title,
        url: teamProfileUrl(officer),
        sameAs: [teamProfileUrl(officer)],
        worksFor: {
          "@type": "Organization",
          name: "Griffin Funding",
          url: COMPANY_URL,
        },
      },
    };
    return {
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(profile).replaceAll("<", "\\u003c"),
        },
      ],
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
