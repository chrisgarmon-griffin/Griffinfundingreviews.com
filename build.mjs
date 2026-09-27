// Builds dist/ from data/*.json. No dependencies: `node build.mjs`.
// Every review and rating is rendered into static HTML so search and AI
// crawlers read the content without running JavaScript.

import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';

const read = (p) => readFileSync(new URL(p, import.meta.url), 'utf8');
const json = (p) => JSON.parse(read(p));

const site = json('./data/site.json');
const { asOf, platforms } = json('./data/platforms.json');
const reviews = json('./data/reviews.json').reviews
  .filter((r) => r.featured)
  .sort((a, b) => b.date.localeCompare(a.date));

const warnings = [];
for (const p of platforms.filter((x) => !x.verified)) warnings.push(`${p.name} figures are not verified: ${p.method ?? 'no check recorded'}`);
if (!site.nmlsVerified) warnings.push('NMLS number is not verified. Confirm on nmlsconsumeraccess.org.');
if (!reviews.length) warnings.push('No featured reviews. The reviews section is omitted until reviews.json has featured entries.');

const byId = Object.fromEntries(platforms.map((p) => [p.id, p]));
for (const r of reviews) {
  for (const k of ['id', 'platform', 'author', 'rating', 'date', 'text', 'sourceUrl']) {
    if (r[k] === undefined || r[k] === '') throw new Error(`Review ${r.id ?? '(no id)'} is missing "${k}"`);
  }
  if (!byId[r.platform]) throw new Error(`Review ${r.id} has unknown platform "${r.platform}"`);
  for (const t of r.loanTypes ?? []) {
    if (!site.loanTypeLabels[t]) throw new Error(`Review ${r.id} has unknown loan type "${t}"`);
  }
}

// ---- Numbers ---------------------------------------------------------------

const counted = platforms.filter((p) => Number.isFinite(p.count));
const rated = platforms.filter((p) => Number.isFinite(p.count) && Number.isFinite(p.rating));
const totalReviews = counted.reduce((s, p) => s + p.count, 0);
const ratedReviews = rated.reduce((s, p) => s + p.count, 0);
const weighted = rated.reduce((s, p) => s + p.count * p.rating, 0) / ratedReviews;
// One decimal: most platforms publish ratings rounded to 0.1.
const avg = weighted.toFixed(1);
const showRating = (r) => (Number.isInteger(r) ? r.toFixed(1) : String(r));
const unrated = platforms.filter((p) => !Number.isFinite(p.rating) || !Number.isFinite(p.count));

const fmt = (n) => n.toLocaleString('en-US');
const asOfDate = new Date(`${asOf}T12:00:00Z`);
const asOfLong = asOfDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const asOfMonth = asOfDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const listNames = (items) =>
  items.length < 3 ? items.join(' and ') : `${items.slice(0, -1).join(', ')}, and ${items.at(-1)}`;

// ---- HTML helpers ----------------------------------------------------------

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const stars = (rating) => {
  const full = Math.round(rating);
  return `<span class="stars" aria-hidden="true">${'★'.repeat(full)}${'☆'.repeat(5 - full)}</span>`;
};

const platformCard = (p) => `
      <article class="pcard">
        <h3 class="pname" style="margin:0">${esc(p.name)}</h3>
        ${p.note ? `<span class="pnote">${esc(p.note)}</span>` : ''}
        <div class="prating">${Number.isFinite(p.rating) ? `${showRating(p.rating)} <small>/ 5</small>` : p.grade ? `${esc(p.grade)} <small>${esc(p.name)} rating</small>` : `<small>See rating on ${esc(p.name)}</small>`}</div>
        ${Number.isFinite(p.rating) ? stars(p.rating) : ''}
        <span class="pcount">${Number.isFinite(p.count) ? `${fmt(p.count)} reviews` : 'Review count not published'}</span>
        ${p.url
          ? `<a class="arrow-link" href="${esc(p.url)}" rel="noopener" target="_blank">Read all ${esc(p.name)} reviews <span class="arr" aria-hidden="true">→</span></a>`
          : `<span class="arrow-link none">Profile link coming soon</span>`}
      </article>`;

