# griffinfundingreviews.com: Project Brief

> **Stack update (September 27, 2026):** the site now runs as a TanStack Start app deployed to Vercel (see `README.md`). Goals, data, curation, privacy, and compliance sections below still apply. Sections 9 to 11 describe the original static build, which is preserved at commit `4f8483b`.

| | |
|---|---|
| **Owner** | Chris Garmon, Mortgage Project Manager, Griffin Funding |
| **Sponsor** | Bill (requested the site; bought the domain) |
| **Repo** | `chrisgarmon-griffin/griffinfundingreviews.com` (branch `main`) |
| **Live URL** | `https://griffinfundingreviews.com` (pending DNS) |
| **Status** | Built and tested. Waiting on compliance sign-off, Netlify deploy, and DNS. |
| **Figures as of** | September 27, 2026 |

---

## 1. What this is

One static web page, on its own exact-match domain, that collects Griffin Funding's ratings from every public review platform. It adds a curated set of real customer reviews and a short FAQ.

The page has two jobs:

1. **Rank for the search "Griffin Funding reviews"** and close variants ("Griffin Funding complaints," "Is Griffin Funding legit").
2. **Get quoted by AI answer engines.** ChatGPT, Perplexity, Claude, Gemini, Grok, and Google AI Overviews all answer questions like "Is Griffin Funding a good lender?" The page gives them one clean, citable source.

It is marketing and reputation infrastructure. It is not a lead-capture page, a rate page, or an application.

---

## 2. Why it exists

### 2.1 Origin

Bill sent an email asking for a site that brings Griffin's reviews together in one place. The idea came from a video describing a specific tactic: a business puts its best existing reviews from every platform on one page, on a dedicated domain, and that page starts ranking quickly for "[brand] reviews."

Bill's email said "aggregate via API." The source video's method was static: collect the good reviews that already exist, publish them once, and let the page rank. We chose **static now, API-backed refresh later**. The data files are separate from the page template, so an automated refresh can replace manual updates later without a redesign.

### 2.2 Why a separate domain

griffinfunding.com already has `/reviews/` and `/testimonials/` pages. That doesn't conflict with this site. It's the point of the tactic:

- An exact-match domain (`griffinfundingreviews.com`) competes on its own for the "[brand] reviews" query instead of being one subpage of a large site.
- AI tools treat it as a distinct source focused on one topic, which makes it easier to cite.
- It gives Griffin a second result it controls on page one for its own brand plus "reviews," next to the third-party profiles.

### 2.3 The evidence that this matters

One of the featured Google reviews (Luke F., March 2026) says: *"I was searching on Grok and Griffin Funding came up."* A borrower found Griffin through an AI chatbot, closed a bank statement loan, and wrote about it. That's the behavior this site is built for, so it's the page's pull quote.

### 2.4 Where this sits against the governing goals

Honest framing: this project does not directly move the two governing numbers (5x quality-adjusted LO productivity and the 14-day close standard). It's brand and discovery work. It earns its place because:

- It was a direct ask from Bill.
- It was scoped to one page and built fast.
- Borrowers who arrive already trusting Griffin may need less reassurance from LOs, but that effect is unmeasured and shouldn't be claimed.

Keep it at one page. Don't let it grow into a content program that competes with the lock-to-STP constraint work.

---

## 3. Goals and how to measure them

| # | Goal | How to measure | Where |
|---|---|---|---|
| G1 | Rank on page one for "Griffin Funding reviews" | Average position and impressions for the query | Google Search Console, after the domain is verified |
| G2 | Get cited by AI answer engines | Ask each major engine "Is Griffin Funding legit?" and "Griffin Funding reviews" monthly; record whether the site is cited | Manual check log, or HubSpot AEO tools if configured |
| G3 | Give a trustworthy, current summary | Every platform figure has a check date and method; none older than 90 days | `data/platforms.json` |
| G4 | Stay compliant | Compliance sign-off recorded before launch and after every quote change | Section 9 |
| G5 | Send qualified traffic to griffinfunding.com | Referral sessions from griffinfundingreviews.com | griffinfunding.com analytics |

