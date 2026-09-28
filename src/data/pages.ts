import {
  AS_OF,
  BRAND,
  CA_DFPI_CFL,
  CA_DRE,
  COMPANY_URL,
  FHA_ID,
  LEGAL_NAME,
  LICENSING_URL,
  NMLS,
  NMLS_URL,
  PHONE_DISPLAY,
  PHONE_TEL,
  SITE_URL,
  TYPICALITY,
  VA_ID,
  formatInt,
  offices,
  platforms,
  stats,
  type Inline,
} from "./site.ts";

/**
 * Content for the secondary pages. One source feeds both the HTML route and the
 * Markdown response agents get with `Accept: text/markdown`, so they cannot drift.
 * Every fact here already appears on the home page or in site.ts.
 */
export type Block =
  | { kind: "h2"; text: string }
  | { kind: "p"; nodes: Inline[] }
  | { kind: "list"; items: Inline[][] };

export type InfoPage = {
  id: "about" | "contact" | "privacy";
  path: string;
  title: string;
  heading: string;
  description: string;
  lede: string;
  schemaType: "AboutPage" | "ContactPage" | "WebPage";
  blocks: Block[];
};

const t = (text: string): Inline => ({ kind: "text", text });
const a = (text: string, href: string): Inline => ({
  kind: "link",
  text: text,
  href,
});
const p = (...nodes: Inline[]): Block => ({ kind: "p", nodes });
const h2 = (text: string): Block => ({ kind: "h2", text });
const list = (items: Inline[][]): Block => ({ kind: "list", items });

const platformList = platforms.map((platform) => platform.name).join(", ");

export const aboutPage: InfoPage = {
  id: "about",
  path: "/about",
  title: "About This Site",
  heading: "About Griffin Funding Reviews",
  description: `Who runs griffinfundingreviews.com, where its ratings come from, and how the Griffin Funding reviews on it are selected.`,
  lede: `Griffin Funding Reviews puts Griffin Funding's public ratings from ${stats.platformCount} review platforms on one page, with every rating linked to its source.`,
  schemaType: "AboutPage",
  blocks: [
    h2("Who runs this site"),
    p(
      t(
        `${BRAND} operates griffinfundingreviews.com. It is not an independent review site. ${LEGAL_NAME} is a licensed mortgage lender, NMLS #${NMLS}. The license can be confirmed on `,
      ),
      a("NMLS Consumer Access", NMLS_URL),
      t("."),
    ),
    h2("What is on the site"),
    list([
      [
        t(
          `Star ratings and review counts from ${platformList}, with a weighted average of ${stats.shownText} out of 5 across ${formatInt(stats.ratedCount)} reviews.`,
        ),
      ],
      [t(`Google and Yelp ratings for each ${BRAND} office, with addresses.`)],
      [
        t(
          "A selection of Google reviews, quoted as written and linked to the original post.",
        ),
      ],
      [
        t(
          "Answers to common questions about Griffin Funding's reviews and licensing.",
        ),
      ],
    ]),
    h2("Where the figures come from"),
    p(
      t(
        "Each rating and review count is read from the platform's own public profile. The weighted average is the sum of each rating multiplied by its review count, divided by the total number of reviews. Experience.com is counted as its own reviews only, because its blended score repeats reviews from Google, Zillow, and Facebook.",
      ),
    ),
    p(
      t(
        `Figures were last checked on ${AS_OF}. The check date is printed on every page.`,
      ),
    ),
    h2("How reviews are selected"),
    p(
      t(
        "The quotes are a selection of real Google reviews. The wording is not rewritten. Names are shortened to a first name and last initial, or kept as initials when that is how the reviewer posted. Client street addresses, phone numbers, emails, loan numbers, and signatures are removed. Every platform profile linked from the site shows all of its reviews, including lower ratings.",
      ),
    ),
    p(t(TYPICALITY)),
    h2("What this site is not"),
    p(
      t(
        "This site is not a rate quote, a loan application, or a commitment to lend. All loans are subject to credit approval and underwriting. For loan questions, start at ",
      ),
      a("griffinfunding.com", COMPANY_URL),
      t("."),
    ),
    h2("Licensing"),
    list([
      [t(`${LEGAL_NAME}, NMLS #${NMLS}`)],
      [t(`VA Approved Lender ID ${VA_ID}`)],
      [t(`FHA Non-Supervised Lender No. ${FHA_ID}`)],
      [
        t(
          `California: Licensed by the Department of Financial Protection and Innovation under the California Financing Law, License No. ${CA_DFPI_CFL}. Real Estate Broker, California Department of Real Estate, DRE License #${CA_DRE}, NMLS #${NMLS}. Loans made or arranged pursuant to a California Department of Real Estate license.`,
        ),
      ],
      [
        t("Other states: "),
        a("Griffin Funding's state licenses", LICENSING_URL),
      ],
      [t("Equal Housing Lender")],
    ]),
  ],
};

