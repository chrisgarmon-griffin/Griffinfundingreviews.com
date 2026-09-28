import { Link } from "@tanstack/react-router";
import { COMPANY_URL } from "@/data/site";

export function NotFound() {
  return (
    <main className="not-found" id="main">
      <p className="eyebrow">404</p>
      <h1>This page is not on Griffin Funding Reviews.</h1>
      <p className="lede">
        The link you followed is not on this site. The ratings, office details,
        and FAQ are on the home page.
      </p>
      <div className="btns">
        <Link className="btn btn-primary" to="/">
          Back to reviews
        </Link>
        <a
          className="btn btn-line"
          href={COMPANY_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          griffinfunding.com
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
    </main>
  );
}