No baseline exists yet for any of these. Record the first readings in the week after launch, and don't report results before then.

---

## 4. Scope

### In scope (v1)

- One page: hero, rating summary, platform list, pull quote, curated reviews with loan-type filters, FAQ, and a footer with license disclosures.
- Machine-readable companions: `llms.txt`, `robots.txt`, `sitemap.xml`, and structured data (JSON-LD).
- A 404 page, share image, favicon, and phone home-screen icon.
- A Google review CSV importer and a check for client personal details.

### Out of scope (v1)

- Live API pulls from review platforms (phase 2; see Section 13).
- Per-LO review pages (v1.1, see Section 16).
- Lead forms, rate quotes, or any application flow.
- A content management system. Two people curate by editing JSON.

---

## 5. Current data

All figures were checked on September 27, 2026. Each platform entry in `data/platforms.json` records how it was checked.

| Platform | Rating | Reviews | How verified |
|---|---|---|---|
| Experience.com | 4.88 | 1,600 | Experience.com's own reviews only (see note) |
| Google | 4.81 | 1,045 | Live Google listings for San Diego (989), Scottsdale (32), Irvine (24), combined |
| WalletHub | 4.6 | 757 | Direct fetch of the profile |
| Yelp | 4.62 | 193 | Yelp pages for San Diego (185), Scottsdale (4), Irvine (4), combined |
| Zillow | 4.9 | 103 | Google Knowledge Panel (Zillow blocks automated reads) |
| BBB | 4.85 (A+ letter grade) | 60 | Direct fetch of the customer reviews page |
| Trustpilot | 4.7 | 37 | Manual check of the live page ("All reviews (37)") |
| **Total** | **4.8 weighted** | **3,795** | |

**Offices (added September 28, 2026).** Google and Yelp list each office separately. Per-office figures live in `offices` in `src/data/site.ts`, and the Google and Yelp platform rows are computed from them. Incline Village, NV has no Google or Yelp listing yet; add one only once someone creates and claims it. Office Google links are maps.app.goo.gl links copied from each listing's Share dialog. Never build or guess a listing URL.

**Notes on the data:**

- **Experience.com shows two numbers.** Its headline 4.81 / 3,073 is a blend that re-counts Google, Zillow, and Facebook reviews. Using it would count those reviews twice. We use Experience.com's own 4.88 / 1,600.
- **Trustpilot was first recorded as 631 reviews.** A manual check showed 37, so the 631 figure was wrong. Trustpilot is the thinnest platform on the page.
- **BBB is excluded from the average.** A+ is BBB's letter grade for the business, not a star average.
- **The Google review CSV** (937 rows, latest review August 17, 2026) averages 4.77. The live panel now shows 991 reviews at 4.8. The CSV is the source for quotes; the live panel is the source for the headline count.

### 5.1 How the average is calculated

The weighted average is computed at build time, never typed in by hand:

```
weighted average = sum(rating × review count) / sum(review count)
```

It only includes platforms that publish both a star rating and a review count (six of seven today). It's shown to one decimal place because most platforms round their own ratings to one decimal. With today's data, 3,673 rated reviews produce 4.795, shown as **4.8**.

### 5.2 License identifiers (from Griffin, verified)

| Identifier | Value |
|---|---|
| Legal name | Griffin Funding, Inc. |
| NMLS Unique Identifier | 1120111 |
| VA Approved Lender ID | 9088650000 |
| FHA Non-Supervised Lender No. | 01472-0000-3 |

An earlier draft used NMLS 1830 from memory. It was wrong and has been corrected everywhere. Cross-check that griffinfunding.com's footer shows the same identifiers.

---

## 6. The curated reviews

### 6.1 What's on the page

34 five-star Google reviews: one pull quote (Luke F.) plus 33 in the grid. Nine show at first, with a "Show all 33 reviews" button. All 34 are in the page code either way, so crawlers and readers without JavaScript see every one.