const reviewCard = (r) => {
  const p = byId[r.platform];
  const types = r.loanTypes ?? [];
  const d = new Date(`${r.date}T12:00:00Z`).toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
  return `
      <figure class="rcard" data-types="${esc(types.join(' '))}">
        <div>${stars(r.rating)} <span class="sr-only">${r.rating} out of 5 stars</span></div>
        <blockquote><p style="margin:0">${esc(r.text)}</p></blockquote>
        ${types.length ? `<div class="tags">${types.map((t) => `<span class="tag">${esc(site.loanTypeLabels[t])}</span>`).join('')}</div>` : ''}
        <footer>
          <figcaption class="who">${esc(r.author)}</figcaption>
          <span>${esc(d)} · <a href="${esc(r.sourceUrl)}" rel="noopener" target="_blank">${esc(p.name)}</a></span>
        </footer>
      </figure>`;
};

// ---- FAQ -------------------------------------------------------------------
// Answers use only figures from data/*.json. Each answer is plain text for
// JSON-LD plus an HTML version for the page.

const linked = platforms.filter((p) => p.url);
const nmlsUrl = `https://www.nmlsconsumeraccess.org/EntityDetails.aspx/COMPANY/${site.nmls}`;
const ratedNames = listNames(rated.map((p) => p.name));

const faqs = [
  {
    q: 'Is Griffin Funding legit?',
    text: `Griffin Funding is a licensed mortgage lender, NMLS #${site.nmls}. You can confirm its license on NMLS Consumer Access. As of ${asOfMonth}, it has ${fmt(totalReviews)} public reviews across ${counted.length} platforms, with a ${avg} out of 5 weighted average on the platforms that publish a star rating.`,
    html: `<p>Griffin Funding is a licensed mortgage lender, NMLS #${esc(site.nmls)}. You can confirm its license on <a href="${nmlsUrl}" rel="noopener" target="_blank">NMLS Consumer Access</a>.</p><p>As of ${asOfMonth}, it has ${fmt(totalReviews)} public reviews across ${counted.length} platforms, with a ${avg} out of 5 weighted average on the platforms that publish a star rating.</p>`,
  },
  {
    q: 'What is Griffin Funding’s overall rating?',
    text: `${avg} out of 5, as of ${asOfLong}. This is the average of ${ratedNames}, weighted by each platform’s review count (${fmt(ratedReviews)} rated reviews in total). ${unrated.length ? `${listNames(unrated.map((p) => p.name))} ${unrated.length > 1 ? 'are' : 'is'} not part of the average because this page has no confirmed star rating and review count for ${unrated.length > 1 ? 'them' : 'it'}.` : ''}`,
    html: `<p>${avg} out of 5, as of ${asOfLong}. This is the average of ${esc(ratedNames)}, weighted by each platform’s review count (${fmt(ratedReviews)} rated reviews in total).</p>${unrated.length ? `<p>${esc(listNames(unrated.map((p) => p.name)))} ${unrated.length > 1 ? 'are' : 'is'} not part of the average because this page has no confirmed star rating and review count for ${unrated.length > 1 ? 'them' : 'it'}.</p>` : ''}`,
  },
  {
    q: 'Where can I read every Griffin Funding review, including negative ones?',
    text: `Every platform profile shows all of its reviews, positive and negative: ${linked.map((p) => `${p.name} (${p.url})`).join('; ')}.`,
    html: `<p>Each platform profile shows all of its reviews, positive and negative:</p><ul>${linked.map((p) => `<li><a href="${esc(p.url)}" rel="noopener" target="_blank">${esc(p.name)}</a></li>`).join('')}</ul>`,
  },
  {
    q: 'Does Griffin Funding have complaints?',
    text: `Complaints filed through the Better Business Bureau are public on Griffin Funding’s BBB profile${byId.bbb?.url ? ` (${byId.bbb.url})` : ''}. Lower-rated reviews on every platform are visible on the profiles linked on this page.`,
    html: `<p>Complaints filed through the Better Business Bureau are public on ${byId.bbb?.url ? `<a href="${esc(byId.bbb.url)}" rel="noopener" target="_blank">Griffin Funding’s BBB profile</a>` : 'Griffin Funding’s BBB profile'}.</p><p>Lower-rated reviews on every platform are visible on the profiles linked on this page.</p>`,
  },
  {
    q: 'Who runs this site?',
    text: `Griffin Funding operates this site. The ratings and review counts cover all reviews on each platform. The quotes shown are a selection of real reviews, each linked to its source.`,
    html: `<p>Griffin Funding operates this site. The ratings and review counts cover all reviews on each platform.</p><p>The quotes shown are a selection of real reviews, each linked to its source.</p>`,
  },
  {
    q: 'How current are these numbers?',
    text: `Ratings and counts were last checked on ${asOfLong}. Live counts on each platform change as new reviews post.`,
    html: `<p>Ratings and counts were last checked on ${asOfLong}. Live counts on each platform change as new reviews post.</p>`,
  },
];

