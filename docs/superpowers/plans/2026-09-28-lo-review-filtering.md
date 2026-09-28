# Loan Officer Review Filtering (v1.1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a loan-officer filter (one dropdown pill, not one pill per person) to the review grid, plus a dedicated, crawlable `/lo/first-last` page per qualifying loan officer, so each LO can put a personal review link in their email signature.

**Architecture:** A new `src/data/loan-officers.ts` roster (29 current LOs, cross-referenced against Experience.com) sits alongside the existing `src/data/reviews.ts`. Reviews gain an optional `officers: string[]` tag pointing at roster ids. `review-explorer.tsx` gains a second, independent filter dimension (a Radix Select dropdown) that combines with the existing loan-type pills. A new file-based route `src/routes/lo.$slug.tsx` renders the same review grid pre-filtered to one officer, with their Experience.com rating as a linked badge. The existing Markdown-negotiation and sitemap conventions are extended to cover the new pages, matching how `/about` and `/contact` already work.

**Tech Stack:** TanStack Start (React 19) + Vite + Nitro, deployed to Vercel. `@radix-ui/react-select` (already a dependency). Tests run with Node's built-in test runner (`node --test`, `--experimental-strip-types` for `.ts` files) — no new test framework.

## Global Constraints

- Never construct or guess a platform URL. Every `experienceUrl` in the roster links to the already-verified company page (`https://www.experience.com/reviews/company/griffin-funding-1426`, the same URL already in `src/data/site.ts`'s `platforms` array) — individual per-LO deep links on Experience.com were not verified and must not be fabricated.
- Every quote-to-officer tag must be a human-confirmed match, not an automated guess. Four tags in this plan are flagged **LOW CONFIDENCE** (first-name-only or alternate-spelling matches) — leave the `// CONFIRM:` comment in place until a human (Chris) confirms or removes it. Do not silently upgrade a low-confidence tag to unflagged.
- This is v1.1: it does not block the pending v1 launch (compliance sign-off, Netlify/Vercel deploy, DNS), and building it does not wait on that sign-off. But no LO-attributed quote or per-LO Experience.com rating goes live before its own compliance pass (`docs/PROJECT.md` Section 16.7).
- No em dashes in any code comment, commit message, or doc text (house style, `CLAUDE.md`).
- Match existing repo conventions: `node --test` for logic/data tests, no component-rendering test framework, TypeScript `interface`-free `type` aliases (matching `reviews.ts` and `site.ts`), no default exports for data modules.

---

### Task 1: Loan officer roster data model

**Files:**
- Create: `src/data/loan-officers.ts`
- Test: `src/data/loan-officers.test.ts`

**Interfaces:**
- Produces: `type LoanOfficer = { id: string; name: string; title: string; experienceUrl: string; experienceRating: number; experienceCount: number; checked: string; aliases: string[] }`, `export const loanOfficers: LoanOfficer[]`, `export function officerBySlug(slug: string): LoanOfficer | undefined`, `export function qualifyingOfficers(taggedReviews: { officers?: string[] }[]): LoanOfficer[]`.

- [ ] **Step 1: Write the failing test**

```typescript
// src/data/loan-officers.test.ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { loanOfficers, officerBySlug } from "./loan-officers.ts";

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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types --test src/data/loan-officers.test.ts`
Expected: FAIL with "Cannot find module './loan-officers.ts'"

- [ ] **Step 3: Write the roster**

```typescript
// src/data/loan-officers.ts
/**
 * Loan officer roster, cross-referenced against Experience.com's own professional
 * listing for Griffin Funding (https://www.experience.com/reviews/company/griffin-funding-1426),
 * checked 2026-09-28. Ratings and counts drift daily on Experience.com; refresh them the
 * same way platform figures are refreshed (see docs/PROJECT.md Section 11.1 and 16.8).
 *
 * `experienceUrl` always points at the company page, never a guessed per-LO profile URL:
 * individual Experience.com profile links were not verified when this roster was built.
 *
 * `aliases` lists how a name appears in a curated Google quote when it differs from the
 * name here (first name only, or a misspelling). Used to tag reviews.ts by hand; never
 * used to auto-tag without human confirmation.
 */
export type LoanOfficer = {
  id: string;
  name: string;
  title: string;
  experienceUrl: string;
  experienceRating: number;
  experienceCount: number;
  checked: string;
  aliases: string[];
};

const EXPERIENCE_URL =
  "https://www.experience.com/reviews/company/griffin-funding-1426";
const CHECKED = "2026-09-28";

export const loanOfficers: LoanOfficer[] = [
  { id: "cody-unger", name: "Cody Unger", title: "Branch Manager, AZ", experienceUrl: EXPERIENCE_URL, experienceRating: 4.92, experienceCount: 131, checked: CHECKED, aliases: [] },
  { id: "sarah-howell", name: "Sarah Howell", title: "Loan Officer", experienceUrl: EXPERIENCE_URL, experienceRating: 4.83, experienceCount: 259, checked: CHECKED, aliases: ["Sarah"] },
  { id: "guy-troxler", name: "Guy Troxler", title: "Senior Loan Officer", experienceUrl: EXPERIENCE_URL, experienceRating: 4.82, experienceCount: 138, checked: CHECKED, aliases: ["Guy"] },
  { id: "joshua-miller", name: "Joshua Miller", title: "Loan Officer", experienceUrl: EXPERIENCE_URL, experienceRating: 4.9, experienceCount: 64, checked: CHECKED, aliases: [] },
  { id: "kristi-manion", name: "Kristi Manion", title: "Senior Loan Officer", experienceUrl: EXPERIENCE_URL, experienceRating: 4.94, experienceCount: 100, checked: CHECKED, aliases: [] },
  { id: "joe-yaeger", name: "Joe Yaeger", title: "Loan Officer", experienceUrl: EXPERIENCE_URL, experienceRating: 4.93, experienceCount: 220, checked: CHECKED, aliases: ["Joe"] },
  { id: "colby-freer", name: "Colby Freer", title: "Senior Loan Consultant", experienceUrl: EXPERIENCE_URL, experienceRating: 4.83, experienceCount: 192, checked: CHECKED, aliases: [] },
  { id: "jack-iwamoto", name: "Jack Iwamoto", title: "Loan Officer", experienceUrl: EXPERIENCE_URL, experienceRating: 4.95, experienceCount: 47, checked: CHECKED, aliases: ["Jack"] },
  { id: "malcolm-cameron", name: "Malcolm Cameron", title: "Loan Officer", experienceUrl: EXPERIENCE_URL, experienceRating: 4.71, experienceCount: 42, checked: CHECKED, aliases: [] },
  { id: "malik-abiola", name: "Malik Abiola", title: "Mortgage Loan Officer", experienceUrl: EXPERIENCE_URL, experienceRating: 4.92, experienceCount: 37, checked: CHECKED, aliases: [] },
  { id: "denise-tran", name: "Denise Tran", title: "Loan Officer", experienceUrl: EXPERIENCE_URL, experienceRating: 4.98, experienceCount: 34, checked: CHECKED, aliases: [] },
  { id: "andre-shmoldas", name: "Andre Shmoldas", title: "Producing Sales Manager", experienceUrl: EXPERIENCE_URL, experienceRating: 4.93, experienceCount: 26, checked: CHECKED, aliases: ["Andre Schmoldas"] },
  { id: "ryne-sweeney", name: "Ryne Sweeney", title: "Loan Officer", experienceUrl: EXPERIENCE_URL, experienceRating: 4.67, experienceCount: 25, checked: CHECKED, aliases: [] },
  { id: "justin-guthrie", name: "Justin Guthrie", title: "Loan Officer", experienceUrl: EXPERIENCE_URL, experienceRating: 4.94, experienceCount: 19, checked: CHECKED, aliases: ["Justin"] },
  { id: "steve-pintar", name: "Steve Pintar", title: "Loan Officer", experienceUrl: EXPERIENCE_URL, experienceRating: 5.0, experienceCount: 15, checked: CHECKED, aliases: [] },
  { id: "meagan-scheiwe", name: "Meagan Scheiwe", title: "Loan Officer", experienceUrl: EXPERIENCE_URL, experienceRating: 4.92, experienceCount: 12, checked: CHECKED, aliases: ["Megan"] },
  { id: "kc-dirksen", name: "KC Dirksen", title: "Loan Officer", experienceUrl: EXPERIENCE_URL, experienceRating: 4.98, experienceCount: 11, checked: CHECKED, aliases: [] },
  { id: "kent-garner", name: "Kent Garner", title: "Senior Loan Officer", experienceUrl: EXPERIENCE_URL, experienceRating: 4.95, experienceCount: 11, checked: CHECKED, aliases: [] },
  { id: "matt-mccarthy", name: "Matt McCarthy", title: "Loan Officer", experienceUrl: EXPERIENCE_URL, experienceRating: 4.13, experienceCount: 5, checked: CHECKED, aliases: [] },
  { id: "mallorie-faust", name: "Mallorie Faust", title: "Loan Officer", experienceUrl: EXPERIENCE_URL, experienceRating: 5.0, experienceCount: 13, checked: CHECKED, aliases: [] },
  { id: "adam-ruvelson", name: "Adam Ruvelson", title: "Senior Loan Officer", experienceUrl: EXPERIENCE_URL, experienceRating: 4.99, experienceCount: 16, checked: CHECKED, aliases: [] },
  { id: "trey-bedard", name: "Trey Bedard", title: "Loan Officer", experienceUrl: EXPERIENCE_URL, experienceRating: 4.95, experienceCount: 10, checked: CHECKED, aliases: ["Trey"] },
  { id: "jeffrey-elizalde", name: "Jeffrey Elizalde", title: "Loan Officer", experienceUrl: EXPERIENCE_URL, experienceRating: 4.83, experienceCount: 7, checked: CHECKED, aliases: [] },
  { id: "valerie-zatarain", name: "Valerie Zatarain", title: "Loan Officer", experienceUrl: EXPERIENCE_URL, experienceRating: 5.0, experienceCount: 11, checked: CHECKED, aliases: ["Valerie"] },
  { id: "micah-morgan", name: "Micah Morgan", title: "Loan Officer", experienceUrl: EXPERIENCE_URL, experienceRating: 5.0, experienceCount: 3, checked: CHECKED, aliases: [] },
  { id: "gabriel-salazar", name: "Gabriel Salazar", title: "Loan Officer", experienceUrl: EXPERIENCE_URL, experienceRating: 5.0, experienceCount: 6, checked: CHECKED, aliases: ["Gabe"] },
  { id: "pj-vinal", name: "PJ Vinal", title: "Loan Officer", experienceUrl: EXPERIENCE_URL, experienceRating: 4.97, experienceCount: 5, checked: CHECKED, aliases: ["PJ"] },
  { id: "michael-sluja", name: "Michael Sluja", title: "Loan Officer", experienceUrl: EXPERIENCE_URL, experienceRating: 5.0, experienceCount: 2, checked: CHECKED, aliases: [] },
  { id: "morgan-lyons", name: "Morgan Lyons", title: "Mortgage Loan Originator", experienceUrl: EXPERIENCE_URL, experienceRating: 5.0, experienceCount: 2, checked: CHECKED, aliases: [] },
];

export function officerBySlug(slug: string): LoanOfficer | undefined {
  return loanOfficers.find((o) => o.id === slug);
}

/**
 * docs/PROJECT.md Section 16.4: an officer qualifies for a pill and a page if they have
 * a tagged quote or a positive Experience.com count. `taggedReviews` is the review list
 * (each with an optional `officers` array); passed in rather than imported, so this file
 * never has to import reviews.ts just to answer "does this one officer qualify."
 */
export function qualifyingOfficers(
  taggedReviews: { officers?: string[] }[],
): LoanOfficer[] {
  const tagged = new Set(taggedReviews.flatMap((r) => r.officers ?? []));
  return loanOfficers.filter((o) => o.experienceCount > 0 || tagged.has(o.id));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --experimental-strip-types --test src/data/loan-officers.test.ts`
Expected: PASS, all 8 assertions

- [ ] **Step 5: Commit**

```bash
git add src/data/loan-officers.ts src/data/loan-officers.test.ts
git commit -m "Add loan officer roster (Section 16.3)"
```

---

### Task 2: Tag curated quotes with loan officer ids

**Files:**
- Modify: `src/data/reviews.ts`
- Test: `src/data/reviews-officers.test.ts`

**Interfaces:**
- Consumes: `loanOfficers` from Task 1 (`./loan-officers.ts`).
- Modifies: `Review` type gains `officers?: string[]`. Every id in every review's `officers` array must exist in `loanOfficers`.

- [ ] **Step 1: Write the failing test**

```typescript
// src/data/reviews-officers.test.ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types --test src/data/reviews-officers.test.ts`
Expected: FAIL — `spotlight.officers` is `undefined`, not `["jack-iwamoto"]`

- [ ] **Step 3: Add the `officers` field and tag 12 officers across 23 reviews**

In `src/data/reviews.ts`, add one line to the `Review` type:

```typescript
export type Review = {
  id: string;
  author: string;
  date: string;
  iso: string;
  url: string;
  quote: string;
  loanTypes: LoanType[];
  officers?: string[];
};
```

Add `officers` to the spotlight and to the 21 reviews listed below (leave every other review unchanged; most curated quotes name people who are not on the current 29-person roster, e.g. processors and loan partners like "Nina," "Liz," "Shell," and that's expected, not a bug — see `docs/PROJECT.md` Section 16.4).

| Review id | Add `officers:` | Matched from |
|---|---|---|
| `luke-f` (spotlight) | `["jack-iwamoto"]` | "Jack Iwamoto called me immediately" |
| `stefan-s-2` | `["justin-guthrie"]` | "Justin for working tirelessly" (alias "Justin") |
| `candace-r-3` | `["andre-shmoldas"]` | "especially with Andre Shmoldas" |
| `sudamys-p-4` | `["guy-troxler"]` | "working with Guy and NIna" (alias "Guy") |
| `josue-v-5` | `["guy-troxler"]` | "Guy and Nina did an outstanding job" |
| `jennifer-r-6` | `["joe-yaeger"]` | "Joe Yaeger and the team" |
| `nelson-c-7` | `["gabriel-salazar"]` | "Gabe and Liz" (alias "Gabe") — **LOW CONFIDENCE, first name only** |
| `rohit-r-8` | `["andre-shmoldas"]` | "Andre Schmoldas and Jessie Kemer" (alias "Andre Schmoldas") |
| `kenneth-m-9` | `["pj-vinal"]` | "Nate and PJ" (alias "PJ") |
| `elayna-s-11` | `["justin-guthrie"]` | "Justin was great at answering my questions" |
| `allyson-s-13` | `["malik-abiola"]` | "Malik Abiola was my loan officer" |
| `brad-j-14` | `["guy-troxler"]` | "the professionals at Griffin (Guy & Nina)" |
| `marlene-s-15` | `["sarah-howell"]` | "working with Sarah, Nina, and Nick" (alias "Sarah") |
| `meredith-c-16` | `["trey-bedard"]` | "Bill, Taylor, Trey, Ashley, and Nina" (alias "Trey") |
| `ana-s-17` | `["valerie-zatarain"]` | "Thank you Shahla, Molly and Valerie" (alias "Valerie") |
| `jeff-b-20` | `["gabriel-salazar"]` | "Deanna, Gabe, and Liz" (alias "Gabe") — **LOW CONFIDENCE** |
| `steven-g-21` | `["meagan-scheiwe"]` | "Megan & Liz did an excellent job" (alias "Megan") — **LOW CONFIDENCE, alternate spelling** |
| `elizabeth-l-22` | `["gabriel-salazar"]` | "Gabe, Samara, and Liz" (alias "Gabe") — **LOW CONFIDENCE** |
| `karen-k-24` | `["guy-troxler"]` | "Guy Troxler is the best mortgage broker" |
| `kelly-r-26` | `["guy-troxler"]` | "with Guy as my main point of contact" (alias "Guy") |
| `james-c-27` | `["jack-iwamoto"]` | "Jack and Adriana were complete rock stars" (alias "Jack") |
| `theresa-f-28` | `["andre-shmoldas"]` | "Liz Singer and Andre Shmoldas" |
| `christi-s-29` | `["justin-guthrie"]` | "Justin, Shell and everyone else" |

For the four rows marked **LOW CONFIDENCE** (first-name-only or alternate-spelling matches: `nelson-c-7`, `jeff-b-20`, `elizabeth-l-22` → Gabriel Salazar via "Gabe"; `steven-g-21` → Meagan Scheiwe via "Megan"), add this comment directly above the `officers` line on each of those four reviews:

```typescript
    // CONFIRM: matched by first name/alt spelling only ("Gabe" / "Megan"); a human must
    // confirm this is the right person before this ships (docs/PROJECT.md Section 16.3).
    officers: ["gabriel-salazar"],
```

(swap in `["meagan-scheiwe"]` for `steven-g-21`).

- [ ] **Step 4: Run test to verify it passes**

Run: `node --experimental-strip-types --test src/data/reviews-officers.test.ts`
Expected: PASS, all 4 assertions

- [ ] **Step 5: Run the full existing test suite to confirm nothing else broke**

Run: `npm test`
Expected: PASS (the `officers` field is optional and additive; `markdown.test.ts` and `app-data.test.ts` don't inspect it)

- [ ] **Step 6: Commit**

```bash
git add src/data/reviews.ts src/data/reviews-officers.test.ts
git commit -m "Tag curated quotes with loan officer ids (Section 16.3)"
```

---

### Task 3: Officer select dropdown component

**Files:**
- Create: `src/components/officer-select.tsx`
- Modify: `src/styles.css` (append a `.lo-select` block near the existing `.filters` rules)

**Interfaces:**
- Consumes: `LoanOfficer` type from Task 1.
- Produces: `OfficerSelect(props: { officers: { id: string; name: string; count: number }[]; value: string | null; onChange: (id: string | null) => void })` — a React component, default export not used (named export, matching `Stars`/`ReviewExplorer` convention).

- [ ] **Step 1: Write the component**

```typescript
// src/components/officer-select.tsx
import * as Select from "@radix-ui/react-select";

export function OfficerSelect({
  officers,
  value,
  onChange,
}: {
  officers: { id: string; name: string; count: number }[];
  value: string | null;
  onChange: (id: string | null) => void;
}) {
  return (
    <Select.Root
      value={value ?? "all"}
      onValueChange={(next) => onChange(next === "all" ? null : next)}
    >
      <Select.Trigger className="lo-select-trigger" aria-label="Filter by loan officer">
        <Select.Value placeholder="Loan officer" />
        <Select.Icon className="lo-select-icon">
          <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
            <path
              d="M3.5 6 8 10.5 12.5 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="lo-select-content" position="popper" sideOffset={6}>
          <Select.Viewport>
            <Select.Item value="all" className="lo-select-item">
              <Select.ItemText>All loan officers</Select.ItemText>
            </Select.Item>
            {officers.map((officer) => (
              <Select.Item key={officer.id} value={officer.id} className="lo-select-item">
                <Select.ItemText>
                  {officer.name} ({officer.count})
                </Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
```

- [ ] **Step 2: Add matching styles**

`src/styles.css` already has one shared rule for both the loan-type pills and the tags on each review card, at the selector `.filters button, .tag` (around line 1092): `min-height: 2.75rem`, `border-radius: 999px`, `border: 1px solid var(--color-line-strong)`, `background: var(--color-card)`, `color: var(--color-fg)`. Add `.lo-select-trigger` to that same selector group instead of duplicating the rule, so the dropdown trigger is pixel-identical to the pills next to it:

```css
.filters button,
.tag,
.lo-select-trigger {
  font: inherit;
  min-height: 2.75rem;
  border-radius: 999px;
  border: 1px solid var(--color-line-strong);
  background: var(--color-card);
  color: var(--color-fg);
  padding: 0.4rem 0.85rem;
  font-size: 0.9rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  transition: background-color 150ms var(--ease), color 150ms var(--ease), border-color 150ms var(--ease);
}
```

(That's the existing rule at line 1092 with `.lo-select-trigger` added to the selector list — do not duplicate the declarations in a new block.)

Then append the parts that have no existing equivalent (the open state, the popover, and its items) after the `.search input` rule:

```css
.lo-select-trigger[data-state="open"],
.lo-select-trigger[data-placeholder="false"] {
  border-color: var(--color-ink);
}

.lo-select-content {
  background: var(--color-card);
  border: 1px solid var(--color-line-strong);
  border-radius: 12px;
  max-height: 320px;
  overflow: auto;
  z-index: 40;
}

.lo-select-item {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  outline: none;
}

.lo-select-item[data-highlighted] {
  background: var(--color-paper-deep);
}

.lo-full-page-link {
  font-size: 0.85rem;
  color: var(--color-accent);
  margin-left: 0.6rem;
}

.lo-filter {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 0.6rem;
}
```

No `box-shadow` here: `src/styles.css` has no shadow custom property, and the one comparable overlay panel it already has (`.nav-disclosure[open] .nav-links`, the mobile nav dropdown) separates itself from the page with a background and border only, no drop shadow. This matches `docs/King_UI-DESIGN-SYSTEM.md`'s stated preference for "a soft one-pixel shadow instead of drop shadows," so `.lo-select-content` follows the same border-only pattern rather than introducing the first heavy shadow in the file.

- [ ] **Step 3: Verify visually**

This component has no automated render test (the repo's test runner is Node's `node --test`, not a browser/DOM test harness, and adding one for a single component would violate "don't add a new test framework for one test"). Verify manually once wired into Task 4, via the dev server (`npm run dev`), by opening the dropdown and confirming it lists officers with counts and closes on selection.

- [ ] **Step 4: Commit**

```bash
git add src/components/officer-select.tsx src/styles.css
git commit -m "Add loan officer select dropdown component (Section 16.5)"
```

---

### Task 4: Wire the officer filter into the review grid

**Files:**
- Modify: `src/components/review-explorer.tsx`

**Interfaces:**
- Consumes: `OfficerSelect` (Task 3), `loanOfficers`/`officerBySlug` (Task 1), `Review.officers` (Task 2).
- Produces: `ReviewExplorer(props?: { initialOfficer?: string })` — adds an optional prop so Task 5's route can preset the filter. Existing callers (`page.tsx`'s `<ReviewExplorer />`) keep working with no changes since the prop is optional.

- [ ] **Step 1: Add officer state and filtering logic**

In `src/components/review-explorer.tsx`, add these imports:

```typescript
import { loanOfficers, qualifyingOfficers } from "@/data/loan-officers";
import { OfficerSelect } from "@/components/officer-select";
```

Change the component signature and add officer state, right after the existing `filter`/`query`/`expanded` state:

```typescript
export function ReviewExplorer({ initialOfficer }: { initialOfficer?: string } = {}) {
  const [filter, setFilter] = useState<LoanType | "all">("all");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [officerFilter, setOfficerFilter] = useState<string | null>(
    initialOfficer ?? null,
  );
```

Compute the dropdown list: every qualifying officer (docs/PROJECT.md Section 16.4 — today, all 29), each with how many of the quotes on this page name them (0 for most, since only 12 have a tagged quote today):

```typescript
  const officerCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const review of allQuotes) {
      for (const id of review.officers ?? []) {
        map.set(id, (map.get(id) ?? 0) + 1);
      }
    }
    return map;
  }, []);

  const officerOptions = useMemo(
    () =>
      qualifyingOfficers(allQuotes)
        .map((o) => ({ id: o.id, name: o.name, count: officerCounts.get(o.id) ?? 0 }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
    [officerCounts],
  );
```

Extend `matches()` to also check the officer filter, and extend `filtering`:

```typescript
  const needle = query.trim().toLowerCase();
  const filtering = filter !== "all" || needle.length > 0 || officerFilter !== null;

  function matches(review: Review) {
    const typeOk = filter === "all" || review.loanTypes.includes(filter);
    if (!typeOk) return false;
    const officerOk = officerFilter === null || (review.officers?.includes(officerFilter) ?? false);
    if (!officerOk) return false;
    if (!needle) return true;
    const hay = `${review.quote} ${review.author} ${review.loanTypes.map((id) => labelFor[id]).join(" ")}`.toLowerCase();
    return hay.includes(needle);
  }
```

- [ ] **Step 2: Render the dropdown and a "View full page" link**

In the `.tools` block, right after the closing `</div>` of `.filters`, add:

```tsx
        {officerOptions.length > 0 ? (
          <div className="lo-filter">
            <OfficerSelect
              officers={officerOptions}
              value={officerFilter}
              onChange={(id) => {
                setOfficerFilter(id);
                setExpanded(false);
              }}
            />
            {officerFilter ? (
              <a className="lo-full-page-link" href={`/lo/${officerFilter}`}>
                View {loanOfficers.find((o) => o.id === officerFilter)?.name}'s full page
              </a>
            ) : null}
          </div>
        ) : null}
```

- [ ] **Step 3: Verify manually**

Run `npm run dev`, open the home page, confirm the "Loan officer" dropdown lists all 29 qualifying officers (sorted by quote count, then name), each showing a count (0 for most). Select "Guy Troxler": confirm the grid narrows to his 5 tagged quotes and a "View Guy Troxler's full page" link appears pointing at `/lo/guy-troxler`. Combine with a loan-type pill and confirm both filters apply together (AND, not OR). Then select "Micah Morgan" (0 tagged quotes): confirm the grid shows "No selected review matches" while the "View Micah Morgan's full page" link still appears, since his `/lo/` page shows his Experience.com rating regardless of quote count.

- [ ] **Step 4: Commit**

```bash
git add src/components/review-explorer.tsx
git commit -m "Filter the review grid by loan officer (Section 16.5)"
```

---

### Task 5: `/lo/$slug` route and page

**Files:**
- Create: `src/routes/lo.$slug.tsx`
- Create: `src/components/officer-page.tsx`

**Interfaces:**
- Consumes: `officerBySlug` (Task 1), `ReviewExplorer` with `initialOfficer` prop (Task 4), `NotFound` (existing), `SiteHeader`/`SiteFooter` (existing, from `site-chrome.tsx`).
- Produces: the live route `/lo/:slug`.

- [ ] **Step 1: Write the officer page view**

```typescript
// src/components/officer-page.tsx
import { ReviewExplorer } from "@/components/review-explorer";
import { ApplyCta } from "@/components/apply-cta";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { Stars } from "@/components/stars";
import { formatInt, formatRating } from "@/data/site";
import type { LoanOfficer } from "@/data/loan-officers";

export function OfficerPageView({ officer }: { officer: LoanOfficer }) {
  const label = `${formatRating(officer.experienceRating)} out of 5, ${formatInt(officer.experienceCount)} Experience.com reviews`;
  return (
    <>
      <SiteHeader home={false} />
      <main id="main" className="info">
        <div className="wrap info-wrap">
          <p className="eyebrow">
            <span className="eyebrow-mark" aria-hidden="true" />
            Griffin Funding Reviews
          </p>
          <h1>{officer.name}'s Griffin Funding reviews</h1>
          <p className="info-lede">{officer.title} at Griffin Funding.</p>
          <a
            className="officer-experience-badge"
            href={officer.experienceUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${label}. View on Experience.com, opens in a new tab`}
          >
            <span className="oe-num">{formatRating(officer.experienceRating)}</span>
            <Stars value={officer.experienceRating} size={14} label={label} />
            <span className="oe-count">{formatInt(officer.experienceCount)} Experience.com reviews</span>
          </a>
          <p className="officer-checked">Checked {officer.checked}.</p>
        </div>
      </main>
      <ReviewExplorer initialOfficer={officer.id} />
      <ApplyCta placement={`lo-${officer.id}`} />
      <SiteFooter home={false} />
    </>
  );
}
```

- [ ] **Step 2: Write the route**

```typescript
// src/routes/lo.$slug.tsx
import { createFileRoute, notFound } from "@tanstack/react-router";
import { officerBySlug, qualifyingOfficers } from "@/data/loan-officers";
import { reviews, spotlight } from "@/data/reviews";
import { OfficerPageView } from "@/components/officer-page";
import { SITE_URL } from "@/data/site";