| Loan type | Reviews tagged |
|---|---|
| Refinance | 10 |
| Self-employed | 10 (plus the pull quote) |
| Investment property | 8 |
| Purchase | 8 (plus the pull quote) |
| DSCR | 5 |
| Bank statement | 5 (plus the pull quote) |
| HELOC | 4 |
| VA | 2 |

A review can carry more than one loan type.

### 6.2 Selection rules

A review was eligible if it was:

- Five stars
- Posted in 2023 or later
- 180 to 650 characters long
- Clearly about a specific loan type

A review was excluded if it:

- Was signed with the reviewer's full name
- Misspelled the company name ("Griffith Funding")
- Had broken formatting from the export
- Made a specific rate or fee claim ("interest rates were better than the bank," "no unexpected fees")
- Contained a statement that could read as negative out of context

### 6.3 Presentation rules

- **Text is never reworded.** It can only be trimmed, and every trim is recorded in the review's `redacted` field.
- **Names are shortened** to first name and last initial.
- **Every review links to its original post** on Google.
- **Dates show month and year only.** The export's day values are approximate.

### 6.4 Client personal details (Bill's rule)

Bill's direction: clients may include their city and state, but not a full address. We applied the same standard to every published quote.

**Removed:**

- Street addresses, apartment or unit numbers, and ZIP codes
- Phone numbers and email addresses
- Loan or account numbers
- Sign-off signatures. Two quotes were trimmed for this: Stefan S. ("-Stefan") and Jennifer R. ("-Jesus & Jennifer", which named a second person).

**Kept:**

- Staff names. Bill's rule covers client details, and naming a loan officer is part of what makes a review credible.
- Details borrowers chose to share about their own situation ("S-Corp income," "as a veteran," "living overseas"). None of these identifies the person.

**How it's enforced:** `scripts/pii.mjs` checks for every removed category.

- The Google importer flags matching reviews in a `piiFlags` field. On the full 937-review CSV it flags 5.
- The build **refuses to publish** a featured review that fails the check.

### 6.5 Bill's second point: product mentions

Bill also asked that clients be encouraged to name their product (bank statement loan, DSCR loan, home equity, VA home loan). Reviews that name a product feed this page's loan-type filter and read better to AI tools. The next step is a short post-closing review-request email that asks borrowers to:

- Include their city, state, and loan type
- Leave out their address and account details

That email hasn't been written yet (Section 12).

---

## 7. Compliance and trust decisions

| Decision | Why |
|---|---|
| **Label the quotes "Selected reviews."** Link every platform's full profile, lower ratings included. | The FTC's rule on consumer reviews (16 CFR Part 465, 2024) bars implying that a selection represents all reviews. Ratings and counts on the page cover every review on each platform. [NEEDS VERIFICATION: confirm scope with compliance] |
| **Say who runs the site.** The footer and FAQ both say Griffin Funding operates it. | Avoids any impression that it's an independent review site. |
| **No `aggregateRating` in structured data.** | Google's review-snippet policy excludes ratings a business publishes about itself and ratings gathered from other sites. Adding them risks a manual action for spammy structured data. The page uses `FinancialService`, `WebPage`, and `FAQPage` markup instead. |
| **No rate or fee claims in the selected quotes.** | Mortgage advertising rules. Compliance should still review the remaining mentions of speed and "rates offered." |
| **Full license disclosures in the footer.** | NMLS ID with a link to NMLS Consumer Access, VA and FHA lender IDs, Equal Housing Lender, and "not a commitment to lend." |
| **FAQ answers use only figures on the page.** | No outside claims, no statistics without a source. |
| **Numbers carry a check date.** | Every figure on the page says when it was last checked. |

### 7.1 Quotes compliance should look at hardest

- **Theresa F.** mentions "rates offered by Griffin."
- **Brad J.** says "terms were great too."
- **Heather B., Chris H., and Stefan S.** describe specific timelines ("from start of application to loan funding was a week"). These could read as an implied promise about speed.
- **Karen K.** calls her loan officer a "mortgage broker." Griffin is a lender.

