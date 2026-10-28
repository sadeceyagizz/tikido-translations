# Translation guide

Read this and the [glossary](glossary.md) before you start. The glossary lists the words Tikido uses for its
own ideas (streak, focus round, schedule block…) and how they were translated so far.

## How the files work

Every text Tikido shows is a key and a value:

```json
"today": { "title": "Today" }
```

`today.title` is the key: the app asks for it, and shows the value of the language in use. Translating means
changing values only. Keys and structure stay the same.

`tr.json` is the source: every key starts there. A key your language doesn't have yet shows in English.

## The `_meta` block

Each file starts with a short description of the language:

```json
"_meta": { "name": "Deutsch", "locale": "de-DE", "translators": ["Your Name"] }
```

- `name` is the language's name in the language itself. It shows in the app's language picker.
- `locale` decides how dates and numbers are written.
- `translators` is how you're credited in the app. Add your name when you contribute.

## The rules

**Keep the placeholders.** Text in double braces is filled in by the app: `{{n}}`, `{{name}}`, `{{time}}`.
Copy them exactly, but move them wherever your grammar needs them:

```json
"movedToDay": "\"{{title}}\" {{day}} gününe taşındı"
"movedToDay": "\"{{title}}\" moved to {{day}}"
```

The check fails if a placeholder is missing, renamed or added.

**Keep lists the same length.** `date.weekdayShort`, `weekdayLong`, `weekdayInSentence` and `weekdayMini`
have seven items and start on **Monday**. `weekdayInSentence` is the day as written inside a sentence
("Every Monday" in English, "Her pazartesi" in Turkish): lowercase it if your language does.

**Mind the space.** Some text sits in tight spots. Keep these about as short as the English:

| Keys | Where it shows | Room |
| --- | --- | --- |
| `date.weekdayMini` | Under the habit and streak dots | 2 letters |
| `date.weekdayShort` | Week strip, calendar | 3 letters |
| `tabs.*` | Bottom tab bar | 1 short word |
| `focus.controls.*`, `widgets.focus.*` | Buttons, home screen widget | 2–3 words |
| `badges.tiers.*` | Under badge medals | 1 word |
| `duration.*` | Everywhere times are shown | Use your short unit (`min`, `h`) |

**Dates and numbers are formatted for you.** Day and month names inside dates come from the device's
locale. Don't write date formats into the texts.

**Plurals.** Keys ending in `_one` and `_other` (`counts.task_one`, `streak.label_other`…) are
[i18next plurals](https://www.i18next.com/translation-function/plurals): the app picks the right one for the
number. If your language has more forms, add them next to these (`task_few`, `task_many`); the check tells
you exactly which forms your language needs. Always keep `_one` and `_other`, even if your language uses a
single form (like Turkish): some phones only know those two.

**File names stay file-safe.** `backup.filePrefix` and `theme.library.filePrefix` become file names:
lowercase, no spaces, no punctuation except `-`.

**Sample data is yours.** `seed.*` are the example tasks a new user sees. Pick everyday examples that fit
your language and culture, not literal translations.

## Voice

Tikido talks like a friend who is happy to see you. Tiki, the hedgehog, is the one speaking.

- Address the user informally and in the singular: Turkish *sen*, German *du*, French *tu*, Spanish *tú*.
- Tiki speaks in the first person ("Let me get to know you a little"). The app never says "we" for itself
  except when Tiki suggests doing something together ("Shall we finish it together?").
- Warm, short and plain. No jargon, no exclamation marks in every line, no guilt
  ("You broke your streak" ✗, "A new streak started" ✓).
- Buttons say what happens: "Start break", "Save", "Restore". Sentence case, not Title Case.
- Accessibility labels (keys ending in `A11y`) are read aloud by screen readers. Write them as full,
  clear phrases. They don't need to be short.

## Seeing your translation in the app

In Tikido, open **Settings → Help translate**:

- **Show text keys** replaces every text with its key, so you can find which key a text on screen comes
  from.
- **Try a translation file** loads your file on that device only, checks it, and opens the app in your
  language.

## What isn't in these files

Typing "tomorrow 3pm math" in quick add is understood by language rules written in the app's code,
currently Turkish and English only. In other languages quick add keeps the typed text as the title, and
dates are picked by hand.
