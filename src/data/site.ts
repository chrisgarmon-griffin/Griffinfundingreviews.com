import type { LoanType } from "./reviews";

export const TITLE = "Griffin Funding Reviews: Ratings From Every Platform";
export const SITE_URL = "https://griffinfundingreviews.com/";
export const COMPANY_URL = "https://griffinfunding.com";
export const NMLS_URL =
  "https://www.nmlsconsumeraccess.org/EntityDetails.aspx/COMPANY/1120111";
export const LEGAL_NAME = "Griffin Funding, Inc.";
export const BRAND = "Griffin Funding";
export const NMLS = "1120111";
export const VA_ID = "9088650000";
export const FHA_ID = "01472-0000-3";
export const AS_OF = "September 27, 2026";
export const AS_OF_ISO = "2026-09-27";
// State licensing disclosure (lists California DFPI and DRE licenses among others).
// California disclosure wording in the footer is pending compliance approval.
export const LICENSING_URL = "https://griffinfunding.com/state-licensing/";
// Google Knowledge Graph listing for Griffin Funding, Inc. (place /g/11bbx15fxh),
// used as the entity reference in structured data. No numeric CID is verified yet.
export const GOOGLE_ENTITY_URL = "https://www.google.com/search?kgmid=/g/11bbx15fxh";

export type Platform = {
  id: string;
  name: string;
  note?: string;
  href: string;
  count: number;
  rating: number | null;
  grade?: string;
  method: string;
};

export const platforms: Platform[] = [
  {
    id: "experience",
    name: "Experience.com",
    note: "Own reviews only",
    href: "https://www.experience.com/reviews/company/griffin-funding-1426",
    count: 1600,
    rating: 4.88,
    method: "Experience.com’s own reviews, not its blended score.",
  },
  {
    id: "google",
    name: "Google",
    href: "https://share.google/4dX5kM5F0ugL6UEVW",
    count: 991,
    rating: 4.8,
    method: "Live Google Knowledge Panel.",
  },
  {
    id: "wallethub",
    name: "WalletHub",
    href: "https://wallethub.com/profile/griffin-funding-75917774i",
    count: 757,
    rating: 4.6,
    method: "Direct read of the public profile.",
  },
  {
    id: "yelp",
    name: "Yelp",
    note: "San Diego",
    href: "https://www.yelp.com/biz/griffin-funding-san-diego",
    count: 185,
    rating: 4.6,
    method: "Manual check of the live page.",
  },
  {
    id: "zillow",
    name: "Zillow",
    href: "https://www.zillow.com/lender-profile/griffinfunding/",
    count: 103,
    rating: 4.9,
    method: "Google Knowledge Panel. Zillow blocks automated reads.",
  },
  {
    id: "bbb",
    name: "BBB",
    note: "A+ BBB rating",
    href: "https://www.bbb.org/us/ca/san-diego/profile/mortgage-lenders/griffin-funding-1126-172009171/customer-reviews",
    count: 60,
    rating: 4.85,
    grade: "A+",
    method: "Customer review average from the BBB customer reviews page (confirmed by Bill). A+ is BBB's separate letter rating.",
  },
  {
    id: "trustpilot",
    name: "Trustpilot",
    href: "https://www.trustpilot.com/review/griffinfunding.com",
    count: 37,
    rating: 4.7,
    method: "Manual check of the live page.",
  },
];

export const loanTypes: { id: LoanType; label: string }[] = [
  { id: "refinance", label: "Refinance" },
  { id: "self-employed", label: "Self-employed" },
  { id: "investment", label: "Investment property" },
  { id: "purchase", label: "Purchase" },
  { id: "dscr", label: "DSCR" },
  { id: "bank-statement", label: "Bank statement" },
  { id: "heloc", label: "HELOC" },
  { id: "va", label: "VA" },
];