Also confirm that every staff member named in a quote still works at Griffin. Remove any review that names someone who has left.

A compliance review file with every quote, its source link, and an Approve / Remove box has been prepared.

---

## 8. Design

### 8.1 Design system

The page follows the **King UI design system** (`docs/King_UI-DESIGN-SYSTEM.md`), with Griffin red (`#BD0C0C`) as its one accent color.

- **Fonts:** Newsreader (serif headings), Plus Jakarta Sans (body text), IBM Plex Mono (numbers and labels).
- **Palette:** a warm light background for content, and a near-black surface for the top bar, hero, pull quote, and footer.
- **Cards:** small radii and a soft one-pixel shadow instead of drop shadows.

King UI was chosen over Griffin's Track A brand kit because it was supplied for this project, it uses the same Griffin red, and its fonts load from Google Fonts. Track A's Conta fonts weren't available. If brand ops requires Track A for public pages, only `src/styles.css` changes.

### 8.2 Page structure

1. **Top bar.** Monogram and "Griffin Funding / Reviews," section links, and a link to griffinfunding.com.
2. **Hero.** Headline "Griffin Funding reviews, all in one place," the total review count, and two buttons. A summary card beside it shows the 4.8 average, 3,733 reviews, 7 platforms, the BBB A+, and the check date.
3. **Ratings by platform.** One list sorted by review count. Each row shows the rating with partially filled stars, the review count, and a link to the full profile. A note underneath explains the average and why BBB is excluded.
4. **Selected reviews.** The pull quote, loan-type filter buttons with counts, a masonry grid of cards, and "Show all."
5. **FAQ.** Six questions in two columns: "Is Griffin Funding legit?", overall rating, where to read every review, complaints, who runs the site, and how current the numbers are.
6. **Footer.** A source note, links, and license disclosures.

### 8.3 Details that matter

- **Stars fill partially.** A 4.6 shows 4.6 stars, not five. Showing five full stars for 4.6 would overstate the rating.
- **Platform rows sort by review count.** The platforms with the most evidence come first.
- **The share image has no numbers,** so it never shows a stale rating when the link is shared.

### 8.4 Quality checks passed

Tested in a headless browser with the production fonts:

- Filters, "Show all," and the filter-reset behavior work.
- With JavaScript off, all 33 grid reviews are visible.
- No sideways scrolling at 320, 390, 768, 1024, or 1280 pixels wide.
- One `h1`, no duplicate IDs, no links without a text label, and no console errors.
- The 404 page returns a real 404 status.
- The keyboard focus outline is visible, there's a skip-to-content link, and animation turns off for readers who prefer reduced motion.

---

## 9. How it's built

### 9.1 Architecture

A zero-dependency Node build script reads three JSON files and writes plain HTML. There's no framework and nothing to install. The page's content is written into the HTML at build time, not loaded afterward, because many AI crawlers don't run JavaScript.

```
data/site.json        ─┐
data/platforms.json   ─┼─► node build.mjs ─► dist/ ─► Netlify
data/reviews.json     ─┤                     index.html, 404.html,
src/styles.css        ─┤                     llms.txt, robots.txt,
static/*              ─┘                     sitemap.xml, og.png, icons, _headers
```

### 9.2 Files

| Path | Purpose |
|---|---|
| `build.mjs` | Builds every file in `dist/`. Validates reviews (required fields, known platform and loan type, no personal details). Computes the weighted average. Prints a warning for any unverified platform. |
| `data/site.json` | Domain, company and legal name, license IDs, page title and description, loan-type labels |
| `data/platforms.json` | Per platform: name, rating, count, BBB grade, profile URL, note, `verified`, `checked` date, `method` |
| `data/reviews.json` | Curated reviews. Only `featured: true` entries render. `spotlight: true` marks the pull quote. `redacted` records any trim. |
| `src/styles.css` | All styling, inlined into the page at build time |
| `static/` | Favicon, share image, touch icon, and Netlify `_headers`, copied into `dist/` as is |
| `scripts/import-google-csv.mjs` | Turns a Google review export into sorted candidates in `data/google-candidates.json`, with personal-detail flags |
| `scripts/pii.mjs` | The personal-detail check, shared by the importer and the build |
| `scripts/render-images.mjs` | Renders the share image and touch icon. Needs Playwright, so it runs locally, not on Netlify. |
| `netlify.toml` | Build command and publish folder for Git-connected deploys |
| `docs/King_UI-DESIGN-SYSTEM.md` | The design system reference |
| `docs/PROJECT.md` | This brief |

