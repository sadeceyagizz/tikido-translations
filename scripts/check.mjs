// Checks every language file in locales/ against the Turkish source (tr.json): the same keys, the same
// {{placeholders}}, lists of the same length, no empty texts, the plural forms the language needs, and a
// _meta block with the language's own name and a locale tag. The same rules run in the app and on the
// translation website (validate.ts is copied from the app).
// Run: node scripts/check.mjs        (every language)
//      node scripts/check.mjs de     (one language)
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { validate } from './validate.ts';

const DIR = join(import.meta.dirname, '..', 'locales');

const load = (lang) => JSON.parse(readFileSync(join(DIR, `${lang}.json`), 'utf8'));
const list = (names) => names.join(', ') || 'none';

const MESSAGES = {
  missing: (p) => `missing: ${p.key}`,
  missingPlural: (p) => `missing plural form: ${p.key}`,
  unknown: (p) => `unknown key: ${p.key}`,
  empty: (p) => `${p.key}: empty`,
  listEmpty: (p) => `${p.key}: has an empty item`,
  listLength: (p) => `${p.key}: needs ${p.want} items, has ${p.got}`,
  kind: (p) => `${p.key}: should be ${p.want === 'list' ? 'a list' : 'text'}`,
  placeholders: (p) => `${p.key}: placeholders should be ${list(p.want)}, found ${list(p.got)}`,
  meta: (p) =>
    ({
      _meta: '_meta: missing',
      '_meta.name': '_meta.name: the language name, written in the language',
      '_meta.locale': '_meta.locale: a locale tag starting with the file name, like "de-DE" in de.json',
      '_meta.translators': '_meta.translators: a list of names (it can be empty)',
    })[p.key],
};

const source = load('tr');
const asked = process.argv[2];
const langs = asked ? [asked] : readdirSync(DIR).filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, ''));

let failed = false;
for (const lang of langs) {
  const problems = validate(source, load(lang), lang);
  if (!/^[a-z]{2,3}$/.test(lang)) problems.unshift({ type: 'file' });
  if (problems.length === 0) {
    console.log(`${lang}: ok`);
    continue;
  }
  failed = true;
  console.log(`${lang}: ${problems.length} problem(s)`);
  for (const p of problems) console.log(`  - ${p.type === 'file' ? 'file name: use the two-letter language code, like de.json' : MESSAGES[p.type](p)}`);
}
process.exit(failed ? 1 : 0);