export const contactPage: InfoPage = {
  id: "contact",
  path: "/contact",
  title: "Contact Griffin Funding",
  heading: "Contact Griffin Funding",
  description: `Office addresses for Griffin Funding in San Diego, Scottsdale, Irvine, and Incline Village, and where to verify its license.`,
  lede: `Griffin Funding Reviews is operated by ${LEGAL_NAME}, a licensed mortgage lender. The site has no contact form and does not take loan applications. For loan questions, call ${BRAND} at ${PHONE_DISPLAY} or visit griffinfunding.com.`,
  schemaType: "ContactPage",
  blocks: [
    h2("Call or visit online"),
    list([
      [t("Phone: "), a(PHONE_DISPLAY, PHONE_TEL)],
      [t("Company website: "), a("griffinfunding.com", COMPANY_URL)],
    ]),
    h2("Offices"),
    list(
      offices.map((office) => {
        const note =
          office.area ??
          (office.label === "Headquarters" ? "headquarters" : office.label);
        return [
          t(
            `${office.city}, ${office.state}${note ? ` (${note})` : ""}: ${office.street}, ${office.city}, ${office.state} ${office.postalCode}`,
          ),
        ];
      }),
    ),
    h2("Verify the license"),
    p(
      t(`${LEGAL_NAME} is NMLS #${NMLS}. Confirm it on `),
      a("NMLS Consumer Access", NMLS_URL),
      t(", and see "),
      a("Griffin Funding's state licenses", LICENSING_URL),
      t(" for each state."),
    ),
    h2("Read or leave a review"),
    p(
      t(
        "Each platform profile lists every review it has, including lower ratings:",
      ),
    ),
    list(platforms.map((platform) => [a(platform.name, platform.href)])),
    h2("About this site"),
    p(
      t("Ratings and counts were last checked on "),
      t(`${AS_OF}. How the figures are gathered is explained on the `),
      a("about page", `${SITE_URL}about`),
      t("."),
    ),
  ],
};

// DRAFT for compliance review (branch privacy-page-draft). Do not merge to main
// until compliance approves the wording and fills in the bracketed items.
export const PRIVACY_EFFECTIVE = "[Effective date: set on approval]";
export const COMPANY_PRIVACY_URL =
  "[Griffin Funding privacy policy URL: compliance to supply]";

export const privacyPage: InfoPage = {
  id: "privacy",
  path: "/privacy",
  title: "Privacy Notice",
  heading: "Privacy notice for Griffin Funding Reviews",
  description:
    "What griffinfundingreviews.com collects, what it does not collect, and the outside services it uses.",
  lede: `This notice covers griffinfundingreviews.com only. The site has no forms, accounts, or loan applications, and it does not ask for personal information. ${PRIVACY_EFFECTIVE}.`,
  schemaType: "WebPage",
  blocks: [
    h2("Who operates this site"),
    p(
      t(
        `${LEGAL_NAME} (NMLS #${NMLS}) operates griffinfundingreviews.com. Questions about this notice can go to ${BRAND} at `,
      ),
      a(PHONE_DISPLAY, PHONE_TEL),
      t("."),
    ),
    h2("What this site does not collect"),
    list([
      [
        t(
          "No names, email addresses, phone numbers, Social Security numbers, or financial information.",
        ),
      ],
      [
        t(
          "No loan applications, quote requests, or account sign-ups. There are no forms on this site.",
        ),
      ],
      [
        t(
          "No cookies are set by this site, and nothing is saved in your browser's storage.",
        ),
      ],
      [
        t(
          "The review search box and loan-type filters run in your browser. What you type is not sent to us.",
        ),
      ],
    ]),
    h2("Visit and click measurement"),
    p(
      t(
        "This site uses Vercel Web Analytics to count page views and two kinds of clicks: taps on the Call button and clicks on Start your application. Each click is recorded with where on the page it happened, such as the header or the home page. Vercel states that Web Analytics uses no cookies and records visits anonymously. Instead of a cookie, it groups a visit using a code generated from the request that resets every 24 hours, so visitors cannot be followed from day to day or across other websites. It also records general details such as the page visited, the referring site, country, browser, operating system, and device type. See ",
      ),
      a(
        "Vercel's Web Analytics privacy page",
        "https://vercel.com/docs/analytics/privacy-policy",
      ),
      t("."),
    ),
    h2("Hosting and security logs"),
    p(
      t(
        "The site is hosted by Vercel. Like most web hosts, Vercel receives technical information with each request, such as your IP address, browser type, and the time of the request, to deliver the page and protect the site. See ",
      ),
      a("Vercel's privacy notice", "https://vercel.com/legal/privacy-notice"),
      t("."),
    ),
    h2("Fonts"),
    p(
      t(
        "The site's fonts load from Google Fonts. Your browser requests them from Google, which receives your IP address and browser details as part of that request. See ",
      ),
      a("Google's privacy policy", "https://policies.google.com/privacy"),
      t("."),
    ),
    h2("Links to other sites"),
    p(
      t(
        "Ratings and quotes link to the review platforms where they were posted, such as Google, Yelp, Zillow, BBB, WalletHub, Trustpilot, and Experience.com. Start your application opens a form on griffinfunding.com. Those sites have their own privacy policies, which apply once you leave this site. Information you submit on griffinfunding.com is covered by ",
      ),
      a("Griffin Funding's privacy policy", COMPANY_PRIVACY_URL),
      t("."),
    ),
    h2("Phone calls"),
    p(
      t(
        `Tapping Call opens your phone's dialer with ${PHONE_DISPLAY}. This site does not record the call. If you call, the conversation is with ${BRAND} and is covered by `,
      ),
      a("Griffin Funding's privacy policy", COMPANY_PRIVACY_URL),
      t("."),
    ),
    h2("Children"),
    p(
      t(
        "This site is not directed to children under 13 and does not knowingly collect information from them.",
      ),
    ),
    h2("Changes to this notice"),
    p(
      t(
        "If this site's practices change, this notice will be updated and the effective date above will change.",
      ),
    ),
  ],
};

export const infoPages = [aboutPage, contactPage, privacyPage];