const allReviews = [spotlight, ...reviews];

export const Route = createFileRoute("/lo/$slug")({
  loader: ({ params }) => {
    const officer = officerBySlug(params.slug);
    const qualifies =
      officer && qualifyingOfficers(allReviews).some((o) => o.id === officer.id);
    if (!qualifies) throw notFound();
    return officer!;
  },
  head: ({ loaderData: officer }) => {
    if (!officer) return {};
    const url = `${SITE_URL}lo/${officer.id}`;
    const title = `${officer.name}'s Griffin Funding Reviews`;
    const description = `${officer.name}, ${officer.title} at Griffin Funding: ${officer.experienceRating} out of 5 on Experience.com from ${officer.experienceCount} reviews, plus selected Google reviews that name them.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:type", content: "profile" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { name: "robots", content: "index, follow" },
      ],
      links: [
        { rel: "canonical", href: url },
        {
          rel: "alternate",
          href: `/lo/${officer.id}`,
          type: "text/markdown",
          title: "Markdown version",
        },
      ],
    };
  },
  component: () => <OfficerPageView officer={Route.useLoaderData()} />,
});
```

- [ ] **Step 3: Verify manually**

Run `npm run dev`, visit `http://localhost:8080/lo/guy-troxler`: confirm it shows "Guy Troxler's Griffin Funding reviews," his Experience.com badge (4.82, 138 reviews, linking out), and a review grid pre-filtered to his 5 tagged quotes with the loan-officer dropdown already set to his name. Visit `http://localhost:8080/lo/nobody-here`: confirm the existing 404 page renders (via `notFound()` bubbling to the root route's `notFoundComponent`).

- [ ] **Step 4: Commit**

```bash
git add src/routes/lo.\$slug.tsx src/components/officer-page.tsx
git commit -m "Add per-officer review pages at /lo/:slug (Section 16.6)"
```

---

### Task 6: Markdown negotiation for officer pages

**Files:**
- Modify: `src/lib/agent/markdown.ts`
- Modify: `src/lib/agent/markdown.test.ts`

**Interfaces:**
- Consumes: `loanOfficers`/`officerBySlug` (Task 1), `reviews`/`spotlight` (already imported in `markdown.ts`).
- Produces: `officerMarkdown(officer: LoanOfficer): string`; extends `markdownForPath(path: string): string | null` to also resolve `/lo/<slug>`.

- [ ] **Step 1: Write the failing tests**

Add to `src/lib/agent/markdown.test.ts`. This file does not currently import `reviews`/`spotlight` (only `homeMarkdown` needs them, and it gets them internally from `markdown.ts`), so both imports below are new:

```typescript
import { reviews, spotlight } from "../../data/reviews.ts";
import { loanOfficers, qualifyingOfficers } from "../../data/loan-officers.ts";

describe("markdownForPath: officer pages", () => {
  it("serves Markdown for a known officer", () => {
    const md = markdownForPath("/lo/guy-troxler");
    assert.ok(md, "expected Markdown, got null");
    assert.match(md!, /^# Guy Troxler's Griffin Funding Reviews/);
    assert.ok(md!.includes("4.82"));
    assert.ok(md!.includes("138"));
  });

  it("returns null for an unknown officer slug", () => {
    assert.equal(markdownForPath("/lo/nobody-here"), null);
  });

  it("has a page for every currently qualifying officer", () => {
    for (const o of qualifyingOfficers([spotlight, ...reviews])) {
      assert.ok(markdownForPath(`/lo/${o.id}`), o.id);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types --test src/lib/agent/markdown.test.ts`
Expected: FAIL — `markdownForPath("/lo/guy-troxler")` returns `null`

- [ ] **Step 3: Implement `officerMarkdown` and extend `markdownForPath`**

Add to `src/lib/agent/markdown.ts` (near `infoPageMarkdown`):

```typescript
import {
  officerBySlug,
  qualifyingOfficers,
  type LoanOfficer,
} from "../../data/loan-officers.ts";

export function officerMarkdown(officer: LoanOfficer): string {
  const quote = (text: string) =>
    text
      .split("\n")
      .map((line) => `> ${line}`)
      .join("\n");
  const matches = [spotlight, ...reviews].filter((r) =>
    r.officers?.includes(officer.id),
  );
  return [
    `# ${officer.name}'s Griffin Funding Reviews`,
    "",
    `> ${officer.title} at Griffin Funding.`,
    "",
    `**Experience.com: ${formatRating(officer.experienceRating)} out of 5** from ${formatInt(officer.experienceCount)} reviews (checked ${officer.checked}). [View on Experience.com](${officer.experienceUrl})`,
    "",
    matches.length
      ? `## Selected Google reviews naming ${officer.name}`
      : `No selected Google quote names ${officer.name} yet.`,
    "",
    ...matches.flatMap((r) => [
      quote(r.quote),
      "",
      `${r.author}, ${r.date}, [original review](${r.url})`,
      "",
    ]),
    footer,
    "",
  ].join("\n");
}
```

Extend `markdownForPath`:

```typescript
export function markdownForPath(path: string): string | null {
  const normalized = path.length > 1 ? path.replace(/\/+$/, "") : path;
  if (normalized === "/" || normalized === "") return homeMarkdown();
  if (normalized.startsWith("/lo/")) {
    const officer = officerBySlug(normalized.slice("/lo/".length));
    const qualifies =
      officer && qualifyingOfficers([spotlight, ...reviews]).some((o) => o.id === officer.id);
    return qualifies ? officerMarkdown(officer!) : null;
  }
  const page = infoPages.find((p) => p.path === normalized);
  return page ? infoPageMarkdown(page) : null;
}
```

Also add every `/lo/<slug>` link to `notFoundMarkdown`'s page list so the 404 Markdown response can point agents at the roster:

```typescript
export function notFoundMarkdown(path: string): string {
  return [
    "# 404: page not found",
    "",
    `There is no page at \`${path}\` on Griffin Funding Reviews.`,
    "",
    "Pages on this site:",
    "",
    `- [Griffin Funding reviews and ratings](${SITE_URL})`,
    ...infoPages.map(
      (page) => `- [${page.heading}](${SITE_URL}${page.path.slice(1)})`,
    ),
    ...qualifyingOfficers([spotlight, ...reviews]).map(
      (o) => `- [${o.name}'s Griffin Funding reviews](${SITE_URL}lo/${o.id})`,
    ),
    "",
    `A plain-text summary is at [llms.txt](${SITE_URL}llms.txt), and every page is listed in the [sitemap](${SITE_URL}sitemap.xml).`,
    "",
  ].join("\n");
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --experimental-strip-types --test src/lib/agent/markdown.test.ts`
Expected: PASS, all 3 new assertions plus the pre-existing ones in this file

- [ ] **Step 5: Run the full test suite**

Run: `npm test`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/lib/agent/markdown.ts src/lib/agent/markdown.test.ts
git commit -m "Serve Markdown for /lo/:slug pages (Section 16.6)"
```

---

### Task 7: Sitemap entries for officer pages

**Files:**
- Modify: `public/sitemap.xml`

**Interfaces:**
- None (static file, mechanical addition).

- [ ] **Step 1: Add one `<url>` block per roster entry**

`public/sitemap.xml` is hand-maintained (there is no generator script in this repo; `/about` and `/contact` were added the same way). Insert 29 entries, one per officer in `src/data/loan-officers.ts`, before the closing `</urlset>` tag:

```xml
  <url>
    <loc>https://griffinfundingreviews.com/lo/cody-unger</loc>
    <lastmod>2026-09-28</lastmod>
  </url>
  <url>
    <loc>https://griffinfundingreviews.com/lo/sarah-howell</loc>
    <lastmod>2026-09-28</lastmod>
  </url>
  <url>
    <loc>https://griffinfundingreviews.com/lo/guy-troxler</loc>
    <lastmod>2026-09-28</lastmod>
  </url>
  <url>
    <loc>https://griffinfundingreviews.com/lo/joshua-miller</loc>
    <lastmod>2026-09-28</lastmod>
  </url>
  <url>
    <loc>https://griffinfundingreviews.com/lo/kristi-manion</loc>
    <lastmod>2026-09-28</lastmod>
  </url>
  <url>
    <loc>https://griffinfundingreviews.com/lo/joe-yaeger</loc>
    <lastmod>2026-09-28</lastmod>
  </url>
  <url>
    <loc>https://griffinfundingreviews.com/lo/colby-freer</loc>
    <lastmod>2026-09-28</lastmod>
  </url>
  <url>
    <loc>https://griffinfundingreviews.com/lo/jack-iwamoto</loc>
    <lastmod>2026-09-28</lastmod>
  </url>
  <url>
    <loc>https://griffinfundingreviews.com/lo/malcolm-cameron</loc>
    <lastmod>2026-09-28</lastmod>
  </url>
  <url>
    <loc>https://griffinfundingreviews.com/lo/malik-abiola</loc>
    <lastmod>2026-09-28</lastmod>
  </url>
  <url>
    <loc>https://griffinfundingreviews.com/lo/denise-tran</loc>
    <lastmod>2026-09-28</lastmod>
  </url>
  <url>
    <loc>https://griffinfundingreviews.com/lo/andre-shmoldas</loc>
    <lastmod>2026-09-28</lastmod>
  </url>
  <url>
    <loc>https://griffinfundingreviews.com/lo/ryne-sweeney</loc>
    <lastmod>2026-09-28</lastmod>
  </url>
  <url>
    <loc>https://griffinfundingreviews.com/lo/justin-guthrie</loc>
    <lastmod>2026-09-28</lastmod>
  </url>
  <url>
    <loc>https://griffinfundingreviews.com/lo/steve-pintar</loc>
    <lastmod>2026-09-28</lastmod>
  </url>
  <url>
    <loc>https://griffinfundingreviews.com/lo/meagan-scheiwe</loc>
    <lastmod>2026-09-28</lastmod>
  </url>
  <url>
    <loc>https://griffinfundingreviews.com/lo/kc-dirksen</loc>
    <lastmod>2026-09-28</lastmod>
  </url>
  <url>
    <loc>https://griffinfundingreviews.com/lo/kent-garner</loc>
    <lastmod>2026-09-28</lastmod>
  </url>
  <url>
    <loc>https://griffinfundingreviews.com/lo/matt-mccarthy</loc>
    <lastmod>2026-09-28</lastmod>
  </url>
  <url>
    <loc>https://griffinfundingreviews.com/lo/mallorie-faust</loc>
    <lastmod>2026-09-28</lastmod>
  </url>
  <url>
    <loc>https://griffinfundingreviews.com/lo/adam-ruvelson</loc>
    <lastmod>2026-09-28</lastmod>
  </url>
  <url>
    <loc>https://griffinfundingreviews.com/lo/trey-bedard</loc>
    <lastmod>2026-09-28</lastmod>
  </url>
  <url>
    <loc>https://griffinfundingreviews.com/lo/jeffrey-elizalde</loc>
    <lastmod>2026-09-28</lastmod>
  </url>
  <url>
    <loc>https://griffinfundingreviews.com/lo/valerie-zatarain</loc>
    <lastmod>2026-09-28</lastmod>
  </url>
  <url>
    <loc>https://griffinfundingreviews.com/lo/micah-morgan</loc>
    <lastmod>2026-09-28</lastmod>
  </url>
  <url>
    <loc>https://griffinfundingreviews.com/lo/gabriel-salazar</loc>
    <lastmod>2026-09-28</lastmod>
  </url>
  <url>
    <loc>https://griffinfundingreviews.com/lo/pj-vinal</loc>
    <lastmod>2026-09-28</lastmod>
  </url>
  <url>
    <loc>https://griffinfundingreviews.com/lo/michael-sluja</loc>
    <lastmod>2026-09-28</lastmod>
  </url>
  <url>
    <loc>https://griffinfundingreviews.com/lo/morgan-lyons</loc>
    <lastmod>2026-09-28</lastmod>
  </url>
```

- [ ] **Step 2: Verify the count matches the roster**

Run: `grep -c '<loc>https://griffinfundingreviews.com/lo/' public/sitemap.xml`
Expected: `29`

Run: `node --experimental-strip-types -e "import('./src/data/loan-officers.ts').then(m => console.log(m.loanOfficers.length))"`
Expected: `29` (matches the sitemap count)

- [ ] **Step 3: Commit**

```bash
git add public/sitemap.xml
git commit -m "List loan officer pages in the sitemap (Section 16.6)"
```

---

## After all tasks: full verification pass

- [ ] Run `npm test` — every test file passes, including the four new ones.
- [ ] Run `npm run typecheck` — no new type errors.
- [ ] Run `npm run lint` — no new lint errors.
- [ ] Run `npm run dev`, manually walk: home page dropdown filter and combination with a loan-type pill (Task 4), one populated `/lo/<slug>` page (Task 5), one unpopulated one to confirm it still shows a real Experience.com badge with zero quotes (e.g. `/lo/micah-morgan`), and one unknown slug for the 404 (Task 5).
- [ ] Confirm the four `// CONFIRM:` low-confidence tags are still visible in `git diff` or `grep -rn "CONFIRM:" src/data/reviews.ts` — they must reach Chris for a real-name confirmation before this goes live, per `docs/PROJECT.md` Section 16.7.
- [ ] Do not merge to `main` until Section 16.7's compliance pass on the LO-attributed quotes and the four low-confidence tags is recorded, per the Section 12 open items added for this feature.
