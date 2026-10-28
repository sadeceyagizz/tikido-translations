// Checks a language file against the Turkish source and makes it safe to load. Shared by the app's
// translation tools, the translation website, `npm run check:i18n` and the translations repository's check
// (copied there by `npm run locales:export`). Node runs this file directly, so it imports nothing.

export type Tree = { [key: string]: string | string[] | Tree };
type Value = string | string[];

export type Problem =
  | { type: 'missing' | 'missingPlural' | 'unknown' | 'empty' | 'listEmpty' | 'meta'; key: string }
  | { type: 'placeholders'; key: string; want: string[]; got: string[] }
  | { type: 'listLength'; key: string; want: number; got: number }
  | { type: 'kind'; key: string; want: 'list' | 'text' };

export type LanguageMeta = { name: string; locale: string; translators: string[] };

const PLURAL = /_(zero|one|two|few|many|other)$/;
const LOCALE = /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/;

const isTree = (v: unknown): v is Tree => typeof v === 'object' && v !== null && !Array.isArray(v);
const isList = (v: unknown): v is string[] => Array.isArray(v) && v.every((s) => typeof s === 'string');
const placeholders = (s: string) => [...s.matchAll(/\{\{\s*(\w+)\s*\}\}/g)].map((m) => m[1] ?? '').sort();
const same = (a: string[], b: string[]) => a.length === b.length && a.every((x, i) => x === b[i]);

/** Every string and list by its dotted key, without the _meta block. */
export function flatten(tree: Tree, prefix = '', out = new Map<string, Value>()) {
  for (const [key, value] of Object.entries(tree)) {
    if (!prefix && key === '_meta') continue;
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string' || Array.isArray(value)) out.set(path, value);
    else if (isTree(value)) flatten(value, path, out);
  }
  return out;
}

/** The plural forms a language needs: its own, plus one and other, which phones without plural rules use. */
export function pluralForms(code: string) {
  let own: string[] = [];
  try {
    own = new Intl.PluralRules(code).resolvedOptions().pluralCategories;
  } catch {
    // No plural rules on this device: one and other are what i18next falls back to.
  }
  return [...new Set([...own, 'one', 'other'])];
}

/** The language code a file is for, from its _meta.locale ("de-DE" → "de"); null if it has none. */
export function codeOf(file: unknown): string | null {
  const locale = isTree(file) && isTree(file._meta) ? file._meta.locale : undefined;
  return typeof locale === 'string' && LOCALE.test(locale) ? (locale.split('-')[0] ?? null) : null;
}

export function metaOf(file: unknown): LanguageMeta | null {
  if (!isTree(file) || !isTree(file._meta)) return null;
  const { name, locale, translators } = file._meta;
  if (typeof name !== 'string' || !name.trim() || typeof locale !== 'string' || !LOCALE.test(locale)) return null;
  return { name: name.trim(), locale, translators: isList(translators) ? translators : [] };
}

function checkMeta(code: string, file: Tree): Problem[] {
  const meta = isTree(file._meta) ? file._meta : null;
  if (!meta) return [{ type: 'meta', key: '_meta' }];
  const problems: Problem[] = [];
  if (typeof meta.name !== 'string' || !meta.name.trim()) problems.push({ type: 'meta', key: '_meta.name' });
  if (typeof meta.locale !== 'string' || !LOCALE.test(meta.locale) || !meta.locale.startsWith(code)) problems.push({ type: 'meta', key: '_meta.locale' });
  if (!isList(meta.translators)) problems.push({ type: 'meta', key: '_meta.translators' });
  return problems;
}

/** Everything wrong with a language file, compared with the source. */
export function validate(source: Tree, file: Tree, code: string): Problem[] {
  const src = flatten(source);
  const target = flatten(file);
  const problems = checkMeta(code, file);
  const forms = pluralForms(code);
  const pluralBases = new Set([...src.keys()].filter((k) => k.endsWith('_one')).map((k) => k.replace(PLURAL, '')));

  for (const base of pluralBases) {
    for (const form of forms) {
      const key = `${base}_${form}`;
      if (!src.has(key) && target.get(key) === undefined) problems.push({ type: 'missingPlural', key });
    }
  }

  for (const [key, value] of src) {
    const other = target.get(key);
    if (other === undefined) {
      problems.push({ type: 'missing', key });
      continue;
    }
    if (Array.isArray(value) !== Array.isArray(other)) {
      problems.push({ type: 'kind', key, want: Array.isArray(value) ? 'list' : 'text' });
      continue;
    }
    if (Array.isArray(value)) {
      if (value.length !== other.length) problems.push({ type: 'listLength', key, want: value.length, got: other.length });
      if ((other as string[]).some((s) => typeof s !== 'string' || !s.trim())) problems.push({ type: 'listEmpty', key });
      continue;
    }
    if (typeof other !== 'string' || !other.trim()) {
      problems.push({ type: 'empty', key });
      continue;
    }
    const want = placeholders(value as string);
    const got = placeholders(other);
    if (!same(want, got)) problems.push({ type: 'placeholders', key, want, got });
  }

  for (const key of target.keys()) {
    if (src.has(key)) continue;
    const base = key.replace(PLURAL, '');
    if (base !== key && pluralBases.has(base) && forms.includes(key.slice(base.length + 1))) continue;
    problems.push({ type: 'unknown', key });
  }
  return problems;
}

/**
 * Only the parts of a file that can't break the app: known keys whose value has the right shape (text
 * for text, a list of the right length for a list). Whatever is left out shows in English instead.
 */
export function sanitize(source: Tree, file: Tree, code: string): Tree {
  const src = flatten(source);
  const forms = pluralForms(code);
  const out: Tree = {};
  for (const [key, value] of flatten(file)) {
    const want = src.get(key) ?? src.get(`${key.replace(PLURAL, '')}_one`);
    if (want === undefined || (!src.has(key) && !forms.includes(key.slice(key.lastIndexOf('_') + 1)))) continue;
    const fits = Array.isArray(want)
      ? isList(value) && value.length === want.length && value.every((s) => s.trim())
      : typeof value === 'string' && value.trim() !== '';
    if (!fits) continue;
    const path = key.split('.');
    let node = out;
    for (const part of path.slice(0, -1)) node = (node[part] = isTree(node[part]) ? node[part] : {}) as Tree;
    node[path[path.length - 1] ?? key] = value;
  }
  return out;
}
