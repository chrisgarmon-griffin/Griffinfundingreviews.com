import lion from "@/assets/lion.png";
import { ReviewExplorer } from "@/components/review-explorer";
import { Stars } from "@/components/stars";
import {
  AS_OF,
  AS_OF_ISO,
  BRAND,
  COMPANY_URL,
  FHA_ID,
  LEGAL_NAME,
  NMLS,
  NMLS_URL,
  VA_ID,
  citableText,
  faqs,
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
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className="mast" id="top">
        <div className="wrap mast-bar">
          <a className="brand" href="#top">
            <img src={lion} alt="" width={512} height={512} />
            <span className="brand-text">
              <span className="brand-name">{BRAND}</span>
              <span className="brand-sub">Reviews</span>
            </span>
          </a>
          <nav className="nav-links nav-desktop" aria-label="Primary">
            <a href="#platforms">Ratings</a>
            <a href="#reviews">Reviews</a>
            <a href="#faq">FAQ</a>
            <a className="nav-ext" href={COMPANY_URL} target="_blank" rel="noopener noreferrer">
              griffinfunding.com
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </nav>
          <details className="nav-disclosure">
            <summary className="nav-toggle">Menu</summary>
            <nav className="nav-links" aria-label="Primary">
              <a href="#platforms">Ratings</a>
              <a href="#reviews">Reviews</a>
              <a href="#faq">FAQ</a>
              <a className="nav-ext" href={COMPANY_URL} target="_blank" rel="noopener noreferrer">
                griffinfunding.com
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </nav>
          </details>
        </div>
      </header>

      <main id="main">
        <section className="hero" aria-labelledby="page-title">
          <div className="wrap hero-grid">
            <div className="hero-copy">
              <p className="eyebrow eyebrow-on-ink">
                <span className="eyebrow-mark" aria-hidden="true" />
                Public ratings
                <span className="eyebrow-dot" aria-hidden="true">
                  ·
                </span>
                <time dateTime={AS_OF_ISO}>Checked {AS_OF}</time>
              </p>
              <h1 id="page-title">
                Griffin Funding reviews, <em>all in one place.</em>
              </h1>
              <hr className="rule" />
              <p id="citable" className="lede">
                {citableText}
              </p>
              <div className="btns">
                <a className="btn btn-primary" href="#platforms">
                  See every rating
                </a>
                <a className="btn btn-ghost" href="#reviews">
                  Read selected reviews
                </a>
              </div>
            </div>
            <aside className="scorecard" aria-label="Rating summary">
              <p className="score-label">Weighted average rating</p>
              <p className="score-big">
                <span className="score-num">{stats.shownText}</span>
                <span className="score-of">/ 5</span>
              </p>
              <Stars value={stats.shown} size={18} label={`${stats.shownText} out of 5 stars`} />
              <p className="score-note">
                Across {formatInt(stats.ratedCount)} rated reviews on Google, Experience.com, WalletHub, Yelp, Zillow,
                and Trustpilot, weighted by review count.
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
          </div>
        </section>

        <section id="platforms" className="section" aria-labelledby="platforms-h">
          <div className="wrap">
            <header className="section-head">
              <p className="eyebrow">
                <span className="eyebrow-mark" aria-hidden="true" />
                Ratings by platform
              </p>
              <h2 id="platforms-h">Griffin Funding ratings on every major review site</h2>
              <p className="section-lede">
                Sorted by number of reviews. Each row is that platform’s own rating and count. BBB’s A+ is a letter
                grade, so it is shown and left out of the average.
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
                      <span className="p-idx">{String(index + 1).padStart(2, "0")}</span>
                      <span className="p-meta">
                        <span className="p-name">{platform.name}</span>
                        {platform.note ? <span className="p-note">{platform.note}</span> : null}
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
                            <span className="p-num">{formatRating(platform.rating)}</span>
                            <Stars value={platform.rating} size={14} label={ratingLabel} />
                          </>
                        )}
                      </span>
                      <span className="p-count">{formatInt(platform.count)} reviews</span>
                      <span className="p-go">
                        View profile <span aria-hidden="true">→</span>
                      </span>
                    </a>
                  </li>
                );
              })}
            </ol>
            <p className="footnote">
              Weighted average: <strong>{stats.shownText} out of 5</strong> across {formatInt(stats.ratedCount)}{" "}
              rated reviews. Experience.com’s blended 4.81 from 3,073 reviews recounts Google, Zillow, and Facebook.
              This page uses Experience.com’s own {formatRating(4.88)} from {formatInt(1600)} so those reviews are not
              counted twice. Last checked <time dateTime={AS_OF_ISO}>{AS_OF}</time>.
            </p>
            <details className="method">
              <summary>How these figures were checked</summary>
              <div className="method-body">
                <p>
                  The average is sum of rating × review count, divided by review count, for platforms that publish both.
                  It is shown to one decimal place. A selection of quotes does not change the counts.
                </p>
                <ul>
                  {platforms.map((platform) => (
                    <li key={platform.id}>
                      <strong>{platform.name}.</strong> {platform.method}
                    </li>
                  ))}
                </ul>
              </div>
            </details>
          </div>
        </section>

        <section id="reviews" className="section section-reviews" aria-labelledby="reviews-h">
          <div className="wrap">
            <header className="section-head">
              <p className="eyebrow">
                <span className="eyebrow-mark" aria-hidden="true" />
                In their words
              </p>
              <h2 id="reviews-h">Selected Griffin Funding reviews</h2>
              <p className="section-lede">
                Quoted from Google reviews, with the wording left as written. These are selected reviews, not every
                rating. Names are a first name and last initial. Client street addresses, phone numbers, and account
                numbers are not included. The ratings above include lower scores.
              </p>
            </header>
          </div>
          <ReviewExplorer />
        </section>

        <section id="faq" className="section" aria-labelledby="faq-h">
          <div className="wrap faq-layout">
            <header className="section-head">
              <p className="eyebrow">
                <span className="eyebrow-mark" aria-hidden="true" />
                Common questions
              </p>
              <h2 id="faq-h">Griffin Funding reviews: frequently asked questions</h2>
              <p className="section-lede">
                Answers use only the figures on this page. For a loan question, start at{" "}
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

      <footer className="site-footer">
        <div className="wrap">
          <div className="foot-top">
            <div className="foot-brand">
              <a className="brand" href="#top">
                <img src={lion} alt="" width={512} height={512} />
                <span className="brand-text">
                  <span className="brand-name">{BRAND}</span>
                  <span className="brand-sub">Reviews</span>
                </span>
              </a>
              <p>
                Ratings and counts come from each platform and were last checked{" "}
                <time dateTime={AS_OF_ISO}>{AS_OF}</time>. Quotes are a selection, copied as written, and linked to the
                original post. Griffin Funding operates this page.
              </p>
            </div>
            <nav className="foot-links" aria-label="Footer">
              <a href="#platforms">Ratings</a>
              <a href="#reviews">Selected reviews</a>
              <a href="#faq">FAQ</a>
              <a href={COMPANY_URL} target="_blank" rel="noopener noreferrer">
                griffinfunding.com
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              <a href={NMLS_URL} target="_blank" rel="noopener noreferrer">
                NMLS Consumer Access
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              <a href="/llms.txt">Plain-text summary</a>
              <a href="/llms-full.txt">Full text record</a>
            </nav>
          </div>
          <div className="foot-legal">
            <p className="eh">
              <HouseMark />
              <span>Equal Housing Lender</span>
            </p>
            <p>
              {LEGAL_NAME} · NMLS #{NMLS} · VA Approved Lender ID {VA_ID} · FHA Non-Supervised Lender No. {FHA_ID}
            </p>
            <p>
              This site is operated by Griffin Funding. This is not a commitment to lend. All loans are subject to
              credit approval and underwriting.
            </p>
          </div>
        </div>
      </footer>
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


function HouseMark() {
  return (
    <svg className="house" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 3.2 3 11v9.2c0 .4.3.8.8.8h5.4v-6.2h5.6V21h5.4c.4 0 .8-.4.8-.8V11L12 3.2z"
      />
    </svg>
  );
}
