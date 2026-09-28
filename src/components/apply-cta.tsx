import {
  APPLY_URL,
  LEGAL_NAME,
  NMLS,
  PHONE_DISPLAY,
  PHONE_TEL,
} from "@/data/site";
import { track } from "@/lib/track";

export function ApplyCta({ placement }: { placement: string }) {
  return (
    <section id="get-started" className="cta-band" aria-labelledby="cta-h">
      <div className="wrap cta-grid">
        <div className="cta-copy">
          <p className="eyebrow eyebrow-on-ink">
            <span className="eyebrow-mark" aria-hidden="true" />
            Start your loan
          </p>
          <h2 id="cta-h">
            Ready to write the next <em>5-star review?</em>
          </h2>
          <p className="cta-lede">
            Talk with a Griffin Funding loan officer about buying, refinancing,
            or financing an investment property.
          </p>
        </div>
        <div className="cta-actions">
          <div className="btns">
            <a
              className="btn btn-primary btn-lg"
              href={PHONE_TEL}
              onClick={() => track("call_click", { placement })}
            >
              Call {PHONE_DISPLAY}
            </a>
            <a
              className="btn btn-ghost btn-lg"
              href={APPLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("apply_click", { placement })}
            >
              Start your application
              <span className="sr-only">
                {" "}
                on griffinfunding.com (opens in a new tab)
              </span>
            </a>
          </div>
          <p className="cta-fine">
            {LEGAL_NAME} · NMLS #{NMLS} · Equal Housing Lender. Not a commitment
            to lend. All loans are subject to credit approval and underwriting.
          </p>
        </div>
      </div>
    </section>
  );
}