`data/raw/` (raw exports), `data/google-candidates.json`, `dist/`, and all `.csv` files are git-ignored. Only curated reviews ship.

### 9.3 Built for search engines and AI tools

- The page title and headings use the exact query: "Griffin Funding Reviews," "Griffin Funding reviews: frequently asked questions."
- The FAQ answers the questions people ask, in plain sentences an AI tool can quote.
- Structured data identifies Griffin as a `FinancialService` with its NMLS ID, and links every review profile through `sameAs`.
- `llms.txt` gives AI crawlers a plain-text summary of every rating and link.
- A canonical URL, sitemap, and `robots.txt` that allows all crawlers.
- The share image and page descriptions are set for Slack, iMessage, LinkedIn, and X.

---

## 10. Deploy and DNS

### 10.1 Deploy (pick one)

- **Git-connected (recommended).** In Netlify, import the GitHub repo. It builds with `node build.mjs` and publishes `dist/`. Every push to `main` redeploys.
- **Drag and drop.** Build, zip the contents of `dist/`, and drop the zip under Add new site → Deploy manually. The security headers ship in `dist/_headers`.

### 10.2 Domain

1. In the Netlify site's domain settings, add `griffinfundingreviews.com`.
2. **Set it as the primary domain.** Netlify then redirects `www` to it. The repo has no www redirect of its own, to avoid a redirect loop.
3. At the registrar where Bill bought the domain, add the records Netlify shows. Usually that's an A record for the root domain pointing to Netlify's load balancer plus a CNAME for `www` to the `*.netlify.app` address. The alternative is switching nameservers to Netlify DNS. Use the exact values in Netlify's domain panel.
4. Netlify sets up HTTPS on its own once DNS takes effect.
5. Verify the domain in Google Search Console and submit `/sitemap.xml`.

**Until DNS resolves,** share previews won't show the image, because the image URL points to griffinfundingreviews.com.

---

## 11. Maintenance runbook

### 11.1 Monthly: refresh the numbers

1. Open each platform profile and read its rating and total review count.
2. Update `data/platforms.json`: `rating`, `count`, `checked`, `method`, and `verified: true`.
3. Update `asOf` to the check date.
4. Run `node build.mjs`. It prints a warning for any platform left unverified.
5. Commit and push, or re-zip and redeploy.

### 11.2 Quarterly: refresh the quotes

1. Export Google reviews to `data/raw/`.
2. Run `node scripts/import-google-csv.mjs data/raw/<file>.csv`.
3. Pick new reviews from `data/google-candidates.json`, skipping any with `piiFlags`.
4. Copy the picks into `data/reviews.json`. Tag `loanTypes` and set `featured: true`.
5. Build (it rejects any quote with personal details), then send the new quotes to compliance before publishing.

### 11.3 Every change to quotes

Compliance reviews any new or changed quote before it goes live.

---

## 12. Open items

| Item | Owner | Blocks launch? |
|---|---|---|
| Compliance sign-off on the 34 quotes and footer disclosures | Chris to route to compliance | **Yes** |
| Confirm every staff member named in a quote still works at Griffin | Chris / HR | **Yes** |
| Deploy to Netlify | Chris | **Yes** |
| DNS at the registrar | Chris with Bill (registrar account) | **Yes** |
| Check that griffinfunding.com's footer lists the same license IDs | Chris | No |
| Swap the "G" monogram for Griffin's real logo (SVG needed) | Marketing | No |
| Post-closing review-request email (city, state, loan type; no address or account details) | Chris / Marketing | No |
| Search Console verification and sitemap submission | Chris | No, but do it on launch day |
| Record first baseline readings for G1, G2, and G5 | Chris | No, but do it launch week |
| Build Trustpilot volume: ask every borrower, not only happy ones | Operations | No |
| Tag the 34 curated quotes with loan officer IDs; build the officer roster (Section 16) | Chris | No, blocks v1.1 only |
| Route LO-attributed quotes and per-LO Experience.com ratings through compliance | Chris to route to compliance | No, blocks v1.1 only |

