# UI Design System

**A portable visual system. Drop this file into any project's docs folder and hand it to a designer or an AI assistant as the styling brief — it describes *how things look and behave*, not what the product does.**

Source: extracted directly from a production React app's stylesheet (a single `styles.css`, no CSS framework, no component library). Everything below is copy-paste-ready CSS using custom properties, plus the structural rules for how components are built from them. Nothing here references any product, brand, or business domain — swap the token *values* for a new brand and every component keeps working.

---

## 0. Philosophy

Four rules hold the whole system together:

1. **Tokens once, at the root. Components never hardcode a raw color.** Every color a component uses is a `var(--color-*)` reference. To re-skin the entire product, edit the `:root` block — nothing else.
2. **Two surfaces, two palettes.** The main content area is a light, warm, editorial surface. The navigation rail and top bar are a separate dark surface with their own token set (`--color-side-*`). A component never mixes the two palettes.
3. **One accent color, used sparingly.** A single brand accent marks the one thing that matters on a screen: the active nav item, a call-to-action button, an eyebrow label, a required-field asterisk, a left-edge rule on a highlighted card. It is never used for large fills or body text.
4. **Density before decoration.** Radii are small (4–16px), shadows are a single soft "border-replacement" shadow rather than a drop shadow, and most emphasis comes from spacing, weight, and a thin rule — not color or elevation.

---

## 1. Design tokens

Paste this block once, at the top of your global stylesheet. Every other rule in this document references these variables.

```css
:root {
  /* Light surface (main content) */
  --color-background: #f3f1ee;
  --color-foreground: #141311;
  --color-card: #ffffff;
  --color-primary: #141311;
  --color-primary-foreground: #f7f5f2;
  --color-secondary: #ece9e4;
  --color-muted: #ece9e4;
  --color-muted-foreground: #3e4754;
  --color-faint: #4a5563;
  --color-border: #e2dcd4;
  --color-input: #e2dcd4;
  --color-line-strong: #c9c2b8;

  /* Accent (swap this one color to re-brand) */
  --color-brand: #bd0c0c;
  --color-brand-hover: #970a0a;
  --color-brand-soft: #f8e6e6;
  --color-ring: #bd0c0c;

  /* Status */
  --color-warn: #a5620d;
  --color-warn-soft: #faf0df;
  --color-ok: #1f7a4d;
  --color-ok-soft: #e7f3ec;

  /* Dark surface (nav rail + top bar) */
  --color-side: #0b0c0f;
  --color-side-2: #14151a;
  --color-side-text: #f3f4f6;
  --color-side-muted: #c8ced8;
  --color-side-strong: #ffffff;
  --color-side-fill: rgba(255, 255, 255, 0.07);
  --color-side-line: rgba(255, 255, 255, 0.1);

  /* Type */
  --font-sans: "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif;
  --font-display: "Newsreader", Georgia, "Times New Roman", serif;
  --font-mono:
    "IBM Plex Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace;

  /* Radius scale */
  --radius-xs: 4px;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;

  /* Shadow: a soft 1px border plus a faint lift. No hard drop shadows. */
  --shadow-border:
    0 0 0 1px rgb(20 19 17 / 0.06), 0 1px 2px -1px rgb(20 19 17 / 0.06),
    0 2px 8px 0 rgb(20 19 17 / 0.04);
  --shadow-border-hover:
    0 0 0 1px rgb(20 19 17 / 0.08), 0 1px 2px -1px rgb(20 19 17 / 0.08),
    0 2px 8px 0 rgb(20 19 17 / 0.06);
  --shadow-float:
    0 0 0 1px rgb(20 19 17 / 0.08), 0 16px 40px -12px rgb(20 19 17 / 0.18);

  /* Motion */
  --ease-out-smooth: cubic-bezier(0.22, 1, 0.36, 1);

  /* Layout constants */
  --rail-w: 268px;
  --topbar-h: 56px;
}
```

**Contrast note.** `--color-muted-foreground` and `--color-faint` are deliberately darker than a typical "gray-500" secondary-text color (`#3e4754` / `#4a5563`, not a lighter gray). Secondary text in this system stays comfortably readable at 12–13px instead of trailing off to low-contrast gray. If you tune these, check them against small caption sizes, not just body text.

**Re-skinning.** To put a different brand on this system: change `--color-brand` and `--color-brand-hover` (one color, two shades), and optionally `--color-background`/`--color-card` if you want a cooler or warmer neutral base. Everything else — radii, shadows, type scale, component structure — carries over unchanged. The dark rail tokens can stay near-black regardless of brand, since the rail is a utility surface, not a brand surface.

---

## 2. Global base

