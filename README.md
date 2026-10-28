# Tikido translations

Tikido is a calm, friendly day planner with a hedgehog called Tiki. This repository holds every text the
app shows, in every language it speaks, so anyone can help bring Tikido to their language.

*Tikido'nun bütün metinleri burada. Uygulamayı kendi diline çevirmek isteyen herkes katkıda bulunabilir.*

| Language | File | Translators |
| --- | --- | --- |
| Türkçe | [`locales/tr.json`](locales/tr.json) | Tikido |
| English | [`locales/en.json`](locales/en.json) | Tikido |

## How to help

**On the website (easiest).** Open [tikido.expo.app/ceviri](https://tikido.expo.app/ceviri), sign in with
GitHub, pick a language and translate the texts one by one. When you send it for review, the site opens a
pull request here in your name. No files, no Git.

**With a pull request.** Prefer working with files?

1. Fork this repository.
2. Copy `locales/en.json` to `locales/<code>.json`, using the two-letter
   [ISO 639-1](https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes) code: `de.json`, `es.json`.
3. Translate it, following the [guide](docs/guide.md) and the [glossary](docs/glossary.md).
4. Check it with Node 24 or newer, and fix what it reports:

   ```bash
   node scripts/check.mjs de
   ```

5. Open a pull request. The same check runs on it automatically.

Fixing a single text in an existing language is welcome too: edit that line and open a pull request.

## What happens next

We read every pull request. Once a translation is merged, it ships with the next version of Tikido on
the web and on phones, and your name appears among the translators in the app.

A translation doesn't have to be complete to be merged: texts it doesn't have yet show in English.

## License

Translations, the guide and the glossary are [CC BY 4.0](LICENSE): free to share and adapt, with credit to
the translators. The scripts are MIT.
