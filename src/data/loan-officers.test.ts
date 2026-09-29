import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { loanOfficers, officerBySlug, qualifyingOfficers } from "./loan-officers.ts";

describe("loanOfficers roster", () => {
  it("has 29 entries as of the 2026-09-28 check", () => {
    assert.equal(loanOfficers.length, 29);
  });

  it("has a unique, kebab-case id for every officer", () => {
    const ids = loanOfficers.map((o) => o.id);
    assert.equal(new Set(ids).size, ids.length, "ids must be unique");
    for (const id of ids) {
      assert.match(id, /^[a-z]+(-[a-z]+)*$/, id);
    }
  });

  it("gives every officer a positive Experience.com rating and count", () => {
    for (const o of loanOfficers) {
      assert.ok(o.experienceRating > 0 && o.experienceRating <= 5, o.name);
      assert.ok(o.experienceCount > 0, o.name);
    }
  });

  it("points every officer at the verified company profile, never a guessed one", () => {
    for (const o of loanOfficers) {
      assert.equal(
        o.experienceUrl,
        "https://www.experience.com/reviews/company/griffin-funding-1426",
        o.name,
      );
    }
  });
});

describe("officerBySlug", () => {
  it("finds a known officer", () => {
    assert.equal(officerBySlug("guy-troxler")?.name, "Guy Troxler");
  });

  it("returns undefined for an unknown slug", () => {
    assert.equal(officerBySlug("nobody-here"), undefined);
  });
});

describe("qualifyingOfficers", () => {
  it("includes every officer today, since every officer has a positive Experience.com count", () => {
    assert.equal(qualifyingOfficers([]).length, loanOfficers.length);
  });

  it("ignores review ids that aren't in the roster instead of crashing", () => {
    assert.doesNotThrow(() => qualifyingOfficers([{ officers: ["not-a-real-id"] }]));
  });
});