```css
* {
  box-sizing: border-box;
}
html {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  overflow-x: clip;
}
html, body, #root {
  margin: 0;
  min-height: 100%;
}
body {
  background: var(--color-background);
  color: var(--color-foreground);
  font-family: var(--font-sans);
  font-size: 15px;
  line-height: 1.55;
}
a { color: inherit; }
button { font-family: var(--font-sans); cursor: pointer; color: inherit; }
[role="button"] { cursor: pointer; }

::selection {
  background: color-mix(in oklab, var(--color-brand) 18%, white);
}
:focus-visible {
  outline: 2px solid var(--color-ring);
  outline-offset: 2px;
}
```

**Base font size is 15px, not 16px**, with a slightly loose 1.55 line-height. This is a deliberate "editorial" choice — dense enough for data-heavy screens, loose enough to read comfortably. Don't go below 15px for body copy in this system.

**`color-mix(in oklab, …)`** is the standard way to make a translucent tint of the brand color for hover/selection states, instead of a second hardcoded color. Use it for any "brand color at N% opacity" need:

```css
background: color-mix(in oklab, var(--color-brand) 18%, white);
```

---

## 3. Typography

| Role | Font | Notes |
|---|---|---|
| Body, UI chrome | `--font-sans` (Plus Jakarta Sans) | All buttons, labels, table text, nav |
| Headings (h1–h4) | `--font-display` (Newsreader, a serif) | Weight 500 only — this system never bolds a display heading |
| Numbers, code, timestamps | `--font-mono` (IBM Plex Mono) | Eyebrows, stat figures, keyboard hints, table figures |

```css
h1, h2, h3, h4 {
  font-family: var(--font-display);
  font-weight: 500;
  margin: 0;
  text-wrap: balance;
  color: var(--color-foreground);
}
h1 {
  font-size: clamp(2rem, 1.4rem + 2.6vw, 2.85rem);
  letter-spacing: -0.03em;
  line-height: 1.1;
}
h2 { font-size: 1.25rem; letter-spacing: -0.025em; line-height: 1.15; }
h3 { font-size: 1.05rem; letter-spacing: -0.02em; line-height: 1.2; }
p { text-wrap: pretty; margin: 0; }
```

**The serif/sans pairing is the single most identity-defining choice in this system.** A page-level h1 in a serif at a large clamp size next to sans-serif UI chrome is what makes screens feel editorial rather than generic-SaaS. Do not substitute a second sans-serif for the display font — the contrast is the point.

Utility text classes:

```css
.mono { font-family: var(--font-mono); font-variant-numeric: tabular-nums; }
.muted { color: var(--color-muted-foreground); }
.faint { color: var(--color-faint); }
.small { font-size: 12px; line-height: 1.4; }
.num { text-align: right; font-family: var(--font-mono); font-variant-numeric: tabular-nums; }
```

Use `.mono` with `tabular-nums` for anything that's a column of numbers (counts, dates, IDs) so digits align.

---

## 4. Iconography

- **Library convention:** a single outline-icon set (this system uses `lucide-react`; any consistent 24×24 outline set works the same way).
- **Sizing:** icons are almost always 14–18px inline with text, 22–24px as a standalone header icon, never mixed sizes in the same row.
- **Stroke width:** default weight for most icons; **1.85** for icons inside the dark nav rail specifically, giving them a slightly heavier, more legible weight against the dark background at small size.
- **Never use filled/solid icon variants.** Outline only, everywhere, including inside colored badges and buttons.

```css
.btn svg { width: 16px; height: 16px; }
.rail .item svg { width: 18px; height: 18px; flex: 0 0 18px; color: var(--color-side-muted); }
```

---

## 5. Layout shell

The app frame is a flex row: a fixed-width dark rail, then a flexible column containing a sticky top bar and the scrollable main content.

```css
.app {
  display: flex;
  min-height: 100dvh;
}
.col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
main.main { flex: 1; min-width: 0; }
.inner {
  max-width: 72rem;
  margin: 0 auto;
  padding: 32px 16px 96px;
  min-width: 0;
}
@media (min-width: 640px)  { .inner { padding: 32px 24px 96px; } }
@media (min-width: 1024px) { .inner { padding: 32px 32px 96px; } }
```

**Breakpoints used throughout the system:** `640px` (small→medium, mobile chrome collapses), `900px`–`1023.98px` (rail collapses to a slide-out sheet below this), `1024px` (two-column layouts activate), `1100px` (card grids drop from 2 columns to 1).

**Mobile nav:** below the rail breakpoint, the rail becomes a fixed slide-out sheet (`.sheet`) over a scrim (`.sheet-bg`), triggered by a hamburger icon button that's hidden at desktop widths.

```css
.rail-desktop { display: flex; }
@media (max-width: 1023.98px) { .rail-desktop { display: none; } }
@media (min-width: 1024px)    { .topbar .iconbtn.hamb { display: none; } }

.sheet-bg { position: fixed; inset: 0; background: rgb(20 19 17 / 0.5); z-index: 40; }
.sheet    { position: fixed; inset: 0 auto 0 0; width: var(--rail-w); z-index: 41; }
.sheet .rail { height: 100dvh; }
```

