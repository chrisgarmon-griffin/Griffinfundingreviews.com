import { ReviewExplorer } from "@/components/review-explorer";
import { ApplyCta } from "@/components/apply-cta";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { Stars } from "@/components/stars";
import {
  AS_OF,
  AS_OF_ISO,
  BRAND,
  COMPANY_URL,
  LEGAL_NAME,
  NMLS,
  NMLS_URL,
  TYPICALITY,
  averageScope,
  faqs,
  offices,
  type Listing,
  type Office,
  formatInt,
  formatRating,
  platforms,
  stats,
  type Faq,
  type Inline,
} from "@/data/site";

export function Page() {
  return (
    <>
      <SiteHeader />

      <main id="main">
        <section className="hero" aria-labelledby="page-title">
          <div className="wrap hero-grid">
            <div className="hero-copy">
              <p className="eyebrow eyebrow-on-ink">
                <span className="eyebrow-mark" aria-hidden="true" />
                Third-party ratings
                <span className="eyebrow-dot" aria-hidden="true">
                  ·
                </span>
                {stats.platformCount} review platforms
                <span className="eyebrow-extra">
                  <span className="eyebrow-dot" aria-hidden="true">
                    ·
                  </span>
                  Every source linked
                </span>
              </p>
              <h1 id="page-title">
                Griffin Funding reviews, <em>all in one place.</em>
              </h1>
              <hr className="rule" />
              <div id="citable" className="hero-facts">
                <p className="lede">
                  Every public Griffin Funding rating, gathered from{" "}
                  {stats.platformCount} third-party review platforms and linked
                  to its source.
                </p>
                <ul className="fact-list">
                  <li>
                    <span className="fact-label">Licensed lender</span>
                    <span className="fact-detail">
                      {LEGAL_NAME} ·{" "}
                      <a
                        href={NMLS_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        NMLS #{NMLS}
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </span>
                  </li>
                  <li>
                    <span className="fact-label">Sources</span>
                    <span className="fact-detail">
                      {platforms.map((p) => p.name).join(", ")}
                    </span>
                  </li>
                  <li>
                    <span className="fact-label">Transparency</span>
                    <span className="fact-detail">
                      Every rating links to its full profile, lower ratings
                      included. Operated by {BRAND}.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="hero-side">
              <aside
                id="scorecard"
                className="scorecard"
                aria-label="Rating summary"
              >
                <p className="score-label">Weighted average rating</p>
                <p className="score-big">
                  <span className="score-num">{stats.shownText}</span>
                  <span className="score-of">/ 5</span>
                </p>
                <Stars
                  value={stats.shown}
                  size={18}
                  label={`${stats.shownText} out of 5 stars`}
                />
                <p className="score-note">
                  {averageScope.charAt(0).toUpperCase() + averageScope.slice(1)}
                  , weighted by review count.
                </p>
                <dl className="score-stats">
                  <div>
                    <dt>Public reviews</dt>
                    <dd>{formatInt(stats.total)}</dd>
                  </div>
                  <div>
                    <dt>Platforms</dt>
                    <dd>{stats.platformCount}</dd>
                  </div>
                  <div>
                    <dt>BBB rating</dt>
                    <dd>A+</dd>
                  </div>
                </dl>
                <p className="score-foot">
                  Last checked <time dateTime={AS_OF_ISO}>{AS_OF}</time>
                </p>
              </aside>
              <div className="btns btns-center">
                <a className="btn btn-primary" href="#platforms">
                  See every rating
                </a>
                <a className="btn btn-ghost" href="#reviews">
                  Read selected reviews
                </a>
              </div>
            </div>
          </div>
        </section>

        <section
          id="platforms"
          className="section"
          aria-labelledby="platforms-h"
        >
          <div className="wrap">
            <header className="section-head">
              <p className="eyebrow">
                <span className="eyebrow-mark" aria-hidden="true" />
                Ratings by platform
              </p>
              <h2 id="platforms-h">
                Griffin Funding ratings on every major review site
              </h2>
              <p className="section-lede">
                Sorted by number of reviews. Each row is that platform’s own
                star rating and review count, linked to the full profile.
              </p>
            </header>
            <ol className="ledger">
              {platforms.map((platform, index) => {
                const width = (platform.count / stats.maxCount) * 100;
                const ratingLabel =
                  platform.rating == null
                    ? `${platform.grade}, ${formatInt(platform.count)} reviews`
                    : `${formatRating(platform.rating)} out of 5, ${formatInt(platform.count)} reviews`;
                return (
                  <li key={platform.id} id={platform.id}>
                    <a
                      className="prow"
                      href={platform.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${platform.name}: ${ratingLabel}. View profile, opens in a new tab`}
                    >
                      <span className="p-idx">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="p-meta">
                        <span className="p-name">{platform.name}</span>
                        {platform.note ? (
                          <span className="p-note">{platform.note}</span>
                        ) : null}
                        <span className="vol" aria-hidden="true">
                          <span style={{ width: `${width}%` }} />
                        </span>
                      </span>
                      <span className="p-score">
                        {platform.rating == null ? (
                          <>
                            <span className="p-num">{platform.grade}</span>
                            <span className="p-grade">Letter rating</span>
                          </>
                        ) : (
                          <>
                            <span className="p-num">
                              {formatRating(platform.rating)}
                            </span>
                            <Stars
                              value={platform.rating}
                              size={14}
                              label={ratingLabel}
                            />
                          </>
                        )}
                      </span>
                      <span className="p-count">
                        {formatInt(platform.count)} reviews
                      </span>
                      <span className="p-go">
                        View profile <span aria-hidden="true">→</span>
                      </span>
                    </a>
                  </li>
                );
              })}
            </ol>
            <p className="footnote">
              Weighted average: <strong>{stats.shownText} out of 5</strong>{" "}
              {averageScope}. Experience.com’s blended 4.81 from 3,073 reviews
              recounts Google, Zillow, and Facebook. This page uses
              Experience.com’s own {formatRating(4.88)} from {formatInt(1600)}{" "}
              so those reviews are not counted twice. Last checked{" "}
              <time dateTime={AS_OF_ISO}>{AS_OF}</time>.
            </p>
            <details className="method">
              <summary>
                How these figures were checked
                <svg
                  className="method-chev"
                  viewBox="0 0 16 16"
                  width="16"
                  height="16"
                  aria-hidden="true"
                >
                  <path
                    d="M3.5 6 8 10.5 12.5 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </summary>
              <div className="method-body">
                <p>
                  The average is the sum of rating × review count, divided by
                  total review count, for platforms that publish both. It is
                  shown to one decimal place. The selected quotes do not change
                  the counts.
                </p>
                <div className="method-table-wrap">
                  <table className="method-table">
                    <thead>
                      <tr>
                        <th scope="col">Platform</th>
                        <th scope="col" className="num">
                          Rating
                        </th>
                        <th scope="col" className="num">
                          Reviews
                        </th>
                        <th scope="col">How it was checked</th>
                      </tr>
                    </thead>
                    <tbody>
                      {platforms.map((platform) => (
                        <tr key={platform.id}>
                          <th scope="row" data-label="Platform">
                            {platform.name}
                          </th>
                          <td className="num" data-label="Rating">
                            {platform.rating == null
                              ? platform.grade
                              : formatRating(platform.rating)}
                          </td>
                          <td className="num" data-label="Reviews">
                            {formatInt(platform.count)}
                          </td>
                          <td className="how" data-label="How it was checked">
                            {platform.method}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <th scope="row">Weighted average</th>
                        <td className="num">{stats.shownText}</td>
                        <td className="num" data-label="Reviews">
                          {formatInt(stats.ratedCount)}
                        </td>
                        <td className="how">
                          Checked <time dateTime={AS_OF_ISO}>{AS_OF}</time>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </details>
          </div>
        </section>

        <section
          id="offices"
          className="section section-offices"
          aria-labelledby="offices-h"
        >
          <div className="wrap">
            <header className="section-head">
              <p className="eyebrow">
                <span className="eyebrow-mark" aria-hidden="true" />
                Ratings by office
              </p>
              <h2 id="offices-h">Griffin Funding reviews by office location</h2>
              <p className="section-lede">
                Google and Yelp list each {BRAND} office separately. These are
                the per-office figures behind the combined Google and Yelp rows
                above.
              </p>
            </header>
            <ul className="offices">
              {offices.map((office) => (
                <OfficeCard key={office.id} office={office} />
              ))}
            </ul>
          </div>
        </section>

        <section
          id="reviews"
          className="section section-reviews"
          aria-labelledby="reviews-h"
        >
          <div className="wrap">
            <header className="section-head">
              <p className="eyebrow">
                <span className="eyebrow-mark" aria-hidden="true" />
                In their words
              </p>
              <h2 id="reviews-h">Selected Griffin Funding reviews</h2>
              <p className="section-lede">
                Quoted from Google reviews, with the wording left as written.
                These are selected reviews, not every rating. Names are a first
                name and last initial, or initials when that is how the reviewer
                posted. Client street addresses, phone numbers, and account
                numbers are not included. The ratings above include lower
                scores.
              </p>
              <p className="typicality">{TYPICALITY}</p>
            </header>
          </div>
          <ReviewExplorer />
        </section>

        <ApplyCta placement="home" />

        <section id="faq" className="section" aria-labelledby="faq-h">
          <div className="wrap faq-layout">
            <header className="section-head">
              <p className="eyebrow">
                <span className="eyebrow-mark" aria-hidden="true" />
                Common questions
              </p>
              <h2 id="faq-h">
                Griffin Funding reviews: frequently asked questions
              </h2>
              <p className="section-lede">
                Answers use only the figures on this page. For a loan question,
                start at{" "}
                <a href={COMPANY_URL} target="_blank" rel="noopener noreferrer">
                  griffinfunding.com
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
                .
              </p>
            </header>
            <div className="faq-list">
              {faqs.map((faq, index) => (
                <FaqItem key={faq.id} faq={faq} open={index === 0} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

function FaqItem({ faq, open }: { faq: Faq; open?: boolean }) {
  return (
    <details className="faq-item" id={faq.id} open={open}>
      <summary>
        <h3>{faq.question}</h3>
      </summary>
      <div className="faq-answer">
        {faq.paragraphs.map((paragraph, index) => (
          <p key={index}>
            <Rich nodes={paragraph} />
          </p>
        ))}
        {faq.links ? (
          <ul>
            {faq.links.map((item) => (
              <li key={item.href}>
                <a href={item.href} target="_blank" rel="noopener noreferrer">
                  {item.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </details>
  );
}

function Rich({ nodes }: { nodes: Inline[] }) {
  return nodes.map((node, index) =>
    node.kind === "text" ? (
      <span key={index}>{node.text}</span>
    ) : (
      <a key={index} href={node.href} target="_blank" rel="noopener noreferrer">
        {node.text}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    ),
  );
}

function OfficeCard({ office }: { office: Office }) {
  const place = `${office.city}, ${office.state}`;
  const listed = office.google || office.yelp;
  return (
    <li id={`office-${office.id}`} className="office">
      <h3>
        Griffin Funding{"\u00a0"}– {office.city}
      </h3>
      <p className="office-where">
        {place}
        {office.area ? (
          <span className="office-area">({office.area})</span>
        ) : null}
        {office.label ? (
          <span className="office-label">{office.label}</span>
        ) : null}
      </p>
      <address>
        {office.street}
        <br />
        {office.city}, {office.state} {office.postalCode}
      </address>
      {listed ? (
        <dl className="office-scores">
          {office.google ? (
            <ListingRow name="Google" place={place} listing={office.google} />
          ) : null}
          {office.yelp ? (
            <ListingRow name="Yelp" place={place} listing={office.yelp} />
          ) : null}
        </dl>
      ) : null}
    </li>
  );
}

function ListingRow({
  name,
  place,
  listing,
}: {
  name: string;
  place: string;
  listing: Listing;
}) {
  const label = `${formatRating(listing.rating)} out of 5, ${formatInt(listing.count)} reviews`;
  const body = (
    <>
      <span className="o-num">{formatRating(listing.rating)}</span>
      <Stars value={listing.rating} size={12} label={label} />
      <span className="o-count">{formatInt(listing.count)} reviews</span>
    </>
  );
  return (
    <div>
      <dt>{name}</dt>
      <dd>
        {listing.href ? (
          <a
            href={listing.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${name}, ${place}: ${label}. View listing, opens in a new tab`}
          >
            {body}
          </a>
        ) : (
          body
        )}
      </dd>
    </div>
  );
}
