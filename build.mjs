// Builds dist/ from data/*.json. No dependencies: `node build.mjs`.
// Every review and rating is rendered into static HTML so search and AI
// crawlers read the content without running JavaScript.

import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync } from 'node:fs';
import { findPii } from './scripts/pii.mjs';

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
  const pii = findPii(r.text);
  if (pii.length) throw new Error(`Review ${r.id} contains client personal details (${pii.join(', ')}). Remove them before publishing.`);
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

// Partial-fill star bar: a 4.6 shows 4.6 stars, not a rounded 5.
const stars = (rating, size = 14) =>
  `<span class="stars" style="--r:${rating};--s:${size}px" role="img" aria-label="${rating} out of 5 stars"></span>`;

const monthYear = (d) =>
  new Date(`${d}T12:00:00Z`).toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });

const ext = (url, label, cls = '') => `<a${cls ? ` class="${cls}"` : ''} href="${esc(url)}" rel="noopener" target="_blank">${label}</a>`;

// Platforms sorted by review volume; the ones without a count go last.
const byVolume = [...platforms].sort((a, b) => (b.count ?? -1) - (a.count ?? -1));

const platformRow = (p) => {
  const score = Number.isFinite(p.rating)
    ? `<span class="pnum">${showRating(p.rating)}</span>${stars(p.rating)}`
    : p.grade
      ? `<span class="pnum">${esc(p.grade)}</span><span class="pgrade">BBB letter rating</span>`
      : `<span class="pgrade">See rating on ${esc(p.name)}</span>`;
  const inner = `
          <span class="pmeta"><span class="pname">${esc(p.name)}</span>${p.note ? `<span class="pnote">${esc(p.note)}</span>` : ''}</span>
          <span class="pscore">${score}</span>
          <span class="pcount">${Number.isFinite(p.count) ? `${fmt(p.count)} reviews` : 'Count not published'}</span>
          <span class="pgo">${p.url ? 'View profile <span class="arr" aria-hidden="true">→</span>' : ''}</span>`;
  return p.url
    ? `
        <li><a class="prow" href="${esc(p.url)}" rel="noopener" target="_blank" aria-label="${esc(`${p.name}: ${Number.isFinite(p.rating) ? `${showRating(p.rating)} out of 5` : p.grade ?? ''}${Number.isFinite(p.count) ? `, ${fmt(p.count)} reviews` : ''}. View profile`)}">${inner}
        </a></li>`
    : `
        <li><div class="prow">${inner}
        </div></li>`;
};

const tagList = (types) =>
  types.length ? `<ul class="tags" aria-label="Loan types">${types.map((t) => `<li class="tag">${esc(site.loanTypeLabels[t])}</li>`).join('')}</ul>` : '';

const INITIAL = 9;
const reviewCard = (r, i) => {
  const p = byId[r.platform];
  const types = r.loanTypes ?? [];
  return `
        <figure class="rcard${i >= INITIAL ? ' is-extra' : ''}" data-types="${esc(types.join(' '))}">
          ${stars(r.rating)}
          <blockquote><p>${esc(r.text)}</p></blockquote>
          ${tagList(types)}
          <figcaption>
            <span class="who">${esc(r.author)}</span>
            <span class="src">${esc(monthYear(r.date))} · ${ext(r.sourceUrl, `${esc(p.name)} review`)}</span>
          </figcaption>
        </figure>`;
};

// ---- FAQ -------------------------------------------------------------------
// Answers use only figures from data/*.json. Each answer is plain text for
// JSON-LD plus an HTML version for the page.

const linked = byVolume.filter((p) => p.url);
const nmlsUrl = `https://www.nmlsconsumeraccess.org/EntityDetails.aspx/COMPANY/${site.nmls}`;
const ratedNames = listNames(rated.map((p) => p.name));
const unratedNote = unrated.length
  ? `${listNames(unrated.map((p) => p.name))} ${unrated.length > 1 ? 'are' : 'is'} not part of the average${unrated.some((p) => p.grade) ? ` because ${unrated.length > 1 ? 'they do' : 'it does'} not publish a star rating and review count together` : ''}.`
  : '';