---

## 6. Navigation rail

Dark, sticky, full-height. Structure top to bottom: brand mark, a "current workspace" switcher chip, one or more labeled groups of nav items, a spacer, an optional note/callout card, a profile block, a footer strip.

```css
.rail {
  width: var(--rail-w);
  flex: 0 0 var(--rail-w);
  background: var(--color-side);
  color: var(--color-side-text);
  position: sticky;
  top: 0;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  padding: 16px 12px;
  gap: 2px;
  overflow-y: auto;
}

/* Brand mark + wordmark */
.rail .lockup { display: flex; align-items: center; gap: 10px; padding: 4px 8px 16px; }
.rail .mark {
  width: 40px; height: 40px;
  border-radius: var(--radius-sm);
  background: var(--color-side-fill);
  display: grid; place-items: center;
  color: var(--color-side-strong);
  flex: 0 0 40px;
}
.rail .lockup b { display: block; color: var(--color-side-strong); font-size: 14px; font-weight: 600; line-height: 1.2; }
.rail .lockup small { display: block; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--color-side-muted); margin-top: 2px; }

/* Section group label */
.rail .group {
  font-size: 11px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--color-side-muted);
  padding: 14px 10px 6px;
}

/* Nav item */
.rail .item {
  display: flex; align-items: center; gap: 10px;
  min-height: 40px;
  padding: 8px 10px;
  border-radius: 10px;
  color: var(--color-side-text);
  text-decoration: none;
  font-size: 14px; font-weight: 500;
  background: none; border: none; text-align: left; width: 100%;
  transition: background 150ms ease-out, color 150ms ease-out, box-shadow 150ms ease-out;
}
.rail .item:hover { background: var(--color-side-fill); color: var(--color-side-strong); }
.rail .item.active {
  background: var(--color-side-fill);
  color: var(--color-side-strong);
  box-shadow: inset 2px 0 0 var(--color-brand); /* left accent bar marks the active item */
}
.rail .item.active svg { color: var(--color-brand); }
.rail .item.disabled { color: var(--color-side-muted); cursor: default; }
.rail .item .fig { /* a trailing count badge, e.g. "8" open items */
  margin-left: auto;
  font-family: var(--font-mono);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: var(--color-side-muted);
}
.rail .item.active .fig { color: var(--color-side-text); }

.rail .spacer { flex: 1; }

/* Optional callout card above the profile block */
.rail .status {
  background: var(--color-side-2);
  border: 1px solid var(--color-side-line);
  border-radius: var(--radius-md);
  padding: 12px;
  font-size: 12px; line-height: 1.4;
  color: var(--color-side-text);
  margin-top: 12px;
}
.rail .status .dot { display: inline-block; width: 6px; height: 6px; border-radius: 999px; background: var(--color-ok); margin-right: 6px; vertical-align: middle; }
.rail .status .dot.demo { background: var(--color-warn); }
```

**A denser icon-chip variant** for nav items (used when items need more visual weight, e.g. a top-level app with only 6–8 destinations): wrap the icon in its own small rounded square instead of letting it float loose in the row.

```css
.rail .item .item-ico {
  display: grid; place-items: center;
  width: 30px; height: 30px; flex: 0 0 30px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  color: #eef1f5;
}
.rail .item:hover .item-ico { background: rgba(255, 255, 255, 0.1); color: #ffffff; }
.rail .item.active .item-ico {
  background: color-mix(in oklab, var(--color-brand) 22%, transparent);
  color: #ffffff;
}
.rail .item .item-label { flex: 1; min-width: 0; color: inherit; letter-spacing: -0.01em; }
```

With the icon-chip variant, the active-state left accent bar becomes a pseudo-element instead of a box-shadow, so it can extend slightly beyond the row's own padding:

```css
.rail .item.active { position: relative; }
.rail .item.active::before {
  content: "";
  position: absolute; left: 0; top: 8px; bottom: 8px; width: 3px;
  border-radius: 999px;
  background: var(--color-brand);
}
```

---

## 7. Top bar

Sticky, full-width, sits above the scrollable content. In this system the top bar is **light** (white background), not dark like the rail — it's read as part of the content column, not the navigation surface, even though it sits flush against the rail.

