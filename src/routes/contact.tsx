import { createFileRoute } from "@tanstack/react-router";
import { InfoPageView } from "@/components/info-page";
import { contactPage } from "@/data/pages";
import { infoPageHead } from "@/lib/agent/page-head";

export const Route = createFileRoute("/contact")({
  head: () => infoPageHead(contactPage),
  component: () => <InfoPageView page={contactPage} />,
});
