import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { apply, rules } from "./refresh-llms.mjs";

const fake = {
  stats: { shownText: "4.8", ratedCount: 4000 },
  experience: { company: { rating: 4.9, count: 1800 }, blended: { rating: 4.83, count: 3300 } },
  formatInt: (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ","),
  formatRating: (n) => String(n),
};

describe("refresh-llms", () => {
  it("rewrites the Experience.com and total figures", () => {
    const text = [
      "a weighted average of 4.8 out of 5 across 3,795 reviews on 7 platforms",
      "Experience.com is counted as its own 4.88 from 1,600 reviews. The blended 4.81 from 3,073 recounts",
      "- Experience.com: 4.88 / 5, 1,600 reviews (x)",
    ].join("\n");
    const out = apply("llms.txt", text, rules(fake));
    assert.match(out, /across 4,000 reviews/);
    assert.match(out, /own 4.9 from 1,800 reviews\. The blended 4.83 from 3,300/);
    assert.match(out, /- Experience\.com: 4.9 \/ 5, 1,800 reviews/);
  });
  it("refuses when a line it expects is missing", () => {
    assert.throws(() => apply("llms.txt", "nothing here", rules(fake)), /expected 1 match/);
  });
});