```css
.topbar {
  height: var(--topbar-h);
  position: sticky;
  top: 0;
  z-index: 30;
  background: #fff;
  color: var(--color-foreground);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
}
.topbar .crumb { font-size: 13px; color: var(--ink-tertiary, var(--color-muted-foreground)); display: flex; gap: 8px; min-width: 0; }
.topbar .crumb .cur { color: var(--color-foreground); } /* current page: full contrast, rest: muted */
.topbar .right { margin-left: auto; display: flex; align-items: center; gap: 12px; }
.topbar .iconbtn {
  width: 40px; height: 40px;
  border-radius: var(--radius-sm);
  border: none; background: none;
  color: var(--ink-tertiary, var(--color-muted-foreground));
  display: grid; place-items: center;
}
.topbar .iconbtn:hover { color: var(--color-foreground); }

/* Search trigger: looks like a disabled input, opens a command palette on click */
.topbar .searchtrig {
  display: none; /* hidden below 640px, replaced by an icon button */
  align-items: center; gap: 8px;
  width: 220px; height: 40px;
  padding: 0 10px 0 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-secondary);
  color: var(--color-muted-foreground);
  font-size: 13px;
}
.topbar .searchtrig kbd {
  margin-left: auto;
  font-family: var(--font-mono); font-size: 11px;
  color: var(--color-muted-foreground);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xs);
  padding: 1px 6px;
}
@media (min-width: 640px) {
  .topbar .searchtrig { display: flex; }
  .topbar .iconbtn.search { display: none; }
}
```

**Breadcrumb pattern:** always start with a link to the app root, then one crumb per level, plain text (not a link) for the current page. Keep it terse — this is orientation, not a full path.

---

## 8. Command palette / modal dialog

A single overlay + dialog pattern serves both simple confirmation dialogs and the command palette (search-everything) — the palette is just a dialog with no padding and a fixed internal structure.

```css
.overlay {
  position: fixed; inset: 0;
  background: rgb(20 19 17 / 0.45);
  display: flex; align-items: flex-start; justify-content: center;
  z-index: 60;
  padding: 18vh 16px 0;
}
.dialog {
  background: var(--color-card);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-float);
  width: 100%; max-width: 36rem;
  padding: 24px;
  animation: dialog-in 200ms ease-out both;
}
@keyframes dialog-in {
  from { opacity: 0; transform: scale(0.96); }
  to   { opacity: 1; transform: none; }
}

/* Command palette: a dialog with zero padding and three internal zones */
.palette { padding: 0; overflow: hidden; }
.palette .pin {           /* search input row */
  display: flex; align-items: center; gap: 10px;
  height: 48px; padding: 0 14px;
  border-bottom: 1px solid var(--color-border);
}
.palette .pin input { flex: 1; border: none; outline: none; font-size: 14px; background: none; height: 100%; }
.palette .list { max-height: 20rem; overflow-y: auto; padding: 6px; }
.palette .ph2 {           /* result group heading, e.g. "RECENT" */
  font-size: 11px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;
  color: var(--color-muted-foreground);
  padding: 10px 10px 4px;
}
.palette .it {            /* one result row */
  display: flex; align-items: center; gap: 10px;
  width: 100%; height: 40px; padding: 0 10px;
  border-radius: var(--radius-sm); border: none; background: none;
  font-size: 14px; text-align: left;
}
.palette .it.sel, .palette .it:hover { background: var(--color-secondary); }
.palette .it .fig { margin-left: auto; font-family: var(--font-mono); font-size: 12px; color: var(--color-faint); }
.palette .foot {           /* keyboard hint footer */
  display: flex; gap: 14px; padding: 8px 14px;
  border-top: 1px solid var(--color-border);
  font-size: 12px; color: var(--color-faint);
}
```

---

## 9. Buttons

Five variants, one shared base. Height and radius never change between variants — only fill, border, and text color do.

```css
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  height: 40px; padding: 0 16px;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  font-size: 14px; font-weight: 600;
  text-decoration: none;
  background: var(--color-primary);
  color: var(--color-primary-foreground);
  white-space: nowrap;
  transition: background 150ms ease-out, color 150ms ease-out, box-shadow 150ms ease-out, transform 150ms ease-out;
}
.btn:hover { background: #000; }
.btn:active { transform: scale(0.96); } /* the only "pressed" affordance in the system: a tiny scale-down */
.btn:disabled { opacity: 0.5; pointer-events: none; }

.btn.brand    { background: var(--color-brand); }
.btn.brand:hover { background: var(--color-brand-hover); }
.btn.outline  { background: transparent; color: var(--color-foreground); border-color: var(--color-line-strong); }
.btn.outline:hover { background: var(--color-card); box-shadow: var(--shadow-border); }
.btn.secondary { background: var(--color-secondary); color: var(--color-foreground); }
.btn.ghost    { background: transparent; color: var(--color-foreground); }
.btn.ghost:hover { background: var(--color-secondary); }
.btn.link     { background: none; color: var(--color-brand); padding: 0; height: auto; font-weight: 500; }
.btn.link:hover { text-decoration: underline; text-underline-offset: 3px; }

.btn.sm { height: 36px; padding: 0 12px; font-size: 13px; }
.btn.full { width: 100%; }
```

**Usage convention:** one `.btn.brand` per view maximum — it's the primary action. Everything secondary is `.outline` or `.ghost`. `.link` is for an inline text action inside a sentence or table row, never a standalone CTA.

---

## 10. Badges (status pills)

