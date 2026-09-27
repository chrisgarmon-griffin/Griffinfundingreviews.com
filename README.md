# griffinfundingreviews.com

One page that collects Griffin Funding's ratings from every public review platform, plus curated Google reviews and an FAQ. It's built to rank for "Griffin Funding reviews" and to be quoted by AI answer engines. See `docs/PROJECT.md` for goals, data sources, curation and compliance rules.

## Stack

TanStack Start (React 19) with Vite and Nitro, deployed to Vercel (`preset: "vercel"` in `vite.config.ts`). Pages render on the server, so crawlers get the full content without running JavaScript.

| Path | Holds |
|---|---|
| `src/data/site.ts` | Platform ratings and counts, check date, license IDs, FAQ, structured data |
| `src/data/reviews.ts` | Curated Google reviews (verbatim) and the spotlight quote |
| `src/components/page.tsx` | The page |
| `src/components/review-explorer.tsx` | Loan-type filters and review grid |
| `src/styles.css` | Styling |
| `public/` | `llms.txt`, `llms-full.txt`, `robots.txt`, `sitemap.xml`, share image, favicon |

## Commands

```bash
npm install
npm run dev        # local dev server on :8080
npm run build      # production build to .vercel/output
npm run typecheck
npm run lint
```

## Deploy

Vercel builds from `main`. `vercel.json` sets the install command. No environment variables are required: without `DATABASE_URL`, the database step skips and the app uses its embedded fallback. The page itself does not use a database.

## Updating figures and reviews

Edit `src/data/site.ts` (ratings, counts, `AS_OF`) and `src/data/reviews.ts` (quotes), then push. Quotes stay word for word, with client personal details removed: a city and state may stay; street addresses, phone numbers, emails, loan numbers, and signatures may not. New or changed quotes go to compliance before publishing.

## History

The first version of this site was a zero-dependency static build. It lives in this repo's history at commit `4f8483b`.
