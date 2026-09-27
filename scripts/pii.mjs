// Flags client personal details in review text. Per Bill: a city and state
// are fine; street addresses, contact details, and signatures are not.
const checks = [
  ['email address', /[\w.+-]+@[\w-]+\.[\w.]+/],
  ['phone number', /\(?\b\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}\b/],
  ['street address', /\b\d{1,6}\s+(?:[NSEW]\.?\s+)?[A-Za-z0-9]+(?:\s+[A-Za-z0-9]+)?\s+(?:St|Street|Ave|Avenue|Rd|Road|Dr|Drive|Blvd|Boulevard|Ln|Lane|Ct|Court|Way|Pl|Place|Cir|Circle|Pkwy|Parkway|Ter|Terrace)\b\.?/i],
  ['apartment or unit', /\b(?:apt|apartment|unit|suite|ste)\.?\s*#?\s*\d+/i],
  ['ZIP code', /\b\d{5}(?:-\d{4})?\b/],
  ['loan or account number', /\b(?:loan|account|acct)\s*(?:number|no\.?|#)\s*[:#]?\s*\d{4,}/i],
  ['signature', /(?:^|[.!?\s])[-–—]\s*[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?(?:\s*(?:&|and)\s*[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)?\s*$/],
];

export const findPii = (text) => checks.filter(([, re]) => re.test(text)).map(([label]) => label);
