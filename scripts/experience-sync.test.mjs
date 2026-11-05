import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  isOwnReview,
  officerId,
  renderModule,
  sanitizeReview,
  summarize,
  validate,
} from "./experience-sync.mjs";

const summary = {
  count: 4,
  average_score: "4.50",
  experience_review_count: 3,
  experience_avg_score: "4.67",
};

const reviews = [
  { survey_source_label: "Experience", agent_name: "Sarah Howell at Griffin Funding", score: "5.0" },
  { survey_source_label: "Experience", agent_name: "Sarah Howell", score: "4.0" },
  { survey_source_label: "Experience", agent_name: "Sam  Tebay", score: "5.0" },
  { survey_source_label: "Google", agent_name: null, score: "4.0" },
];

describe("officerId", () => {
  it("strips the company suffix and kebab-cases the name", () => {
    assert.equal(officerId("Sarah Howell at Griffin Funding"), "sarah-howell");
    assert.equal(officerId("Sam  Tebay"), "sam-tebay");
    assert.equal(officerId("KC Dirksen"), "kc-dirksen");
  });
  it("returns null for a missing name", () => {
    assert.equal(officerId(null), null);
    assert.equal(officerId(""), null);
  });
});

describe("summarize", () => {
  const result = summarize(summary, reviews, "2026-11-05");
  it("uses the feed's own-review figure for the company", () => {
    assert.deepEqual(result.company, { rating: 4.67, count: 3 });
    assert.deepEqual(result.blended, { rating: 4.5, count: 4 });
  });
  it("merges an officer's name variants", () => {
    assert.deepEqual(result.officers["sarah-howell"], { rating: 4.5, count: 2 });
    assert.deepEqual(result.officers["sam-tebay"], { rating: 5, count: 1 });
  });
  it("passes validation when the counts agree", () => {
    assert.deepEqual(validate(result), []);
  });
  it("fails validation when the feed disagrees with itself", () => {
    const bad = summarize({ ...summary, experience_review_count: 9 }, reviews, "x");
    assert.ok(validate(bad).some((p) => p.includes("own reviews")));
  });
  it("counts only Experience-labelled reviews as own", () => {
    assert.equal(reviews.filter(isOwnReview).length, 3);
  });
});

describe("privacy", () => {
  const raw = {
    id: 1,
    customer_first_name: "Laytonya",
    customer_last_name: "Carter",
    customer_email: "someone@example.com",
    customer_image: "x.png",
    city: "Atlanta",
    state: "GA",
    survey_completed_on: "2026-11-04T18:20:38.000Z",
    score: "5.0",
    agent_name: "Joe Yaeger at Griffin Funding",
    agent_email: "joe@griffinfunding.com",
    transaction_type: "Cash Out Refinance",
    review: "Great.",
  };
  it("keeps first name and last initial only", () => {
    const clean = sanitizeReview(raw);
    assert.equal(clean.author, "Laytonya C.");
    const text = JSON.stringify(clean);
    assert.ok(!text.includes("Carter"));
    assert.ok(!text.includes("@"));
    assert.ok(!text.includes("x.png"));
  });
  it("never writes review text or names into the generated module", () => {
    const out = renderModule(summarize(summary, [{ ...raw, survey_source_label: "Experience" }], "d"));
    for (const secret of ["Carter", "Laytonya", "someone@example.com", "Great."]) {
      assert.ok(!out.includes(secret), secret);
    }
  });
});
