/**
 * Conversion events for Vercel Web Analytics (cookieless), sent through the
 * official @vercel/analytics package. <Analytics /> in __root.tsx loads the script;
 * events show in the Vercel dashboard under Analytics → Events.
 */
import { track as vercelTrack } from "@vercel/analytics";

type EventData = Record<string, string | number | boolean | null>;

export function track(name: string, data?: EventData): void {
  if (typeof window === "undefined") return;
  try {
    vercelTrack(name, data);
  } catch {
    // Analytics must never break a click.
  }
}
