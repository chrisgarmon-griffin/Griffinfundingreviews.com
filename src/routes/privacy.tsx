import { createFileRoute } from "@tanstack/react-router";
import { InfoPageView } from "@/components/info-page";
import { privacyPage } from "@/data/pages";
import { infoPageHead } from "@/lib/agent/page-head";

export const Route = createFileRoute("/privacy")({
  head: () => infoPageHead(privacyPage),
  component: () => <InfoPageView page={privacyPage} />,
});