```css
.badge {
  display: inline-flex; align-items: center;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase;
  white-space: nowrap; line-height: 1.3;
  background: var(--color-muted);
  color: var(--color-muted-foreground);
}
.badge.brand   { background: var(--color-brand-soft); color: var(--color-brand); }
.badge.warn    { background: var(--color-warn-soft);  color: var(--color-warn); }
.badge.ok      { background: var(--color-ok-soft);    color: var(--color-ok); }
.badge.outline { background: none; box-shadow: inset 0 0 0 1px var(--color-border); }
```

**Semantic convention** for mapping a status to a tone (reuse this mapping shape for any workflow-state system, not the literal state names):

| Meaning | Tone | Badge class |
|---|---|---|
| Done / resolved / positive terminal state | success | `.badge.ok` |
| Blocked / needs attention / negative | warning | `.badge.warn` |
| Awaiting a decision / in review | accent | `.badge.brand` |
| Everything else (draft, queued, in progress, cancelled) | neutral | `.badge` (default, no modifier) |

Badges are always uppercase, always pill-shaped, always tiny (11px) — they read as a tag, not as body text. Never put a badge modifier's color on running text elsewhere; badges are the *only* place status colors appear as a background fill.

---

## 11. Forms

```css
label.lbl {
  display: block; font-size: 12px; font-weight: 600;
  color: var(--color-muted-foreground);
  margin-bottom: 6px; letter-spacing: 0.01em;
}
label.lbl .req { color: var(--color-brand); margin-left: 2px; } /* required-field asterisk: the one place brand color marks a form element */
.hint { font-size: 12px; color: var(--color-faint); margin-top: 5px; }

.inp, .sel, .ta {
  width: 100%; height: 40px; padding: 8px 12px;
  border: 1px solid var(--color-input);
  background: var(--color-card);
  font-size: 14px;
  border-radius: var(--radius-sm);
  transition: border-color 150ms ease-out, box-shadow 150ms ease-out;
}
.inp:focus, .sel:focus, .ta:focus {
  outline: none;
  border-color: var(--color-brand);
  box-shadow: 0 0 0 2px color-mix(in oklab, var(--color-brand) 20%, transparent);
}
.inp:disabled, .sel:disabled, .ta:disabled {
  background: var(--color-background); color: var(--color-foreground); opacity: 1;
}
.ta { height: auto; min-height: 84px; resize: vertical; line-height: 1.5; }
.sel {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%238e887f' stroke-width='1.5'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 34px;
}

/* Two-column form grid, collapsing to one column below 640px */
.g2 { display: grid; grid-template-columns: 1fr; gap: 18px 20px; min-width: 0; }
@media (min-width: 640px) {
  .g2 { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
  .span2 { grid-column: 1 / -1; }
}

/* A titled sub-group within a form, with a brand-colored left rule */
.grp {
  grid-column: 1 / -1;
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-border);
  padding: 16px;
  background: var(--color-card);
  position: relative;
}
.grp::before {
  content: ""; position: absolute; left: 0; top: 16px; bottom: 16px; width: 2px;
  border-radius: 999px; background: var(--color-brand);
}
.grp .grp-title { font-weight: 600; font-size: 14px; margin-bottom: 12px; padding-left: 10px; }

/* Segmented control (pick one of N) */
.seg { display: flex; gap: 6px; flex-wrap: wrap; }
.seg button {
  height: 36px; padding: 0 14px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-input);
  background: var(--color-card);
  font-size: 13px; font-weight: 500;
  color: var(--color-muted-foreground);
}
.seg button.on { background: var(--color-primary); color: var(--color-primary-foreground); border-color: var(--color-primary); }

/* Toggle chip (pick any of N) */
.ck {
  display: inline-flex; align-items: center; gap: 8px;
  height: 36px; padding: 0 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-input);
  background: var(--color-card);
  font-size: 13px; font-weight: 500;
  color: var(--color-muted-foreground);
}
.ck.on { color: var(--color-foreground); border-color: var(--color-line-strong); }
.ck .box {
  width: 16px; height: 16px;
  border-radius: var(--radius-xs);
  border: 1px solid var(--color-line-strong);
  display: inline-grid; place-items: center;
  font-size: 10px;
  background: var(--color-card);
}
.ck.on .box { background: var(--color-primary); border-color: var(--color-primary); color: var(--color-primary-foreground); }
```

**Callout box** (an inline warning/note card with a colored left rule — severity is carried by the rule color and an icon, never by filling the whole card with color):

```css
.callout {
  grid-column: 1 / -1;
  display: flex; gap: 14px;
  border-radius: var(--radius-md);
  background: var(--color-card);
  padding: 14px 16px;
  box-shadow: var(--shadow-border);
  font-size: 14px; line-height: 1.5;
}
.callout .rule { width: 2px; align-self: stretch; border-radius: 999px; background: var(--color-brand); flex: 0 0 2px; }
```

