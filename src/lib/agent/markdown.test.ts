import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { homeMarkdown, markdownForPath, notFoundMarkdown } from "./markdown.ts";
import {
  APPLY_URL,
  PHONE_TEL,
  formatInt,
  jsonLdBlocks,
  offices,
  platforms,
  stats,
} from "../../data/site.ts";
import { aboutPage, contactPage } from "../../data/pages.ts";
import { reviews, spotlight } from "../../data/reviews.ts";
import { qualifyingOfficers } from "../../data/loan-officers.ts";

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

describe("notFoundMarkdown", () => {
  it("explains the error and links llms.txt and the sitemap", () => {
    const md = notFoundMarkdown("/missing");
    assert.ok(md.length >= 20);
    assert.ok(md.includes("`/missing`"));
    assert.ok(md.includes("https://griffinfundingreviews.com/llms.txt"));
    assert.ok(md.includes("https://griffinfundingreviews.com/sitemap.xml"));
  });
});

describe("call to action", () => {
  it("home and contact Markdown carry the phone and application link", () => {
    const home = markdownForPath("/") ?? "";
    assert.ok(home.includes("5-star review"));
    assert.ok(home.includes(PHONE_TEL));
    assert.ok(home.includes(APPLY_URL));
    assert.ok((markdownForPath("/contact") ?? "").includes(PHONE_TEL));
  });

  it("uses a valid tel: link and the confirmed application page", () => {
    assert.match(PHONE_TEL, /^tel:\+1\d{10}$/);
    assert.equal(
      APPLY_URL,
      "https://griffinfunding.com/full-page-form-quick-quote/",
    );
  });
});

describe("structured data", () => {
  const [organization, graph] = jsonLdBlocks();

  it("puts the organization in its own block with a top-level type", () => {
    const type = organization["@type"] as string[];
    assert.equal(organization["@context"], "https://schema.org");
    for (const t of ["Organization", "LocalBusiness", "FinancialService"]) {
      assert.ok(type.includes(t), t);
    }
  });

  it("gives the organization an address, phone, and contact point", () => {
    assert.equal(organization.telephone, "+1-855-967-5146");
    const address = organization.address as Record<string, string>;
    assert.equal(address["@type"], "PostalAddress");
    const contact = organization.contactPoint as Record<string, string>;
    assert.equal(contact.telephone, "+1-855-967-5146");
    assert.equal(contact.contactType, "customer service");
  });

  it("keeps the rest of the graph pointing at the organization", () => {
    const nodes = graph["@graph"] as Record<string, unknown>[];
    assert.ok(nodes.length >= 3);
    assert.ok(!nodes.some((n) => n["@id"] === organization["@id"]));
    assert.ok(JSON.stringify(graph).includes(organization["@id"] as string));
  });
});
