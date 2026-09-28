import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  markdownHeaders,
  mergeVary,
  parseAccept,
  wantsMarkdown,
} from "./agent-markdown.mjs";

describe("wantsMarkdown", () => {
  it("is true when an agent asks for Markdown", () => {
    assert.equal(wantsMarkdown("text/markdown"), true);
    assert.equal(wantsMarkdown("text/markdown, text/html;q=0.9"), true);
    assert.equal(wantsMarkdown("text/markdown;q=0.9, */*;q=0.8"), true);
    assert.equal(wantsMarkdown("TEXT/MARKDOWN"), true);
  });

  it("is false for browsers and generic clients", () => {
    assert.equal(
      wantsMarkdown(
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      ),
      false,
    );
    assert.equal(wantsMarkdown("*/*"), false);
    assert.equal(wantsMarkdown(""), false);
    assert.equal(wantsMarkdown(null), false);
    assert.equal(wantsMarkdown("application/json"), false);
  });

  it("prefers HTML when HTML ranks higher", () => {
    assert.equal(wantsMarkdown("text/html, text/markdown;q=0.5"), false);
    assert.equal(wantsMarkdown("text/*, text/markdown;q=0.5"), false);
  });

  it("ignores Markdown that is explicitly refused", () => {
    assert.equal(wantsMarkdown("text/markdown;q=0, text/html"), false);
  });
});

describe("parseAccept", () => {
  it("reads types and q-values", () => {
    assert.deepEqual(parseAccept("text/markdown;q=0.7, text/html"), [
      { type: "text/markdown", q: 0.7 },
      { type: "text/html", q: 1 },
    ]);
  });
});

describe("mergeVary", () => {
  it("adds Accept once", () => {
    assert.equal(mergeVary(null, "Accept"), "Accept");
    assert.equal(
      mergeVary("Accept-Encoding", "Accept"),
      "Accept-Encoding, Accept",
    );
    assert.equal(mergeVary("accept", "Accept"), "accept");
    assert.equal(mergeVary("*", "Accept"), "*");
  });
});

describe("markdownHeaders", () => {
  it("sets the Markdown type and Vary: Accept", () => {
    const headers = markdownHeaders("https://griffinfundingreviews.com/");
    assert.match(headers["content-type"], /^text\/markdown/);
    assert.equal(headers.vary, "Accept");
    assert.equal(
      headers.link,
      '<https://griffinfundingreviews.com/>; rel="canonical"',
    );
    assert.equal(markdownHeaders().link, undefined);
  });
});