const faqs = [
  {
    q: 'Is Griffin Funding legit?',
    text: `Griffin Funding is a licensed mortgage lender, NMLS #${site.nmls}. You can confirm its license on NMLS Consumer Access. As of ${asOfMonth}, it has ${fmt(totalReviews)} public reviews across ${counted.length} platforms, with a ${avg} out of 5 average weighted by review count.`,
    html: `<p>Griffin Funding is a licensed mortgage lender, NMLS #${esc(site.nmls)}. You can confirm its license on ${ext(nmlsUrl, 'NMLS Consumer Access')}.</p><p>As of ${asOfMonth}, it has ${fmt(totalReviews)} public reviews across ${counted.length} platforms, with a ${avg} out of 5 average weighted by review count.</p>`,
  },
  {
    q: 'What is Griffin Funding’s overall rating?',
    text: `${avg} out of 5, as of ${asOfLong}. This is the average of ${ratedNames}, weighted by each platform’s review count (${fmt(ratedReviews)} rated reviews in total). ${unratedNote}`.trim(),
    html: `<p>${avg} out of 5, as of ${asOfLong}. This is the average of ${esc(ratedNames)}, weighted by each platform’s review count (${fmt(ratedReviews)} rated reviews in total).</p>${unratedNote ? `<p>${esc(unratedNote)}</p>` : ''}`,
  },
  {
    q: 'Where can I read every Griffin Funding review, including negative ones?',
    text: `Every platform profile shows all of its reviews, positive and negative: ${linked.map((p) => `${p.name} (${p.url})`).join('; ')}.`,
    html: `<p>Each platform profile shows all of its reviews, positive and negative:</p><ul>${linked.map((p) => `<li>${ext(p.url, esc(p.name))}</li>`).join('')}</ul>`,
  },
  {
    q: 'Does Griffin Funding have complaints?',
    text: `Complaints filed through the Better Business Bureau are public on Griffin Funding’s BBB profile${byId.bbb?.url ? ` (${byId.bbb.url})` : ''}. Lower-rated reviews on every platform are visible on the profiles linked on this page.`,
    html: `<p>Complaints filed through the Better Business Bureau are public on ${byId.bbb?.url ? ext(byId.bbb.url, 'Griffin Funding’s BBB profile') : 'Griffin Funding’s BBB profile'}.</p><p>Lower-rated reviews on every platform are visible on the profiles linked on this page.</p>`,
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

const spotlight = reviews.find((r) => r.spotlight);
const grid = reviews.filter((r) => r !== spotlight);
const usedTypes = Object.keys(site.loanTypeLabels).filter((t) => grid.some((r) => (r.loanTypes ?? []).includes(t)));
const typeCount = (t) => grid.filter((r) => (r.loanTypes ?? []).includes(t)).length;
const css = read('./src/styles.css');
const fontsHref = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Newsreader:ital,opsz,wght@0,6..72,500;1,6..72,500&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap';

const head = (title, description, extra = '') => `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="theme-color" content="#0b0c0f">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${fontsHref}">${extra}
<style>
${css}
</style>`;

const nav = (onHome) => `<nav class="nav" aria-label="Primary">
  <div class="wrap">
    <a class="wordmark" href="${onHome ? '#top' : '/'}"><span class="mark" aria-hidden="true">G</span>Griffin Funding<small>Reviews</small></a>
    <div class="navlinks">
      <a href="${onHome ? '' : '/'}#platforms">Ratings</a>
      ${reviews.length ? `<a href="${onHome ? '' : '/'}#reviews">Reviews</a>` : ''}
      <a href="${onHome ? '' : '/'}#faq">FAQ</a>
      <a class="navcta" href="${site.mainSite}">griffinfunding.com <span aria-hidden="true">↗</span></a>
    </div>
  </div>
</nav>`;

const footer = `<footer class="site-footer">
  <div class="wrap">
    <div class="foot-top">
      <div class="foot-brand">
        <span class="wordmark"><span class="mark" aria-hidden="true">G</span>Griffin Funding<small>Reviews</small></span>
        <p>Ratings and review counts come from each third-party platform and were last checked ${asOfLong}. Selected reviews are quoted word for word and link to their source.</p>
      </div>
      <ul class="foot-links">
        <li>${ext(site.mainSite, 'griffinfunding.com')}</li>
        <li>${ext(nmlsUrl, 'NMLS Consumer Access')}</li>
        ${byId.bbb?.url ? `<li>${ext(byId.bbb.url, 'BBB profile')}</li>` : ''}
      </ul>
    </div>
    <div class="foot-legal">
      <p>${esc(site.legalName)} · NMLS #${esc(site.nmls)} · VA Approved Lender ID ${esc(site.vaLenderId)} · FHA Non-Supervised Lender No. ${esc(site.fhaLenderId)} · Equal Housing Lender</p>
      <p>This site is operated by Griffin Funding. This is not a commitment to lend. All loans are subject to credit approval and underwriting.</p>
    </div>
  </div>
</footer>`;

const spotlightBlock = !spotlight ? '' : `
      <figure class="spotlight">
        <blockquote><p>${esc(spotlight.text)}</p></blockquote>
        <figcaption>
          ${stars(spotlight.rating, 16)}
          <span class="who">${esc(spotlight.author)}</span>
          <span class="src">${(spotlight.loanTypes ?? []).map((t) => esc(site.loanTypeLabels[t])).join(' · ')}${spotlight.loanTypes?.length ? ' · ' : ''}${esc(monthYear(spotlight.date))} · ${ext(spotlight.sourceUrl, `${esc(byId[spotlight.platform].name)} review`)}</span>
        </figcaption>
      </figure>`;

const reviewsSection = !reviews.length ? '' : `
  <section id="reviews" class="section" aria-labelledby="reviews-h">
    <div class="wrap">
      <header class="section-head">
        <p class="eyebrow">In their words</p>
        <h2 id="reviews-h">Selected Griffin Funding reviews</h2>
        <p class="section-lede">Quoted word for word from Google reviews, with client personal details removed. The ratings above cover every review on each platform, including lower ones.</p>
      </header>
${spotlightBlock}
      ${usedTypes.length ? `<div class="filters" role="group" aria-label="Filter reviews by loan type">
        <button type="button" data-filter="all" aria-pressed="true">All <span class="n">${grid.length}</span></button>
        ${usedTypes.map((t) => `<button type="button" data-filter="${t}" aria-pressed="false">${esc(site.loanTypeLabels[t])} <span class="n">${typeCount(t)}</span></button>`).join('\n        ')}
      </div>` : ''}
      <div class="reviews" id="review-grid">${grid.map(reviewCard).join('')}
      </div>
      ${grid.length > INITIAL ? `<div class="more-wrap"><button type="button" class="btn btn-outline" id="show-all" aria-controls="review-grid" hidden>Show all ${grid.length} reviews</button></div>` : ''}
    </div>
  </section>`;

const html = `<!doctype html>
<html lang="en">
<head>
${head(site.title, site.description, `
<link rel="canonical" href="${site.domain}/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Griffin Funding Reviews">
<meta property="og:url" content="${site.domain}/">
<meta property="og:title" content="${esc(site.title)}">
<meta property="og:description" content="${esc(site.description)}">
<meta property="og:image" content="${site.domain}/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Griffin Funding Reviews: ratings from ${platforms.length} review platforms in one place">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${site.domain}/og.png">
<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>
<script>document.documentElement.classList.add('js')</script>`)}
</head>
<body id="top">
<a class="skip" href="#main">Skip to content</a>
${nav(true)}

<header class="hero">
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <p class="eyebrow-pill enter-up"><span class="glyph" aria-hidden="true"></span>${platforms.length} review platforms<span class="pill-extra"> · Updated ${esc(asOfMonth)}</span></p>
      <h1 class="enter-up d1">Griffin Funding reviews, <span class="accent-italic">all in one place.</span></h1>
      <p class="lede enter-up d2">${fmt(totalReviews)} public reviews from ${esc(listNames(byVolume.filter((p) => Number.isFinite(p.count)).map((p) => p.name)))}. Every number links to the platform that published it.</p>
      <div class="btns enter-up d3">
        <a class="btn btn-primary" href="#platforms">See every rating</a>
        ${reviews.length ? '<a class="btn btn-ghost" href="#reviews">Read reviews</a>' : ''}
      </div>
    </div>
    <aside class="scorecard enter-up d2" aria-label="Rating summary">
      <p class="sc-label">Weighted average rating</p>
      <p class="sc-big"><span class="sc-num">${avg}</span><span class="sc-of">/ 5</span></p>
      ${stars(Number(avg), 22)}
      <p class="sc-note">Across ${fmt(ratedReviews)} rated reviews on ${esc(ratedNames)}, weighted by review count.</p>
      <dl class="sc-stats">
        <div><dt>Public reviews</dt><dd>${fmt(totalReviews)}</dd></div>
        <div><dt>Platforms</dt><dd>${platforms.length}</dd></div>
        ${byId.bbb?.grade ? `<div><dt>BBB rating</dt><dd>${esc(byId.bbb.grade)}</dd></div>` : ''}
      </dl>
      <p class="sc-foot">Last checked ${asOfLong}</p>
    </aside>
  </div>
</header>

<main id="main">
  <section id="platforms" class="section" aria-labelledby="platforms-h">
    <div class="wrap">
      <header class="section-head">
        <p class="eyebrow">Ratings by platform</p>
        <h2 id="platforms-h">Griffin Funding ratings on every major review site</h2>
        <p class="section-lede">Each row shows the platform’s own rating and review count, sorted by number of reviews. Select a row to read every review on that site.</p>
      </header>
      <ul class="plist">${byVolume.map(platformRow).join('')}
      </ul>
      <p class="pfoot">Weighted average: <strong>${avg} out of 5</strong> across ${fmt(ratedReviews)} rated reviews. ${esc(unratedNote)} Last checked ${asOfLong}.</p>
    </div>
  </section>
${reviewsSection}
  <section id="faq" class="section" aria-labelledby="faq-h">
    <div class="wrap faq-grid">
      <header class="section-head faq-head">
        <p class="eyebrow">Common questions</p>
        <h2 id="faq-h">Griffin Funding reviews: frequently asked questions</h2>
        <p class="section-lede">Answers use only the figures on this page. Loan questions are best answered by a Griffin Funding loan officer at ${ext(site.mainSite, 'griffinfunding.com')}.</p>
      </header>
      <div class="faq">${faqs.map((f, i) => `
        <details${i === 0 ? ' open' : ''}>
          <summary>${esc(f.q)}</summary>
          <div class="answer">${f.html}</div>
        </details>`).join('')}
      </div>
    </div>
  </section>
</main>

${footer}
${reviews.length ? `<script>
(() => {
  const grid = document.getElementById('review-grid');
  if (!grid) return;
  const cards = [...grid.querySelectorAll('.rcard')];
  const btns = document.querySelectorAll('[data-filter]');
  const more = document.getElementById('show-all');
  let expanded = false, filter = 'all';
  const render = () => {
    grid.classList.toggle('collapsed', filter === 'all' && !expanded);
    cards.forEach((c) => { c.hidden = filter !== 'all' && !c.dataset.types.split(' ').includes(filter); });
    if (more) more.hidden = filter !== 'all' || expanded;
  };
  btns.forEach((b) => b.addEventListener('click', () => {
    filter = b.dataset.filter;
    btns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    render();
  }));
  more?.addEventListener('click', () => {
    expanded = true; render();
    cards[${INITIAL}]?.querySelector('a')?.focus({ preventScroll: true });
  });
  render();
})();
</script>` : ''}
</body>
</html>
`;

const notFound = `<!doctype html>
<html lang="en">
<head>
${head('Page not found · Griffin Funding Reviews', 'This page does not exist.', '\n<meta name="robots" content="noindex">')}
</head>
<body>
${nav(false)}
<main id="main" class="nf">
  <div class="wrap">
    <p class="eyebrow">404</p>
    <h1>This page does not exist.</h1>
    <p class="section-lede">Every Griffin Funding rating and review lives on the home page.</p>
    <p><a class="btn btn-primary" href="/">Go to Griffin Funding reviews</a></p>
  </div>
</main>
${footer}
</body>
</html>
`;

// ---- Machine-readable companions -------------------------------------------

const llms = `# Griffin Funding Reviews

> Ratings and review counts for Griffin Funding (${site.legalName}, NMLS #${site.nmls}), a licensed mortgage lender, gathered from every public review platform. Operated by Griffin Funding. Last checked ${asOf}.

Weighted average rating: ${avg} out of 5 across ${ratedNames} (${fmt(ratedReviews)} rated reviews).
Total public reviews: ${fmt(totalReviews)} across ${counted.length} platforms.

## Platforms

${byVolume.map((p) => `- ${p.name}: ${Number.isFinite(p.rating) ? `${showRating(p.rating)} / 5` : p.grade ? `${p.grade} (letter rating)` : 'star rating not confirmed'}, ${Number.isFinite(p.count) ? `${fmt(p.count)} reviews` : 'count not published'}${p.url ? ` (${p.url})` : ''}`).join('\n')}

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
cpSync(new URL('./static/', import.meta.url), out, { recursive: true });
writeFileSync(new URL('index.html', out), html);
writeFileSync(new URL('404.html', out), notFound);
writeFileSync(new URL('llms.txt', out), llms);
writeFileSync(new URL('robots.txt', out), robots);
writeFileSync(new URL('sitemap.xml', out), sitemap);

console.log(`Built dist/: ${fmt(totalReviews)} reviews, ${avg} weighted avg, ${reviews.length} featured quotes.`);
for (const w of warnings) console.warn(`WARN: ${w}`);