// ---- Structured data -------------------------------------------------------
// No aggregateRating: Google's review-snippet policy excludes ratings a
// business publishes about itself and ratings pulled from other sites.

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'FinancialService',
      '@id': `${site.mainSite}/#organization`,
      name: site.company,
      legalName: site.legalName,
      url: site.mainSite,
      identifier: { '@type': 'PropertyValue', propertyID: 'NMLS', value: site.nmls },
      sameAs: linked.map((p) => p.url),
    },
    {
      '@type': 'WebPage',
      '@id': `${site.domain}/#webpage`,
      url: `${site.domain}/`,
      name: site.title,
      description: site.description,
      dateModified: asOf,
      about: { '@id': `${site.mainSite}/#organization` },
      publisher: { '@id': `${site.mainSite}/#organization` },
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.text } })),
    },
  ],
};

// ---- Page ------------------------------------------------------------------

const usedTypes = Object.keys(site.loanTypeLabels).filter((t) => reviews.some((r) => (r.loanTypes ?? []).includes(t)));
const css = read('./src/styles.css');

const reviewsSection = !reviews.length ? '' : `
  <section id="reviews" aria-labelledby="reviews-h">
    <div class="wrap">
      <p class="eyebrow"><span class="glyph" aria-hidden="true"></span>in their words</p>
      <h2 id="reviews-h">Selected Griffin Funding reviews</h2>
      <p class="disclosure">These are selected reviews, quoted word for word and linked to the original post. Ratings and counts above cover every review on each platform. Read the full set, including lower ratings, on each profile.</p>
      ${usedTypes.length ? `<div class="filters" role="group" aria-label="Filter reviews by loan type">
        <button type="button" data-filter="all" aria-pressed="true">All</button>
        ${usedTypes.map((t) => `<button type="button" data-filter="${t}" aria-pressed="false">${esc(site.loanTypeLabels[t])}</button>`).join('\n        ')}
      </div>` : ''}
      <div class="reviews">${reviews.map(reviewCard).join('')}
      </div>
    </div>
  </section>`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(site.title)}</title>
<meta name="description" content="${esc(site.description)}">
<link rel="canonical" href="${site.domain}/">
<meta property="og:type" content="website">
<meta property="og:url" content="${site.domain}/">
<meta property="og:title" content="${esc(site.title)}">
<meta property="og:description" content="${esc(site.description)}">
<meta name="twitter:card" content="summary">
<meta name="theme-color" content="#0b0c0f">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Newsreader:ital,opsz,wght@0,6..72,500;1,6..72,500&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap">
<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>
<style>
${css}
</style>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<nav class="nav" aria-label="Primary">
  <div class="wrap">
    <a class="wordmark" href="${site.mainSite}">Griffin Funding<small>reviews</small></a>
    <div class="navlinks">
      <a href="#platforms">Ratings</a>
      ${reviews.length ? '<a href="#reviews">Reviews</a>' : ''}
      <a href="#faq">FAQ</a>
      <a href="${site.mainSite}">griffinfunding.com</a>
    </div>
  </div>
</nav>

<header class="hero">
  <div class="wrap">
    <span class="eyebrow-pill enter-up"><span class="glyph" aria-hidden="true"></span>${platforms.length} review platforms</span>
    <h1 class="enter-up d1">Griffin Funding reviews, <span class="accent-italic">all in one place</span></h1>
    <p class="lede enter-up d2">${fmt(totalReviews)} public reviews from ${esc(listNames(counted.map((p) => p.name)))}. Every rating links to its full profile.</p>
    <div class="btns enter-up d3">
      <a class="btn btn-primary" href="#platforms">See every rating</a>
      <a class="btn btn-ghost" href="${site.mainSite}">Visit griffinfunding.com</a>
    </div>
  </div>
</header>

