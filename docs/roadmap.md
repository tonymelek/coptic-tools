# Coptic Shell — Vision & Roadmap

**Coptic Shell** is a growing platform of open, modern tools for the Coptic
community — students, researchers, families in the diaspora, and the wider Church.
Each app lives under one shell, shares a common design and foundation, and reuses
the same open-source libraries, so the whole platform grows faster with every piece
added.

> Built bit by bit, with care — a living project, not a one-off release.

---

## The vision

For too long, working with the Coptic language and liturgy has meant fighting the
tools: legacy fonts that don't copy or search, dictionaries locked inside PDF
scans, pronunciation rules scattered across books and notes, and liturgical texts
hard to follow along. Coptic Shell exists to bring these into one clean, fast, and
open home — so people spend less time wrestling with tools and more time with the
language, the prayers, and each other.

Everything is built to serve the community openly, on a shared foundation:

- A **common design system** across every app.
- Two open-source **npm libraries** (`coptic-antonios-unicode`, `coptic-pronounce`)
  reused everywhere.
- A single deployment pipeline, so new apps ship quickly and consistently.

---

## Roadmap

### Live now

#### Language
The flagship. Dictionary search, legacy-font → Unicode conversion, and
English/Arabic pronunciation — plus an on-screen Coptic keyboard.

- Search a classical dictionary by Coptic word, transliteration, or meaning.
- Convert Antonios-font text to proper Coptic Unicode.
- Hear/read pronunciation in English and Arabic.
- See [how it was built](./how-it-was-built.md).

**Status:** Live.

---

### Coming soon

#### Liturgy — Holy Week & Psalmody
Follow the services of Holy Week (Pascha) and the Psalmody with clear, readable
text and script/pronunciation support built in — powered by the same Unicode and
transliteration engines behind Language.

**Status:** In progress.

#### Readings
The daily readings (Katameros) in a clean, modern reader — easy to follow, easy to
search, made for daily use.

**Status:** Planned.

#### Community *(separate track)*
A dedicated app helping Coptic Christians connect and build meaningful
relationships. Because this involves personal data, safety, and moderation, it is
being built as its own focused product rather than folded into the study tools —
with the care that a community of people deserves.

**Status:** Early development.

---

## Why one platform

- **Shared foundation** — every app reuses the same libraries, design, and
  deployment, so quality and consistency carry across the whole suite.
- **Built to last** — open libraries mean the hardest work (the glyph mapping, the
  pronunciation rules) is done once, verified, and reused.
- **Community first** — corrections, sources, and contributions from readers make
  the data better over time.

---

## Follow along

The platform is launching soon. New apps will appear here as they go live — this
roadmap is updated as each piece ships.

- Repository: https://github.com/tonymelek/coptic-tools
- Get in touch / suggest a source: via the site's contact page.
