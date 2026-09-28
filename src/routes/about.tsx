import { createFileRoute } from "@tanstack/react-router";
import { InfoPageView } from "@/components/info-page";
import { aboutPage } from "@/data/pages";
import { infoPageHead } from "@/lib/agent/page-head";

export const Route = createFileRoute("/about")({
  head: () => infoPageHead(aboutPage),
  component: () => <InfoPageView page={aboutPage} />,
});