export function formatInt(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function formatRating(n: number): string {
  const rounded = Math.round(n * 100) / 100;
  const text = rounded.toFixed(2);
  return text.endsWith("0") ? rounded.toFixed(1) : text;
}

export type Stats = {
  allRated: boolean;
  raw: number;
  shown: number;
  shownText: string;
  ratedCount: number;
  total: number;
  platformCount: number;
  maxCount: number;
};

function computeStats(): Stats {
  const rated = platforms.filter((p): p is Platform & { rating: number } => p.rating != null);
  const ratedCount = rated.reduce((sum, p) => sum + p.count, 0);
  const raw = rated.reduce((sum, p) => sum + p.rating * p.count, 0) / ratedCount;
  const shown = Math.round(raw * 10) / 10;
  return {
    allRated: rated.length === platforms.length,
    raw,
    shown,
    shownText: shown.toFixed(1),
    ratedCount,
    total: platforms.reduce((sum, p) => sum + p.count, 0),
    platformCount: platforms.length,
    maxCount: Math.max(...platforms.map((p) => p.count)),
  };
}

export const stats = computeStats();

function listNames(names: string[]): string {
  return names.length < 3 ? names.join(" and ") : `${names.slice(0, -1).join(", ")}, and ${names.at(-1)}`;
}

/** Platforms that publish a star rating, as a readable list. */
export const ratedNames = listNames(platforms.filter((p) => p.rating != null).map((p) => p.name));
const bbbEntry = platforms.find((p) => p.id === "bbb");
const unrated = platforms.filter((p) => p.rating == null);

/** One-sentence account of what the average covers, reused across the page. */
export const averageScope = stats.allRated
  ? `across ${formatInt(stats.ratedCount)} reviews on all ${stats.platformCount} platforms`
  : `across ${formatInt(stats.ratedCount)} rated reviews on ${ratedNames}`;

export const DESCRIPTION = stats.allRated
  ? `Griffin Funding reviews from ${stats.platformCount} platforms: ${stats.shownText} out of 5 across ${formatInt(stats.ratedCount)} reviews, each platform linked. Operated by Griffin Funding, NMLS #${NMLS}.`
  : `Griffin Funding reviews from ${stats.platformCount} platforms: ${stats.shownText} out of 5 across ${formatInt(stats.ratedCount)} rated reviews, ${formatInt(stats.total)} public reviews in total. Operated by Griffin Funding, NMLS #${NMLS}.`;

/** FTC Endorsement Guides: several quotes describe timelines, so state that results vary. */
export const TYPICALITY =
  "Individual experiences. Timelines, rates, and terms vary by borrower and loan program.";

export type Inline =
  | { kind: "text"; text: string }
  | { kind: "link"; text: string; href: string };

export type Faq = {
  id: string;
  question: string;
  paragraphs: Inline[][];
  links?: { href: string; label: string }[];
};

const text = (value: string): Inline => ({ kind: "text", text: value });
const link = (value: string, href: string): Inline => ({ kind: "link", text: value, href });

const bbb = platforms.find((p) => p.id === "bbb")!;

export const faqs: Faq[] = [
  {
    id: "q-legit",
    question: "Is Griffin Funding legit?",
    paragraphs: [
      [
        text(
          `${BRAND} is a licensed mortgage lender. Its NMLS Unique Identifier is ${NMLS}. Confirm the license on `,
        ),
        link("NMLS Consumer Access", NMLS_URL),
        text("."),
      ],
      [
        text(
          `As of ${AS_OF}, ${BRAND} has ${formatInt(stats.total)} public reviews across ${stats.platformCount} platforms. The weighted average is ${stats.shownText} out of 5, ${averageScope}.`,
        ),
      ],
      [text("This site is operated by Griffin Funding. It is not an independent review site.")],
    ],
  },
  {
    id: "q-rating",
    question: "What is Griffin Funding’s overall rating?",
    paragraphs: [
      [
        text(
          `${stats.shownText} out of 5, as of ${AS_OF}. That is the average of ${listNames(
            platforms
              .filter((p) => p.rating != null)
              .map((p) => `${p.name} (${formatRating(p.rating!)} from ${formatInt(p.count)})`),
          )}, weighted by each platform’s review count.`,
        ),
      ],
      [
        text(
          unrated.length
            ? `${listNames(unrated.map((p) => p.name))} ${unrated.length > 1 ? "are" : "is"} not part of the average because ${unrated.length > 1 ? "they do" : "it does"} not publish a star rating.`
            : bbbEntry?.grade
              ? `BBB also gives ${BRAND} an ${bbbEntry.grade} rating. That letter rating is separate from BBB’s ${formatRating(bbbEntry.rating!)} customer review average.`
              : "",
        ),
      ],
    ],
  },
  {
    id: "q-lender",
    question: "Is Griffin Funding a mortgage broker or a lender?",
    paragraphs: [
      [
        text(
          `${LEGAL_NAME} is a licensed mortgage lender, NMLS #${NMLS}. It is a VA Approved Lender, ID ${VA_ID}, and an FHA Non-Supervised Lender, No. ${FHA_ID}.`,
        ),
      ],
    ],
  },
  {
    id: "q-experience",
    question: "Why not use Experience.com’s 4.81 rating from 3,073 reviews?",
    paragraphs: [
      [
        text(
          "Experience.com’s 4.81 from 3,073 reviews blends reviews that also appear on Google, Zillow, and Facebook. Using it would count those reviews twice.",
        ),
      ],
      [text("This page uses Experience.com’s own rating: 4.88 from 1,600 reviews.")],
    ],
  },
  {
    id: "q-average",
    question: "How is the average calculated?",
    paragraphs: [
      [
        text(
          "The weighted average is the sum of each platform’s star rating multiplied by its review count, divided by the number of those reviews. Only platforms that publish both a star rating and a review count are included. The result is shown to one decimal place.",
        ),
      ],
      [
        text(
          stats.allRated
            ? `All ${stats.platformCount} platforms publish a star rating and a review count, so all ${formatInt(stats.ratedCount)} reviews are in the average.`
            : `${listNames(unrated.map((p) => p.name))} ${unrated.length > 1 ? "are" : "is"} left out because ${unrated.length > 1 ? "they publish" : "it publishes"} no star rating.`,
        ),
      ],
    ],
  },
  {
    id: "q-every-review",
    question: "Where can I read every Griffin Funding review, including negative ones?",
    paragraphs: [
      [
        text(
          "The quotes on this page are a selection. Each platform profile lists every review it has, including lower ratings.",
        ),
      ],
    ],
    links: platforms.map((p) => ({ href: p.href, label: p.name })),
  },
  {
    id: "q-complaints",
    question: "Does Griffin Funding have complaints?",
    paragraphs: [
      [
        text("Complaints filed with the Better Business Bureau are public on "),
        link("Griffin Funding’s BBB profile", bbb.href.replace(/\/customer-reviews$/, "")),
        text("."),
      ],
      [
        text(
          "Lower-rated reviews stay visible on every profile linked from this page. They are included in the ratings and the counts.",
        ),
      ],
    ],
  },
  {
    id: "q-operator",
    question: "Who runs this site?",
    paragraphs: [
      [
        text(
          "Griffin Funding operates griffinfundingreviews.com. The ratings and counts cover the reviews each platform has published.",
        ),
      ],
      [
        text(
          "The quotes are selected real reviews, each linked to its original post. The wording is not rewritten. Names are shortened to a first name and last initial, or kept as initials when that is how the reviewer posted. Dates show the month and year.",
        ),
      ],
      [text(TYPICALITY)],
    ],
  },
  {
    id: "q-current",
    question: "How current are these numbers?",
    paragraphs: [
      [
        text(
          `Ratings and counts were last checked on ${AS_OF}. Live totals change when new reviews are posted. The check date is printed on this page.`,
        ),
      ],
    ],
  },
];

export function inlinePlain(nodes: Inline[]): string {
  return nodes
    .map((node) => (node.kind === "text" ? node.text : `${node.text} (${node.href})`))
    .join("");
}

export function faqPlain(faq: Faq): string {
  const parts = faq.paragraphs.map((p) => inlinePlain(p));
  if (faq.links?.length) {
    parts.push(faq.links.map((item) => `${item.label}: ${item.href}`).join(" "));
  }
  return parts.join(" ");
}

export function jsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FinancialService",
        "@id": `${SITE_URL}#organization`,
        name: BRAND,
        legalName: LEGAL_NAME,
        url: COMPANY_URL,
        identifier: {
          "@type": "PropertyValue",
          propertyID: "NMLS",
          value: NMLS,
        },
        additionalProperty: [
          { "@type": "PropertyValue", name: "VA Approved Lender ID", value: VA_ID },
          { "@type": "PropertyValue", name: "FHA Non-Supervised Lender No.", value: FHA_ID },
        ],
        sameAs: [COMPANY_URL, GOOGLE_ENTITY_URL, ...platforms.map((p) => p.href)],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}#website`,
        url: SITE_URL,
        name: "Griffin Funding Reviews",
        publisher: { "@id": `${SITE_URL}#organization` },
        inLanguage: "en-US",
      },
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}#webpage`,
        url: SITE_URL,
        name: TITLE,
        description: DESCRIPTION,
        isPartOf: { "@id": `${SITE_URL}#website` },
        about: { "@id": `${SITE_URL}#organization` },
        publisher: { "@id": `${SITE_URL}#organization` },
        dateModified: AS_OF_ISO,
        inLanguage: "en-US",
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: ["#citable", "#scorecard", "#faq"],
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}#faq`,
        url: `${SITE_URL}#faq`,
        isPartOf: { "@id": `${SITE_URL}#webpage` },
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faqPlain(faq),
          },
        })),
      },
    ],
  };
}
