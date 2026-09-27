// Converts the Google review audit CSV into curation candidates.
//   node scripts/import-google-csv.mjs path/to/google-reviews.csv
// Writes data/google-candidates.json (git-ignored). Nothing is published until
// you copy an entry into data/reviews.json with "featured": true.

import { readFileSync, writeFileSync } from 'node:fs';
import { findPii } from './pii.mjs';

const file = process.argv[2];
if (!file) {
  console.error('Usage: node scripts/import-google-csv.mjs <csv>');
  process.exit(1);
}

// RFC 4180 parser: quoted fields, escaped quotes, newlines inside quotes.
function parseCsv(src) {
  const rows = [];
  let row = [], field = '', q = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (q) {
      if (c === '"' && src[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') q = false;
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((v) => v.trim()));
}

const [header, ...rows] = parseCsv(readFileSync(file, 'utf8').replace(/^﻿/, ''));
const norm = header.map((h) => h.trim().toLowerCase().replace(/[^a-z0-9]+/g, ''));

// Column aliases. Add to these if the audit CSV uses other header names.
const aliases = {
  author: ['author', 'authorname', 'reviewer', 'reviewername', 'name', 'displayname', 'user'],
  rating: ['rating', 'stars', 'starrating', 'score', 'reviewrating'],
  text: ['text', 'review', 'reviewtext', 'comment', 'content', 'body', 'reviewbody', 'reviewcontent'],
  date: ['date', 'reviewdate', 'publishedat', 'published', 'createtime', 'time', 'createdat'],
  url: ['url', 'reviewurl', 'link', 'reviewlink'],
  photos: ['photos', 'photo', 'photourl', 'images', 'reviewerphoto', 'authorphoto', 'reviewimage'],
};
const col = Object.fromEntries(
  Object.entries(aliases).map(([k, names]) => [k, norm.findIndex((h) => names.includes(h))]),
);

console.log('Detected columns:', Object.fromEntries(Object.entries(col).map(([k, i]) => [k, i >= 0 ? header[i] : '(not found)'])));
for (const k of ['author', 'rating', 'text', 'date']) {
  if (col[k] < 0) {
    console.error(`Could not find a "${k}" column. Headers are: ${header.join(' | ')}. Add the header to aliases.${k}.`);
    process.exit(1);
  }
}

const toDate = (v) => {
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
};
// First name + last initial, per the reviews.json schema.
const shortName = (n) => {
  const parts = n.trim().split(/\s+/);
  return parts.length > 1 ? `${parts[0]} ${parts.at(-1)[0]}.` : parts[0] ?? '';
};

const get = (r, k) => (col[k] >= 0 ? (r[col[k]] ?? '').trim() : '');
const candidates = rows
  .map((r, i) => {
    const author = get(r, 'author');
    const date = toDate(get(r, 'date'));
    return {
      id: `google-${date || 'nodate'}-${author.toLowerCase().replace(/[^a-z0-9]+/g, '') || i}`,
      platform: 'google',
      author: shortName(author),
      rating: Number.parseFloat(get(r, 'rating')),
      date,
      text: get(r, 'text'),
      loanTypes: [],
      sourceUrl: get(r, 'url'),
      hasPhoto: Boolean(get(r, 'photos')),
      piiFlags: findPii(get(r, 'text')),
      featured: false,
    };
  })
  .filter((c) => c.text)
  .sort((a, b) => b.rating - a.rating || b.text.length - a.text.length);

writeFileSync(new URL('../data/google-candidates.json', import.meta.url), JSON.stringify(candidates, null, 2));

const five = candidates.filter((c) => c.rating === 5);
console.log(`${rows.length} rows, ${candidates.length} with text, ${five.length} five-star, ${five.filter((c) => c.hasPhoto).length} five-star with photo.`);
console.log(`Missing review URLs: ${candidates.filter((c) => !c.sourceUrl).length}. Those need the Google profile URL as sourceUrl.`);
console.log(`Flagged for personal details: ${candidates.filter((c) => c.piiFlags.length).length}. Check piiFlags before featuring.`);
console.log('Wrote data/google-candidates.json. Copy chosen entries into data/reviews.json and set featured: true.');