---

## 12. Cards / surfaces

The base card ("surface") is the single most-reused container in the system — a white rounded rectangle with the soft border-shadow, used for everything from a form section to a dashboard tile.

```css
.surface {
  background: var(--color-card);
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: var(--shadow-border);
  min-width: 0; max-width: 100%;
}
@media (min-width: 640px) { .surface { padding: 24px; } }

/* Surface header: title + index number + optional kicker line + right-aligned action */
.surface .st { display: flex; align-items: baseline; gap: 12px; margin-bottom: 18px; flex-wrap: wrap; }
.surface .st h2 { flex: 1; min-width: 0; }
.surface .st .idx { font-family: var(--font-mono); font-size: 22px; font-weight: 500; color: var(--color-brand); line-height: 1; }
.surface .st .kick { font-size: 13px; color: var(--color-muted-foreground); width: 100%; margin-top: -8px; }
.surface .st .right { margin-left: auto; }

/* Content + sticky sidebar layout, used for "form + live summary" pages */
.grid2 { display: grid; gap: 24px; min-width: 0; }
@media (min-width: 1024px) { .grid2 { grid-template-columns: minmax(0, 1fr) 300px; align-items: start; } }
.side { position: sticky; top: calc(var(--topbar-h) + 16px); }
```

**A denser "panel" variant** used for dashboard-style pages (a plain 1px border instead of the shadow, a distinct header/body/footer structure):

```css
.panel {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  min-width: 0; overflow: hidden;
  box-shadow: 0 2px 4px rgb(20 19 17 / 0.01);
}
.panel-heading { display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 23px 24px 20px; }
.panel-footer {
  display: flex; justify-content: space-between; gap: 12px;
  padding: 15px 22px;
  border-top: 1px solid var(--color-border);
  background: #fcfdfe;
  font-size: 10px; color: var(--color-muted-foreground);
}
```

