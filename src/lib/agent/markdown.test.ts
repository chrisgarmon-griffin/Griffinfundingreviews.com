import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { homeMarkdown, markdownForPath, notFoundMarkdown } from "./markdown.ts";
import { formatInt, offices, platforms, stats } from "../../data/site.ts";
import { aboutPage, contactPage } from "../../data/pages.ts";

describe("homeMarkdown", () => {
  const md = homeMarkdown();

  it("leads with the title and the weighted average", () => {
    assert.match(md, /^# Griffin Funding Reviews/);
    assert.ok(md.includes(`Weighted average: ${stats.shownText} out of 5`));
    assert.ok(md.includes(formatInt(stats.ratedCount)));
  });

  it("lists every platform with its link and every office", () => {
    for (const p of platforms)
      assert.ok(md.includes(`[${p.name}](${p.href})`), p.name);
    for (const o of offices) assert.ok(md.includes(o.street), o.city);
  });

  it("links the machine-readable files", () => {
    assert.ok(md.includes("https://griffinfundingreviews.com/llms.txt"));
    assert.ok(md.includes("https://griffinfundingreviews.com/sitemap.xml"));
  });
});

describe("markdownForPath", () => {
  it("serves the home page", () => {
    assert.equal(markdownForPath("/"), homeMarkdown());
  });

  it("serves the about and contact pages", () => {
    assert.match(
      markdownForPath("/about") ?? "",
      new RegExp(`^# ${aboutPage.heading}`),
    );
    assert.match(
      markdownForPath("/contact/") ?? "",
      new RegExp(`^# ${contactPage.heading}`),
    );
  });

  it("gives trust pages real content", () => {
    for (const path of ["/about", "/contact"]) {
      assert.ok((markdownForPath(path) ?? "").length >= 500, path);
    }
  });

  it("returns null for paths with no page", () => {
    assert.equal(markdownForPath("/nope"), null);
    assert.equal(markdownForPath("/about/extra"), null);
  });
});

describe("notFoundMarkdown", () => {
  it("explains the error and links llms.txt and the sitemap", () => {
    const md = notFoundMarkdown("/missing");
    assert.ok(md.length >= 20);
    assert.ok(md.includes("`/missing`"));
    assert.ok(md.includes("https://griffinfundingreviews.com/llms.txt"));
    assert.ok(md.includes("https://griffinfundingreviews.com/sitemap.xml"));
  });
});
