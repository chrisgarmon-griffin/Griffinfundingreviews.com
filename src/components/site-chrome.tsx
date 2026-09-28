import griffinMark from "@/assets/griffin-mark.png";
import {
  AS_OF,
  AS_OF_ISO,
  BRAND,
  CA_DFPI_CFL,
  CA_DRE,
  COMPANY_URL,
  FHA_ID,
  LEGAL_NAME,
  LICENSING_URL,
  NMLS,
  NMLS_URL,
  TYPICALITY,
  VA_ID,
} from "@/data/site";

/** Section links point at the home page from other pages ("/#faq"), in-page on it ("#faq"). */
type ChromeProps = { home?: boolean };

export function SiteHeader({ home = true }: ChromeProps) {
  const base = home ? "" : "/";
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className="mast" id="top">
        <div className="wrap mast-bar">
          <a className="brand" href={`${base}#top`}>
            <img src={griffinMark} alt="" width={300} height={178} />
            <span className="brand-text">
              <span className="brand-name">{BRAND}</span>
              <span className="brand-sub">Reviews</span>
            </span>
          </a>
          <nav className="nav-links nav-desktop" aria-label="Primary">
            <a href={`${base}#platforms`}>Ratings</a>
            <a href={`${base}#offices`}>Offices</a>
            <a href={`${base}#reviews`}>Reviews</a>
            <a href={`${base}#faq`}>FAQ</a>
            <a
              className="nav-ext"
              href={COMPANY_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              griffinfunding.com
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </nav>
          <details className="nav-disclosure">
            <summary className="nav-toggle">Menu</summary>
            <nav className="nav-links" aria-label="Primary">
              <a href={`${base}#platforms`}>Ratings</a>
              <a href={`${base}#offices`}>Offices</a>
              <a href={`${base}#reviews`}>Reviews</a>
              <a href={`${base}#faq`}>FAQ</a>
              <a
                className="nav-ext"
                href={COMPANY_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                griffinfunding.com
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </nav>
          </details>
        </div>
      </header>
    </>
  );
}

export function SiteFooter({ home = true }: ChromeProps) {
  const base = home ? "" : "/";
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="foot-top">
          <div className="foot-brand">
            <a className="brand" href={`${base}#top`}>
              <img src={griffinMark} alt="" width={300} height={178} />
              <span className="brand-text">
                <span className="brand-name">{BRAND}</span>
                <span className="brand-sub">Reviews</span>
              </span>
            </a>
            <p>
              Ratings and counts come from each platform and were last checked{" "}
              <time dateTime={AS_OF_ISO}>{AS_OF}</time>. Quotes are a selection,
              copied as written, and linked to the original post. Griffin
              Funding operates this page.
            </p>
          </div>
          <nav className="foot-links" aria-label="Footer">
            <div className="foot-col">
              <a href={`${base}#platforms`}>Ratings</a>
              <a href={`${base}#offices`}>Offices</a>
              <a href={`${base}#reviews`}>Selected reviews</a>
              <a href={`${base}#faq`}>FAQ</a>
              <a href="/about">About this site</a>
            </div>
            <div className="foot-col">
              <a href="/contact">Contact</a>
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
            </div>
          </nav>
        </div>
        <div className="foot-legal">
          <p className="eh">
            <HouseMark />
            <span>Equal Housing Lender</span>
          </p>
          <p>
            {LEGAL_NAME} · NMLS #{NMLS} · VA Approved Lender ID {VA_ID} · FHA
            Non-Supervised Lender No. {FHA_ID}
          </p>
          <p>
            California: Licensed by the Department of Financial Protection and
            Innovation under the California Financing Law, License No.{" "}
            {CA_DFPI_CFL}. Real Estate Broker, California Department of Real
            Estate, DRE License #{CA_DRE}, NMLS #{NMLS}. Loans made or arranged
            pursuant to a California Department of Real Estate license.
          </p>
          <p>
            State licensing:{" "}
            <a href={LICENSING_URL} target="_blank" rel="noopener noreferrer">
              see Griffin Funding’s state licenses
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            .
          </p>
          <p>
            This site is operated by Griffin Funding. This is not a commitment
            to lend. All loans are subject to credit approval and underwriting.{" "}
            {TYPICALITY}
          </p>
        </div>
      </div>
    </footer>
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