---

## 13. Phase 2: automated refresh

The data files are separate from the page template on purpose. An automated refresh can write `data/platforms.json` (and eventually `data/reviews.json` candidates) without touching the page.

- **Google** has an official API for a business's own reviews. The Google Business Profile API is the most direct source. [NEEDS VERIFICATION: confirm access and terms for republishing review text]
- **Other platforms** vary. Several block automated reads, which is why Yelp, Zillow, and Trustpilot needed manual checks. Check each platform's terms before automating.
- **Human review stays.** Automation can refresh counts. Curated quotes still go through selection and compliance review.

Only start phase 2 if the monthly manual refresh becomes a real time cost.

---

## 14. Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Figures go stale and the page shows old numbers | High without a routine | Monthly refresh (11.1); check dates are visible on the page |
| A quote draws a compliance objection after launch | Moderate | Sign-off before launch; conservative selection rules; fast removal (edit JSON, rebuild) |
| A named staff member leaves | Moderate over time | Check names at each quarterly refresh |
| Google treats the domain as thin or duplicate content | Low to moderate | Unique content (FAQ, platform comparison), clear operator disclosure, canonical tag |
| Platforms change their pages or block checks | High for Yelp and Zillow | Manual checks recorded with method and date |
| Trustpilot's low count (37) weakens the story | Moderate | Borrower review requests; the page states counts as they are |

---

## 15. Decision log

| Date | Decision | Reason |
|---|---|---|
| 2026-09-27 | Static page with separate data files | Matches the proven tactic; leaves a clean path to API refresh |
| 2026-09-27 | Content written into HTML at build time | AI crawlers often don't run JavaScript |
| 2026-09-27 | Exact-match domain griffinfundingreviews.com | Settled by the repo name; matches the search query |
| 2026-09-27 | No `aggregateRating` markup | Google policy; manual-action risk |
| 2026-09-27 | NMLS corrected from 1830 to 1120111 | The first value was from memory and wrong |
| 2026-09-27 | Experience.com native figures, not the blended 4.81 / 3,073 | The blend double-counts other platforms |
| 2026-09-27 | Trustpilot 37, not 631 | Confirmed by manual check |
| 2026-09-27 | BBB shown as a letter grade, excluded from the average | A+ isn't a star rating |
| 2026-09-27 | Average shown to one decimal | Matches the precision of source ratings |
| 2026-09-27 | Personal-detail check enforced at build | Bill's direction on client information |
| 2026-09-27 | King UI design system, not Track A | Supplied for the project; same red; fonts available |
| 2026-09-27 | Partially filled stars | Five full stars for a 4.6 overstates the rating |
| 2026-09-27 | Headers in `_headers`, no www redirect in the repo | Works for drag-and-drop; avoids a redirect loop |
| 2026-09-28 | LO subpages use `/lo/first-last`, not `/reviews/first-last` or a root slug | The URL goes in email signatures and is effectively permanent once shared; `/lo/` keeps a clean namespace |
| 2026-09-28 | LO pages show curated quotes plus the LO's Experience.com rating and count, not quotes alone | Every current LO already has an Experience.com number; showing it means a page is never empty even before a Google quote names that person |
| 2026-09-28 | LO qualifies for a pill and page if they have a tagged quote or an Experience.com review count above zero | In practice this is the full current roster, since Experience.com already has a count for everyone listed |
| 2026-09-28 | Building the LO feature isn't gated on the pending v1 compliance sign-off | Bill wants the build moving; the new LO-attributed quotes and per-LO ratings still go through compliance before they go live, on their own track |
| 2026-09-28 | One dropdown pill listing all LOs, not one pill per LO | ~27 names as individual pills would crowd out the loan-type pills in the filter bar |

