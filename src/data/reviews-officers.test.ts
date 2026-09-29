import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { reviews, spotlight } from "./reviews.ts";
import { loanOfficers } from "./loan-officers.ts";

const knownIds = new Set(loanOfficers.map((o) => o.id));
const all = [spotlight, ...reviews];

describe("review officer tags", () => {
  it("only references ids that exist in the roster", () => {
    for (const r of all) {
      for (const id of r.officers ?? []) {
        assert.ok(knownIds.has(id), `${r.id} tags unknown officer "${id}"`);
      }
    }
  });

  it("tags the spotlight quote with Jack Iwamoto", () => {
    assert.deepEqual(spotlight.officers, ["jack-iwamoto"]);
  });

  it("tags at least one quote for Guy Troxler", () => {
    const tagged = all.filter((r) => r.officers?.includes("guy-troxler"));
    assert.ok(tagged.length >= 1);
  });

  it("every officer with a tagged quote has a positive Experience.com count", () => {
    const taggedIds = new Set(all.flatMap((r) => r.officers ?? []));
    for (const id of taggedIds) {
      const officer = loanOfficers.find((o) => o.id === id)!;
      assert.ok(officer.experienceCount > 0, id);
    }
  });
});