<main id="main">
  <div class="wrap">
    <div class="stat-strip">
      <div class="stat-block"><span class="num">${avg}</span><span class="label">Weighted average rating out of 5 across ${esc(ratedNames)}</span></div>
      <div class="stat-block"><span class="num">${fmt(totalReviews)}</span><span class="label">Public reviews on the ${counted.length} platforms that publish a count</span></div>
      <div class="stat-block"><span class="num">${platforms.length}</span><span class="label">Third-party review platforms, each linked below</span></div>
    </div>
  </div>

  <section id="platforms" aria-labelledby="platforms-h">
    <div class="wrap">
      <p class="eyebrow"><span class="glyph" aria-hidden="true"></span>ratings by platform</p>
      <h2 id="platforms-h">Griffin Funding ratings on every major review site</h2>
      <p class="section-lede">Each card shows the platform’s own rating and review count. Follow the link to read every review on that site. <span class="asof">Last checked ${asOfLong}.</span></p>
      <div class="platforms">${platforms.map(platformCard).join('')}
      </div>
    </div>
  </section>
${reviewsSection}
  <section id="faq" aria-labelledby="faq-h">
    <div class="wrap">
      <p class="eyebrow"><span class="glyph" aria-hidden="true"></span>common questions</p>
      <h2 id="faq-h">Griffin Funding reviews: frequently asked questions</h2>
      <div class="faq">${faqs.map((f, i) => `
        <details${i === 0 ? ' open' : ''}>
          <summary>${esc(f.q)}</summary>
          <div class="answer">${f.html}</div>
        </details>`).join('')}
      </div>
    </div>
  </section>
</main>

<footer class="site-footer">
  <div class="wrap">
    <div class="row">
      <div>
        <p>${esc(site.legalName)}. NMLS #${esc(site.nmls)} (<a href="${nmlsUrl}" rel="noopener" target="_blank">NMLS Consumer Access</a>). VA Approved Lender ID ${esc(site.vaLenderId)}. FHA Non-Supervised Lender No. ${esc(site.fhaLenderId)}. Equal Housing Lender.</p>
        <p>This site is operated by Griffin Funding. Ratings and review counts come from each third-party platform and were last checked ${asOfLong}. Selected reviews are quoted word for word and link to their source. This is not a commitment to lend. All loans are subject to credit approval and underwriting.</p>
      </div>
      <div><p><a href="${site.mainSite}">griffinfunding.com</a></p></div>
    </div>
  </div>
</footer>
${usedTypes.length ? `<script>
(() => {
  const btns = document.querySelectorAll('[data-filter]');
  const cards = document.querySelectorAll('.rcard');
  btns.forEach((b) => b.addEventListener('click', () => {
    const f = b.dataset.filter;
    btns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    cards.forEach((c) => { c.hidden = f !== 'all' && !c.dataset.types.split(' ').includes(f); });
  }));
})();
</script>` : ''}
</body>
</html>
`;

// ---- Machine-readable companions -------------------------------------------

const llms = `# Griffin Funding Reviews

> Ratings and review counts for Griffin Funding (${site.legalName}, NMLS #${site.nmls}), a licensed mortgage lender, gathered from every public review platform. Operated by Griffin Funding. Last checked ${asOf}.

Weighted average rating: ${avg} out of 5 across ${ratedNames} (${fmt(ratedReviews)} rated reviews).
Total public reviews: ${fmt(totalReviews)} across ${counted.length} platforms.

## Platforms

${platforms.map((p) => `- ${p.name}: ${Number.isFinite(p.rating) ? `${showRating(p.rating)} / 5` : p.grade ? `${p.grade} (letter rating)` : 'star rating not confirmed'}, ${Number.isFinite(p.count) ? `${fmt(p.count)} reviews` : 'count not published'}${p.url ? ` (${p.url})` : ''}`).join('\n')}

## Links

- [Full page](${site.domain}/)
- [Griffin Funding](${site.mainSite})
- [NMLS Consumer Access](${nmlsUrl})
`;

const robots = `User-agent: *
Allow: /

Sitemap: ${site.domain}/sitemap.xml
`;

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${site.domain}/</loc><lastmod>${asOf}</lastmod></url>
</urlset>
`;

const out = new URL('./dist/', import.meta.url);
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
writeFileSync(new URL('index.html', out), html);
writeFileSync(new URL('llms.txt', out), llms);
writeFileSync(new URL('robots.txt', out), robots);
writeFileSync(new URL('sitemap.xml', out), sitemap);

console.log(`Built dist/: ${fmt(totalReviews)} reviews, ${avg} weighted avg, ${reviews.length} featured quotes.`);
for (const w of warnings) console.warn(`WARN: ${w}`);
