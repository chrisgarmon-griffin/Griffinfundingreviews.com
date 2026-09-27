# griffinfundingreviews.com

One static page that collects Griffin Funding's ratings from every public review platform, plus a curated set of real reviews. It is built to rank for "Griffin Funding reviews" and to be quoted by AI search tools.

## How it works

`node build.mjs` reads three data files and writes plain HTML to `dist/`. There are no dependencies and nothing to install. Every rating, review, and FAQ answer is in the HTML itself, so crawlers that skip JavaScript still read all of it.

| File | Holds |
|---|---|
| `data/platforms.json` | Rating and review count for each platform, with profile links and the "as of" date |
| `data/reviews.json` | Curated reviews. Only entries with `"featured": true` render |
| `data/site.json` | Domain, NMLS number, page title and description, loan-type labels |
| `src/styles.css` | Styling, from `docs/King_UI-DESIGN-SYSTEM.md` with Griffin red as the accent |
| `build.mjs` | Builds `dist/index.html`, `llms.txt`, `robots.txt`, and `sitemap.xml` |

The weighted average rating is calculated at build time from each platform's rating and review count. It only includes platforms that publish both numbers.

## Updating reviews

1. Put a fresh Google export in `data/raw/`. Raw exports are git-ignored and never ship.
2. Run `node scripts/import-google-csv.mjs data/raw/<file>.csv`. It writes `data/google-candidates.json`, sorted best-first.
3. Copy the reviews you want into `data/reviews.json`, set `"featured": true`, and tag `loanTypes`.
4. Run `node build.mjs`. It stops with an error if a review is missing a field or uses an unknown platform or loan type.

Curation rules used for the first 34 quotes: five stars, posted 2023 or later, 180 to 650 characters, and a clear loan type. We excluded reviews signed with a full name, reviews that misspell the company, reviews with broken formatting, and reviews that make specific rate or fee claims. Reviewer names are shortened to first name plus last initial. Review text is never edited.

## Deploy

Connect the repo to Netlify. `netlify.toml` sets the build command and publish folder, and redirects `www` to the bare domain.

## Before launch

- [ ] Re-check every count and rating in `data/platforms.json` against the live profile, then set `"verified": true`. Google's figures (937 reviews, 4.77) match the audit CSV. The other platforms come from September 2026 research and could not be checked from the build environment.
- [ ] Confirm NMLS #1830 on NMLS Consumer Access, then set `"nmlsVerified": true` in `data/site.json`.
- [ ] Add the Google Business Profile link and the Experience.com profile link to `data/platforms.json`. Google currently points to a Maps search.
- [ ] Compliance review of the selected quotes and the footer disclosures (advertising rules, FTC consumer review rule).
- [ ] Point the griffinfundingreviews.com DNS at Netlify.
- [ ] Submit the sitemap in Google Search Console.

## Deliberate choices

- **No `aggregateRating` in structured data.** Google does not show review stars for ratings a business publishes about itself, or for ratings gathered from other sites. Adding them risks a manual action for spammy structured data. The page uses `FinancialService`, `WebPage`, and `FAQPage` markup instead.
- **Selection disclosure.** The page states that the quotes are a selection and links every platform's full profile, lower ratings included. The FTC consumer review rule (16 CFR Part 465) bars implying a selection represents all reviews.
