import { describe, it } from "node:test";
import assert from "node:assert/strict";
import middleware from "../../../server/middleware/agent-markdown.ts";

function event(path: string, accept: string, method = "GET") {
  return {
    url: new URL(path, "https://griffinfundingreviews.com"),
    req: { method, headers: new Headers({ accept }) },
  };
}

const htmlPage = () =>
  new Response("<!doctype html><html><head></head><body>ok</body></html>", {
    headers: {
      "content-type": "text/html; charset=utf-8",
      vary: "Accept-Encoding",
    },
  });

describe("agent-markdown middleware", () => {
  it("serves Markdown for the home page", async () => {
    const res = (await middleware(
      event("/", "text/markdown"),
      htmlPage,
    )) as Response;
    assert.equal(res.status, 200);
    assert.match(res.headers.get("content-type") ?? "", /^text\/markdown/);
    assert.equal(res.headers.get("vary"), "Accept");
    assert.match(await res.text(), /^# Griffin Funding Reviews/);
  });

  it("serves Markdown for /about and /contact", async () => {
    for (const path of ["/about", "/contact"]) {
      const res = (await middleware(
        event(path, "text/markdown"),
        htmlPage,
      )) as Response;
      assert.equal(res.status, 200, path);
      assert.ok((await res.text()).length >= 500, path);
    }
  });

  it("returns a Markdown 404 for unknown paths", async () => {
    const res = (await middleware(
      event("/no-such-page", "text/markdown"),
      htmlPage,
    )) as Response;
    assert.equal(res.status, 404);
    assert.match(res.headers.get("content-type") ?? "", /^text\/markdown/);
    const body = await res.text();
    assert.ok(body.includes("llms.txt"));
  });

  it("sends no body for HEAD", async () => {
    const res = (await middleware(
      event("/", "text/markdown", "HEAD"),
      htmlPage,
    )) as Response;
    assert.equal(res.status, 200);
    assert.equal(await res.text(), "");
  });

  it("keeps HTML for browsers and adds Vary: Accept", async () => {
    const res = (await middleware(
      event("/", "text/html,application/xhtml+xml,*/*;q=0.8"),
      htmlPage,
    )) as Response;
    assert.match(res.headers.get("content-type") ?? "", /^text\/html/);
    assert.equal(res.headers.get("vary"), "Accept-Encoding, Accept");
    assert.match(await res.text(), /<body>ok<\/body>/);
  });

  it("leaves static files and non-GET requests alone", async () => {
    const sentinel = new Response("x", {
      headers: { "content-type": "text/plain" },
    });
    assert.equal(
      await middleware(event("/llms.txt", "text/markdown"), () => sentinel),
      sentinel,
    );
    assert.equal(
      await middleware(event("/", "text/markdown", "POST"), () => sentinel),
      sentinel,
    );
  });
});
