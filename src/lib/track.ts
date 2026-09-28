/**
 * Conversion events for Vercel Web Analytics (cookieless). The loader in
 * __root.tsx defines window.va as a queue, so calls before the script loads are kept.
 * Custom events show in the Vercel dashboard once Web Analytics is enabled.
 */
type EventData = Record<string, string | number | boolean | null>;

declare global {
  interface Window {
    va?: (event: "event", payload: { name: string; data?: EventData }) => void;
  }
}

export function track(name: string, data?: EventData): void {
  if (typeof window === "undefined") return;
  try {
    window.va?.("event", { name, data });
  } catch {
    // Analytics must never break a click.
  }
}
