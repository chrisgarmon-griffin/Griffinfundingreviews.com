import { useMemo, useState } from "react";
import { reviews, spotlight, type LoanType, type Review } from "@/data/reviews";
import { formatInt, loanTypes } from "@/data/site";
import { Stars } from "@/components/stars";

const INITIAL = 9;
const labelFor = Object.fromEntries(loanTypes.map((item) => [item.id, item.label])) as Record<
  LoanType,
  string
>;

const allQuotes: Review[] = [spotlight, ...reviews];

export function ReviewExplorer() {
  const [filter, setFilter] = useState<LoanType | "all">("all");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);

  const counts = useMemo(() => {
    const map = new Map<LoanType, number>();
    for (const type of loanTypes) map.set(type.id, 0);
    for (const review of allQuotes) {
      for (const type of review.loanTypes) map.set(type, (map.get(type) ?? 0) + 1);
    }
    return map;
  }, []);

  const chips = useMemo(
    () => [...loanTypes].sort((a, b) => (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0)),
    [counts],
  );

  const needle = query.trim().toLowerCase();
  const filtering = filter !== "all" || needle.length > 0;

  function matches(review: Review) {
    const typeOk = filter === "all" || review.loanTypes.includes(filter);
    if (!typeOk) return false;
    if (!needle) return true;
    const hay = `${review.quote} ${review.author} ${review.loanTypes.map((id) => labelFor[id]).join(" ")}`.toLowerCase();
    return hay.includes(needle);
  }

  const spotOk = matches(spotlight);
  const matched = reviews.filter(matches);
  const showAll = expanded || filtering;
  const visibleCount = (spotOk ? 1 : 0) + matched.length;
  const filterLabel = filter === "all" ? "" : ` tagged ${labelFor[filter]}`;

  function choose(next: LoanType | "all") {
    setFilter(next);
    setExpanded(false);
  }

  function collapse() {
    setExpanded(false);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("reviews")?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
  }

  return (
    <>
      <noscript>
        <style>{`.review-card.is-extra{display:flex !important}.more-wrap{display:none !important}`}</style>
      </noscript>

      {spotOk ? <Spotlight review={spotlight} onTag={choose} /> : null}

      <div className="wrap review-rest">
      <div className="tools">
        <div className="filters" role="toolbar" aria-label="Filter selected reviews by loan type">
          <button type="button" aria-pressed={filter === "all"} onClick={() => choose("all")}>
            All
          </button>
          {chips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              aria-pressed={filter === chip.id}
              onClick={() => choose(chip.id)}
            >
              {chip.label}
              <span className="chip-count">{counts.get(chip.id)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="tools-meta">
      <p className="result-line" aria-live="polite">
        {visibleCount === 0
          ? "No selected review matches."
          : filtering
            ? `${formatInt(visibleCount)} selected ${visibleCount === 1 ? "review" : "reviews"}${filterLabel}${needle ? ` matching “${query.trim()}”` : ""}.`
            : `Featured quote above. ${Math.min(showAll ? matched.length : INITIAL, matched.length)} of ${matched.length} more reviews are open.`}
      </p>
        <label className="search">
          <span className="sr-only">Search quotes</span>
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setExpanded(false);
            }}
            placeholder="Search quotes by name, loan, or phrase"
          />
        </label>
      </div>

      {visibleCount === 0 ? (
        <p className="empty">
          The ratings above still include every review on each platform. This filter only searches the quotes selected for this page.
        </p>
      ) : (
        <div className="review-grid" id="review-grid">
          {matched.map((review, index) => (
            <ReviewCard
              key={review.id}
              review={review}
              extra={!showAll && index >= INITIAL}
              onTag={choose}
            />
          ))}
        </div>
      )}

      {!filtering && matched.length > INITIAL ? (
        <div className="more-wrap">
          {expanded ? (
            <button type="button" className="btn btn-line" onClick={collapse}>
              Show fewer
            </button>
          ) : (
            <button type="button" className="btn btn-line" aria-controls="review-grid" onClick={() => setExpanded(true)}>
              Show all {matched.length} reviews
            </button>
          )}
        </div>
      ) : null}
      </div>
    </>
  );
}

function Spotlight({ review, onTag }: { review: Review; onTag: (id: LoanType) => void }) {
  return (
    <figure className="spotlight" id={review.id}>
      <div className="wrap spotlight-grid">
        <div className="spotlight-kicker">
          <p className="eyebrow eyebrow-on-ink">Selected review</p>
          <Stars value={5} size={16} />
          <p className="spotlight-who">
            <span className="who">{review.author}</span>
            <span className="src">
              <time dateTime={review.iso}>{review.date}</time>
              <span aria-hidden="true"> · </span>
              <a href={review.url} target="_blank" rel="noopener noreferrer">
                Google review
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </span>
          </p>
          <TagList review={review} onTag={onTag} />
        </div>
        <blockquote>
          <p>{review.quote}</p>
        </blockquote>
      </div>
    </figure>
  );
}

function ReviewCard({
  review,
  extra,
  onTag,
}: {
  review: Review;
  extra: boolean;
  onTag: (id: LoanType) => void;
}) {
  return (
    <figure className={extra ? "review-card is-extra" : "review-card"} id={review.id}>
      <div className="review-top">
        <Stars value={5} size={14} />
        <TagList review={review} onTag={onTag} />
      </div>
      <blockquote>
        <p>{review.quote}</p>
      </blockquote>
      <figcaption>
        <span className="who">{review.author}</span>
        <span className="src">
          <time dateTime={review.iso}>{review.date}</time>
          <span aria-hidden="true"> · </span>
          <a href={review.url} target="_blank" rel="noopener noreferrer">
            Google review
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </span>
      </figcaption>
    </figure>
  );
}

function TagList({ review, onTag }: { review: Review; onTag: (id: LoanType) => void }) {
  return (
    <ul className="tags" aria-label="Loan types">
      {review.loanTypes.map((id) => (
        <li key={id}>
          <button type="button" className="tag" onClick={() => onTag(id)}>
            {labelFor[id]}
          </button>
        </li>
      ))}
    </ul>
  );
}