**A two-up card grid for feature/product tiles**, collapsing to one column on narrow screens:

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
.card-grid .card {
  display: flex; flex-direction: column; gap: 12px;
  min-width: 0;
  padding: 24px 28px 22px;
  border-radius: 16px;
  background: var(--color-card);
  box-shadow: var(--shadow-border);
}
.card .card-head { display: flex; align-items: flex-start; gap: 14px; width: 100%; }
.card .card-icon { width: 48px; height: 48px; flex: 0 0 48px; border-radius: 12px; }
.card .card-footer {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  width: 100%; margin-top: auto; padding-top: 16px;
  border-top: 1px solid var(--color-border);
}
@media (max-width: 1100px) { .card-grid { grid-template-columns: 1fr; } }
```

**A "featured item" layout** — one wide card with a two-column split (main content + a fact list in a second, narrower column with its own vertical rule), for the one thing on a listing page that deserves more visual weight than its siblings:

```css
.featured {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(240px, 0.75fr);
  gap: 28px 36px;
  align-items: stretch;
  padding: 28px 32px;
}
.featured-facts {
  list-style: none; margin: 0;
  padding: 4px 0 4px 28px;
  border-left: 1px solid color-mix(in oklab, var(--color-brand) 22%, var(--color-border));
}
.featured-facts li { display: grid; gap: 2px; padding: 12px 0; }
.featured-facts li + li { border-top: 1px solid color-mix(in oklab, var(--color-brand) 12%, var(--color-border)); }
@media (max-width: 1100px) {
  .featured { grid-template-columns: 1fr; gap: 20px; }
  .featured-facts { padding: 8px 0 0; border-left: 0; border-top: 1px solid var(--color-border); }
}
```

---

## 13. Stat tiles and the stat strip

Two different stat patterns, for two different contexts.

**Stat strip** — a row of figures separated by rules, for a page header summary (not clickable):

```css
.strip {
  display: grid; grid-template-columns: 1fr 1fr;
  border-top: 1px solid var(--color-line-strong);
  border-bottom: 1px solid var(--color-line-strong);
  margin-bottom: 32px;
}
.strip .cell { padding: 20px 16px; min-width: 0; }
.strip .fig { font-family: var(--font-display); font-size: 1.875rem; font-weight: 500; letter-spacing: -0.02em; line-height: 1; }
.strip .fig.brand { color: var(--color-brand); }
.strip .lab { font-size: 12px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: var(--color-muted-foreground); margin-top: 6px; }
.strip .sub { font-size: 12px; color: var(--color-faint); margin-top: 2px; }
@media (min-width: 640px) {
  .strip { display: flex; }
  .strip .cell { flex: 1; padding: 20px 20px; border-left: 1px solid var(--color-border); border-top: none !important; }
  .strip .cell:first-child { border-left: none; padding-left: 0; }
}
```

**Stat tile grid** — clickable cards (each one is a filter/navigation trigger), for a dashboard-style "six numbers at the top" pattern:

```css
.stat-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; margin: 26px 0 22px; }
.stat-tile {
  padding: 20px 22px; text-align: left;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 2px 3px rgb(20 19 17 / 0.01);
  cursor: pointer;
  transition: transform 0.15s, border-color 0.15s;
}
.stat-tile:hover { transform: translateY(-2px); border-color: var(--color-line-strong); }
.stat-tile > .head { display: flex; justify-content: space-between; align-items: center; font-weight: 550; font-size: 12px; color: var(--color-muted-foreground); }
.stat-tile > strong { display: block; font-size: 38px; font-weight: 600; line-height: 1.2; letter-spacing: -1.5px; margin: 16px 0 9px; font-variant-numeric: tabular-nums; }
.stat-tile > small { font-size: 11px; color: var(--color-faint); }
.stat-tile.amber > .head svg { color: var(--color-warn); }
.stat-tile.red   > .head svg { color: #b92434; }
.stat-tile.green > .head svg { color: var(--color-ok); }
```

The clickable stat tile's only hover affordance is a 2px upward translate plus a border-darken — no shadow growth, no scale, no color fill. Keep interactive-card hover states this restrained throughout the system.

---

## 14. Tables

```css
table.t { width: 100%; border-collapse: collapse; font-size: 13.5px; }
table.t th {
  text-align: left; font-size: 11px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;
  color: var(--color-muted-foreground);
  padding: 0 12px 10px;
  border-bottom: 1px solid var(--color-line-strong);
  white-space: nowrap;
}
table.t th.num, table.t td.num { text-align: right; }
table.t td { padding: 10px 12px; border-bottom: 1px solid var(--color-border); vertical-align: top; }
table.t tr:last-child td { border-bottom: none; }
table.t th:first-child, table.t td:first-child { padding-left: 0; }
table.t th:last-child,  table.t td:last-child  { padding-right: 0; }
table.t td a { color: var(--color-brand); text-decoration: none; }
table.t td a:hover { text-decoration: underline; text-underline-offset: 3px; }
.empty { padding: 32px; text-align: center; color: var(--color-muted-foreground); font-size: 14px; }
```

Table headers are always the small-caps-style uppercase treatment (11px, letter-spacing, muted color) — the same visual language as a badge or an eyebrow, reinforcing that this is a "structural label" typographic role used consistently across the system.

---

## 15. Tabs

```css
.tabs { display: flex; gap: 22px; padding: 0 24px; border-bottom: 1px solid var(--color-border); overflow-x: auto; }
.tabs > button {
  background: none; border: 0; border-bottom: 2px solid transparent;
  padding: 12px 0;
  font-size: 12px; font-weight: 500;
  color: var(--color-muted-foreground);
  white-space: nowrap;
  display: flex; gap: 7px; align-items: center;
}
.tabs > button.selected { border-bottom-color: var(--color-brand); color: var(--color-brand); }
.tabs > button > .count {
  color: var(--color-muted-foreground);
  background: var(--color-secondary);
  border-radius: 4px;
  font-size: 10px;
  padding: 1px 5px;
}
```

Tabs live directly on the panel's top border (no card padding above them) and carry an optional small count pill next to the label.

**Toggle/view-switch** (e.g. list view vs. board view) — a small segmented pill group, distinct from `.seg` above because it's icon-only and sits inline in a toolbar:

```css
.view-switch { display: flex; background: var(--color-secondary); border: 1px solid var(--color-border); border-radius: 6px; padding: 2px; }
.view-switch button { border: 0; display: flex; padding: 5px; border-radius: 4px; color: var(--color-muted-foreground); }
.view-switch button.selected { background: #fff; color: var(--color-foreground); box-shadow: var(--shadow-border); }
```

---

## 16. Progress bars

A thin, fully-rounded track — used both as a standalone completion indicator and as a compact inline "mini" variant next to a table row.

```css
.progress { height: 5px; background: var(--color-secondary); border-radius: 6px; overflow: hidden; min-width: 70px; margin: 5px 0 7px; }
.progress > span { display: block; height: 100%; border-radius: 6px; max-width: 100%; background: var(--color-ok); }
.progress.mini { width: 64px; min-width: 64px; margin: 0; }
```

Fill color communicates state the same way a badge does (green = on track / healthy, swap to `var(--color-warn)` or `var(--color-brand)` if the thing being measured is behind or blocked).

---

## 17. Empty states

Every list, table, and panel that can be empty uses the same pattern: centered icon, a heading, one line of supporting copy, then a primary action.

```css
.empty-state { text-align: center; padding: 50px 28px 58px; }
.empty-state > svg { color: var(--color-faint); margin-bottom: 14px; }
.empty-state h3 { font-size: 19px; }
.empty-state p { color: var(--color-muted-foreground); font-size: 12px; margin: 10px 0 24px; }
.empty-state .actions { display: flex; justify-content: center; gap: 8px; }
```

Icon size for the empty-state glyph is larger than any other inline icon use — 28–34px — since it's standing in for an illustration.

---

## 18. Board / kanban columns

```css
.board { display: flex; gap: 12px; padding: 20px; overflow-x: auto; min-height: 320px; }
.board-column { background: var(--color-secondary); border-radius: 7px; padding: 10px; min-width: 185px; flex: 1; }
.board-column h3 { display: flex; justify-content: space-between; font-size: 11px; margin: 3px 0 15px; }
.board-column h3 span { color: var(--color-faint); }
.board-card {
  display: block; text-decoration: none;
  padding: 13px;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  margin-bottom: 10px;
}
.board-card:hover { border-color: var(--color-line-strong); }
.board-card > strong { display: block; font-size: 13px; margin: 5px 0 10px; }
.board-card > .meta { display: flex; justify-content: space-between; gap: 10px; margin-top: 14px; font-size: 9px; color: var(--color-faint); }
```

Cards here are plain links, not drag targets — if you add drag-and-drop, keep the visual rest-state identical and only add a drag-shadow/ghost state on top.

---

## 19. Motion

Three animations cover the whole system. Nothing else moves.

```css
@keyframes enter-up {
  from { opacity: 0; transform: translateY(10px); filter: blur(3px); }
  to   { opacity: 1; transform: none; filter: none; }
}
@keyframes bar-grow {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}
@keyframes dialog-in {
  from { opacity: 0; transform: scale(0.96); }
  to   { opacity: 1; transform: none; }
}

.enter-up { animation: enter-up 480ms var(--ease-out-smooth) both; }
.enter-up.d1 { animation-delay: 40ms; }
.enter-up.d2 { animation-delay: 90ms; }
.enter-up.d3 { animation-delay: 140ms; }
.enter-up.d4 { animation-delay: 190ms; }
.bar-fill { transform-origin: left; animation: bar-grow 720ms var(--ease-out-smooth) both; }

@media (prefers-reduced-motion: reduce) {
  .enter-up, .bar-fill { animation: none !important; }
  * { transition-duration: 0ms !important; }
}
```

- **`enter-up`**: apply to a page's top-level sections on first paint, staggering siblings with `.d1`–`.d4` (40ms/90ms/140ms/190ms delays) so a page's content cascades in rather than popping all at once. Use sparingly — the hero/header area of a page, not every card in a long list.
- **`bar-grow`**: any progress bar's fill animates in from zero width once, on mount.
- **`dialog-in`**: every modal/dialog scales up from 96% with a fade. This is the *only* place `scale` is used besides the button press-state.
- Respect `prefers-reduced-motion` globally by killing both keyframe animations and zeroing all transition durations — don't handle it per-component.

Standard interactive transition timing is **150ms ease-out** for hover/focus color and background changes; the *only* animation with a custom cubic-bezier (`--ease-out-smooth`, `cubic-bezier(0.22, 1, 0.36, 1)`) is the three keyframe animations above, not routine hover states.

---

## 20. Accessibility baseline

- Global `:focus-visible { outline: 2px solid var(--color-ring); outline-offset: 2px; }` — never remove focus outlines without replacing them with an equally visible alternative.
- A skip-to-content link, visually hidden until focused:
  ```css
  .skip { position: absolute; left: 8px; top: -40px; background: var(--color-card); padding: 8px 12px; border-radius: var(--radius-sm); z-index: 100; }
  .skip:focus { top: 8px; }
  ```
- Secondary text colors (`--color-muted-foreground`, `--color-faint`) are tuned dark enough to hold contrast at small sizes (11–13px) — don't lighten them for "subtlety" without re-checking contrast at those sizes specifically.
- `prefers-reduced-motion` is handled once, globally (see §19) — don't add component-level motion that bypasses it.

---

## 21. Adoption checklist

Dropping this system into a new project:

1. Paste the `:root` token block (§1). Change `--color-brand` / `--color-brand-hover` to the new brand's accent; leave everything else as a starting point.
2. Load three font families: a sans for UI, a serif for display headings, a mono for figures/code. Any well-made trio in those three roles works — the *pairing pattern* (serif headings over sans UI) matters more than the specific typeface.
3. Build the shell (§5–7): dark rail + light top bar + light content column. This single structural decision (two-tone shell) is what makes the rest of the system read as one coherent product.
4. Implement `.btn`, `.badge`, `.surface`, and form primitives (§9–12) first — these four are reused by everything else.
5. Add `.dialog`/`.palette` (§8) as soon as you need a command palette or any modal.
6. Only reach for `.stat-grid`, `.card-grid`, `.board`, `.tabs` (§13–18) as specific page layouts need them — they all compose from the same tokens, so they'll match automatically.
7. Wire up `enter-up`/`bar-grow`/`dialog-in` (§19) last, as polish — the system reads correctly with zero animation, motion is a finishing touch, not a dependency.