### Commit history

| Commit | Change |
|---|---|
| `8a517c9` | Build Griffin Funding reviews page |
| `5d44d30` | Correct NMLS ID and add lender IDs and profile links |
| `b036067` | Apply live-verified platform figures |
| `dbc80b5` | Add verified Yelp rating |
| `dc2a6fd` | Record manual Trustpilot confirmation |
| `2371f41` | Strip client personal details from reviews |
| `dae9d8c` | Redesign page and prepare Netlify deploy |

---

## 16. Loan officer review filtering (v1.1)

### 16.1 What Bill asked for

Bill wants a formal pill-style filter by loan officer, matching the existing loan-type pills, plus a dedicated page per LO with its own URL. Each LO can put their own link in an email signature and send people straight to their reviews.

### 16.2 Why this isn't already built

The search box in `review-explorer.tsx` (`placeholder="Search quotes by name, loan, or phrase"`) does plain substring matching against quote text, author, and loan-type labels. Typing an LO's first name happens to filter to reviews that mention them, because the name appears somewhere in the quote. That's a coincidence of the data, not a feature: there's no `loanOfficer` field on a review, no roster of current LOs, and no per-LO URL.

### 16.3 Data model

Two additions to `src/data/`:

- **`loan-officers.ts` (new).** One entry per current LO, cross-referenced against Experience.com's own 27-professional roster for Griffin Funding: `{ id, name, title, experienceUrl, experienceRating, experienceCount, aliases[] }`. `aliases` absorbs how a name actually appears in a quote: first name only ("Guy" for Guy Troxler), or a misspelling ("Andre Shmoldas" vs. "Andre Schmoldas").
- **`reviews.ts`.** Add `officers: string[]` to each `Review`, listing which roster IDs are named in that quote. This is tagged by hand, once, by reading all 34 quotes against the roster. A script can suggest matches from the aliases, but a human confirms each one; misattributing a review to the wrong LO is worse than leaving it untagged.

### 16.4 Which LOs get a pill and a page

An LO qualifies if they have a tagged quote **or** an Experience.com review count above zero. Since Experience.com already publishes a count for every current LO, this is in practice the whole roster: an LO with no Google quote yet still gets a real page (their Experience.com rating and a link out), not an empty one.

### 16.5 UI

One pill, labeled "Loan officer," that opens a dropdown listing every qualifying LO by name, rather than one pill per LO. With ~27 people on the roster, a full pill row would crowd out the loan-type pills and dominate the filter bar. Selecting a name from the dropdown filters in place, same as a loan-type pill, and also shows a "View full page" link to that LO's own `/lo/` URL.

### 16.6 Routing

New file-based route `src/routes/lo.$slug.tsx` (TanStack Start dynamic segment), matching the `/lo/first-last` URL pattern. Renders the LO's name and title, their Experience.com rating and count as a linked badge, and the review grid pre-filtered to their tagged quotes. Server-rendered like the rest of the site, so it's as crawlable as the main page, and it's a second AI-citation surface for "[LO name] Griffin Funding reviews" searches. An unknown slug hits the existing `not-found.tsx`.

### 16.7 Scope and sequencing

This is v1.1: it doesn't hold up the v1 launch (compliance sign-off, Netlify deploy, DNS in Section 12), and building it doesn't wait on that sign-off either. Two things still need their own compliance pass before LO pages go live: attributing a quote to a named individual on its own shareable URL, and publishing each LO's own Experience.com rating. Confirm every named LO still works at Griffin before publishing their page, same rule as Section 7.1 for quotes.

### 16.8 Maintenance

Refreshing an LO's Experience.com number is a one-line edit in `loan-officers.ts`, the same pattern as the platform refresh in Section 11.1. Add `officers` tags to new quotes at the same quarterly refresh described in Section 11.2.
