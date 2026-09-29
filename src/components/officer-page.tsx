import { ReviewExplorer } from "@/components/review-explorer";
import { ApplyCta } from "@/components/apply-cta";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { Stars } from "@/components/stars";
import { formatInt, formatRating } from "@/data/site";
import { teamProfileUrl, type LoanOfficer } from "@/data/loan-officers";

export function OfficerPageView({ officer }: { officer: LoanOfficer }) {
  const label = `${formatRating(officer.experienceRating)} out of 5, ${formatInt(officer.experienceCount)} Experience.com reviews`;
  return (
    <>
      <SiteHeader home={false} />
      <main id="main" className="info">
        <div className="wrap">
          <p className="eyebrow">
            <span className="eyebrow-mark" aria-hidden="true" />
            Griffin Funding Reviews
          </p>
          <h1>{officer.name}'s Griffin Funding reviews</h1>
          <p className="info-lede">{officer.title} at Griffin Funding.</p>
          <p className="officer-team-link">
            <a href={teamProfileUrl(officer)}>
              {officer.name.split(" ")[0]}'s Griffin Funding profile:
              specialties, licensed states and NMLS
            </a>
          </p>
          <a
            className="officer-experience-badge"
            href={officer.experienceUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${label}. View on Experience.com, opens in a new tab`}
          >
            <span className="oe-num">
              {formatRating(officer.experienceRating)}
            </span>
            <Stars value={officer.experienceRating} size={14} label={label} />
            <span className="oe-count">
              {formatInt(officer.experienceCount)} Experience.com reviews
            </span>
          </a>
          <p className="officer-checked">Checked {officer.checked}.</p>
        </div>
      </main>
      <section className="section section-reviews">
        <ReviewExplorer
          initialOfficer={officer.id}
          suppressFullPageLinkFor={officer.id}
        />
      </section>
      <ApplyCta placement={`lo-${officer.id}`} />
      <SiteFooter home={false} />
    </>
  );
}
