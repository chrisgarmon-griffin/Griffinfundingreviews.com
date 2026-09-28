/**
 * Loan officer roster, cross-referenced against Experience.com's own professional
 * listing for Griffin Funding (https://www.experience.com/reviews/company/griffin-funding-1426),
 * checked 2026-09-28. Ratings and counts drift daily on Experience.com; refresh them the
 * same way platform figures are refreshed (see docs/PROJECT.md Section 11.1 and 16.8).
 *
 * `experienceUrl` always points at the company page, never a guessed per-LO profile URL:
 * individual Experience.com profile links were not verified when this roster was built.
 *
 * `aliases` lists how a name appears in a curated Google quote when it differs from the
 * name here (first name only, or a misspelling). Used to tag reviews.ts by hand; never
 * used to auto-tag without human confirmation.
 */
export type LoanOfficer = {
  id: string;
  name: string;
  title: string;
  experienceUrl: string;
  experienceRating: number;
  experienceCount: number;
  checked: string;
  aliases: string[];
};

const EXPERIENCE_URL =
  "https://www.experience.com/reviews/company/griffin-funding-1426";
const CHECKED = "2026-09-28";

export const loanOfficers: LoanOfficer[] = [
  { id: "cody-unger", name: "Cody Unger", title: "Branch Manager, AZ", experienceUrl: EXPERIENCE_URL, experienceRating: 4.92, experienceCount: 131, checked: CHECKED, aliases: [] },
  { id: "sarah-howell", name: "Sarah Howell", title: "Loan Officer", experienceUrl: EXPERIENCE_URL, experienceRating: 4.83, experienceCount: 259, checked: CHECKED, aliases: ["Sarah"] },
  { id: "guy-troxler", name: "Guy Troxler", title: "Senior Loan Officer", experienceUrl: EXPERIENCE_URL, experienceRating: 4.82, experienceCount: 138, checked: CHECKED, aliases: ["Guy"] },
  { id: "joshua-miller", name: "Joshua Miller", title: "Loan Officer", experienceUrl: EXPERIENCE_URL, experienceRating: 4.9, experienceCount: 64, checked: CHECKED, aliases: [] },
  { id: "kristi-manion", name: "Kristi Manion", title: "Senior Loan Officer", experienceUrl: EXPERIENCE_URL, experienceRating: 4.94, experienceCount: 100, checked: CHECKED, aliases: [] },
  { id: "joe-yaeger", name: "Joe Yaeger", title: "Loan Officer", experienceUrl: EXPERIENCE_URL, experienceRating: 4.93, experienceCount: 220, checked: CHECKED, aliases: ["Joe"] },
  { id: "colby-freer", name: "Colby Freer", title: "Senior Loan Consultant", experienceUrl: EXPERIENCE_URL, experienceRating: 4.83, experienceCount: 192, checked: CHECKED, aliases: [] },
  { id: "jack-iwamoto", name: "Jack Iwamoto", title: "Loan Officer", experienceUrl: EXPERIENCE_URL, experienceRating: 4.95, experienceCount: 47, checked: CHECKED, aliases: ["Jack"] },
  { id: "malcolm-cameron", name: "Malcolm Cameron", title: "Loan Officer", experienceUrl: EXPERIENCE_URL, experienceRating: 4.71, experienceCount: 42, checked: CHECKED, aliases: [] },
  { id: "malik-abiola", name: "Malik Abiola", title: "Mortgage Loan Officer", experienceUrl: EXPERIENCE_URL, experienceRating: 4.92, experienceCount: 37, checked: CHECKED, aliases: [] },
  { id: "denise-tran", name: "Denise Tran", title: "Loan Officer", experienceUrl: EXPERIENCE_URL, experienceRating: 4.98, experienceCount: 34, checked: CHECKED, aliases: [] },
  { id: "andre-shmoldas", name: "Andre Shmoldas", title: "Producing Sales Manager", experienceUrl: EXPERIENCE_URL, experienceRating: 4.93, experienceCount: 26, checked: CHECKED, aliases: ["Andre Schmoldas"] },
  { id: "ryne-sweeney", name: "Ryne Sweeney", title: "Loan Officer", experienceUrl: EXPERIENCE_URL, experienceRating: 4.67, experienceCount: 25, checked: CHECKED, aliases: [] },
  { id: "justin-guthrie", name: "Justin Guthrie", title: "Loan Officer", experienceUrl: EXPERIENCE_URL, experienceRating: 4.94, experienceCount: 19, checked: CHECKED, aliases: ["Justin"] },
  { id: "steve-pintar", name: "Steve Pintar", title: "Loan Officer", experienceUrl: EXPERIENCE_URL, experienceRating: 5.0, experienceCount: 15, checked: CHECKED, aliases: [] },
  { id: "meagan-scheiwe", name: "Meagan Scheiwe", title: "Loan Officer", experienceUrl: EXPERIENCE_URL, experienceRating: 4.92, experienceCount: 12, checked: CHECKED, aliases: ["Megan"] },
  { id: "kc-dirksen", name: "KC Dirksen", title: "Loan Officer", experienceUrl: EXPERIENCE_URL, experienceRating: 4.98, experienceCount: 11, checked: CHECKED, aliases: [] },
  { id: "kent-garner", name: "Kent Garner", title: "Senior Loan Officer", experienceUrl: EXPERIENCE_URL, experienceRating: 4.95, experienceCount: 11, checked: CHECKED, aliases: [] },
  { id: "matt-mccarthy", name: "Matt McCarthy", title: "Loan Officer", experienceUrl: EXPERIENCE_URL, experienceRating: 4.13, experienceCount: 5, checked: CHECKED, aliases: [] },
  { id: "mallorie-faust", name: "Mallorie Faust", title: "Loan Officer", experienceUrl: EXPERIENCE_URL, experienceRating: 5.0, experienceCount: 13, checked: CHECKED, aliases: [] },
  { id: "adam-ruvelson", name: "Adam Ruvelson", title: "Senior Loan Officer", experienceUrl: EXPERIENCE_URL, experienceRating: 4.99, experienceCount: 16, checked: CHECKED, aliases: [] },
  { id: "trey-bedard", name: "Trey Bedard", title: "Loan Officer", experienceUrl: EXPERIENCE_URL, experienceRating: 4.95, experienceCount: 10, checked: CHECKED, aliases: ["Trey"] },
  { id: "jeffrey-elizalde", name: "Jeffrey Elizalde", title: "Loan Officer", experienceUrl: EXPERIENCE_URL, experienceRating: 4.83, experienceCount: 7, checked: CHECKED, aliases: [] },
  { id: "valerie-zatarain", name: "Valerie Zatarain", title: "Loan Officer", experienceUrl: EXPERIENCE_URL, experienceRating: 5.0, experienceCount: 11, checked: CHECKED, aliases: ["Valerie"] },
  { id: "micah-morgan", name: "Micah Morgan", title: "Loan Officer", experienceUrl: EXPERIENCE_URL, experienceRating: 5.0, experienceCount: 3, checked: CHECKED, aliases: [] },
  { id: "gabriel-salazar", name: "Gabriel Salazar", title: "Loan Officer", experienceUrl: EXPERIENCE_URL, experienceRating: 5.0, experienceCount: 6, checked: CHECKED, aliases: ["Gabe"] },
  { id: "pj-vinal", name: "PJ Vinal", title: "Loan Officer", experienceUrl: EXPERIENCE_URL, experienceRating: 4.97, experienceCount: 5, checked: CHECKED, aliases: ["PJ"] },
  { id: "michael-sluja", name: "Michael Sluja", title: "Loan Officer", experienceUrl: EXPERIENCE_URL, experienceRating: 5.0, experienceCount: 2, checked: CHECKED, aliases: [] },
  { id: "morgan-lyons", name: "Morgan Lyons", title: "Mortgage Loan Originator", experienceUrl: EXPERIENCE_URL, experienceRating: 5.0, experienceCount: 2, checked: CHECKED, aliases: [] },
];

export function officerBySlug(slug: string): LoanOfficer | undefined {
  return loanOfficers.find((o) => o.id === slug);
}

/**
 * docs/PROJECT.md Section 16.4: an officer qualifies for a pill and a page if they have
 * a tagged quote or a positive Experience.com count. `taggedReviews` is the review list
 * (each with an optional `officers` array); passed in rather than imported, so this file
 * never has to import reviews.ts just to answer "does this one officer qualify."
 */
export function qualifyingOfficers(
  taggedReviews: { officers?: string[] }[],
): LoanOfficer[] {
  const tagged = new Set(taggedReviews.flatMap((r) => r.officers ?? []));
  return loanOfficers.filter((o) => o.experienceCount > 0 || tagged.has(o.id));
}
