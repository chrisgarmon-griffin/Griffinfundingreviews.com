/**
 * Rewrites the figures in public/llms.txt and public/llms-full.txt from src/data/site.ts,
 * so the agent-facing files match the page after an Experience.com sync.
 * Every pattern must match exactly once per file it applies to, or nothing is written.
 *
 * Run: node --experimental-strip-types scripts/refresh-llms.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export function rules({ stats, experience, formatInt, formatRating }) {
  const own = `${formatRating(experience.company.rating)} from ${formatInt(experience.company.count)}`;
  const blended = `${formatRating(experience.blended.rating)} from ${formatInt(experience.blended.count)}`;
  const n = "[0-9][0-9,]*";
  const r = "[0-9.]+";
  return [
    {
      files: ["llms.txt", "llms-full.txt"],
      find: new RegExp(`Experience\\.com is counted as its own ${r} from ${n} reviews\\. (The|Its) blended ${r} from ${n}`),
      replace: (_m, word) => `Experience.com is counted as its own ${own} reviews. ${word} blended ${blended}`,
    },
    {
      files: ["llms.txt", "llms-full.txt"],
      find: new RegExp(`- Experience\\.com: ${r} / 5, ${n} reviews`),
      replace: () =>
        `- Experience.com: ${formatRating(experience.company.rating)} / 5, ${formatInt(experience.company.count)} reviews`,
    },
    {
      files: ["llms.txt"],
      find: new RegExp(`weighted average of ${r} out of 5 across ${n} reviews`),
      replace: () => `weighted average of ${stats.shownText} out of 5 across ${formatInt(stats.ratedCount)} reviews`,
    },
    {
      files: ["llms-full.txt"],
      find: new RegExp(`Weighted average: ${r} out of 5\\.`),
      replace: () => `Weighted average: ${stats.shownText} out of 5.`,
    },
    {
      files: ["llms-full.txt"],
      find: new RegExp(`Reviews in the average: ${n} across`),
      replace: () => `Reviews in the average: ${formatInt(stats.ratedCount)} across`,
    },
  ];
}

export function apply(name, text, ruleList) {
  let out = text;
  for (const rule of ruleList.filter((x) => x.files.includes(name))) {
    const global = new RegExp(rule.find.source, "g");
    const hits = out.match(global)?.length ?? 0;
    if (hits !== 1) throw new Error(`${name}: expected 1 match for ${rule.find}, found ${hits}`);
    out = out.replace(rule.find, rule.replace);
  }
  return out;
}

async function main() {
  const site = await import("../src/data/site.ts");
  const { experience } = await import("../src/data/experience.generated.ts");
  const ruleList = rules({ ...site, experience });
  const dir = new URL("../public/", import.meta.url);
  const outputs = ["llms.txt", "llms-full.txt"].map((name) => {
    const path = fileURLToPath(new URL(name, dir));
    return { path, text: apply(name, readFileSync(path, "utf8"), ruleList) };
  });
  for (const { path, text } of outputs) writeFileSync(path, text);
  console.log("Refreshed llms.txt and llms-full.txt");
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
