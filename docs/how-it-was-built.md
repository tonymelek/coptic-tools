# How Coptic Language Was Built

The work behind the tools — the effort, the false starts, and the pipeline that
turned a scanned dictionary into a searchable, Unicode-enriched dataset.

This document is the "making of" companion to the public
[story page](../frontend/public/story.html). It records **what was actually done**,
in the order it happened, so the engineering effort behind the project is not
invisible.

---

## Table of contents

1. [Overview](#overview)
2. [Phase 1 — Mapping the Antonios font to Unicode](#phase-1--mapping-the-antonios-font-to-unicode)
3. [Phase 2 — The English pronunciation engine](#phase-2--the-english-pronunciation-engine)
4. [Phase 3 — Adding Arabic transliteration](#phase-3--adding-arabic-transliteration)
5. [Phase 4 — The PDF → JSON dictionary pipeline](#phase-4--the-pdf--json-dictionary-pipeline)
6. [Phase 5 — Enrichment: adding what the PDF never had](#phase-5--enrichment-adding-what-the-pdf-never-had)
7. [Phase 6 — The apps and libraries that tie it together](#phase-6--the-apps-and-libraries-that-tie-it-together)
8. [What made this hard](#what-made-this-hard)
9. [The value of this work](#the-value-of-this-work)

---

## Overview

Coptic Language is not a single app — it is the product of several distinct,
hard-won pieces of work, each of which required both **software engineering** and
**domain knowledge of the Coptic language** (script, phonology, and its Arabic and
English transliteration conventions).

The published artifacts are:

- **`coptic-antonios-unicode`** — converts legacy Antonios-font Latin keyboard
  text into proper Coptic Unicode.
- **`coptic-pronounce`** — transliterates Coptic Unicode into English and Arabic
  phonetics (Bohairic pronunciation).
- **The dictionary dataset** — ~170 structured JSON pages plus search indexes,
  extracted from a PDF dictionary and enriched with Unicode and transliteration
  that did not exist in the source.
- **The web app + site** — dictionary search, a Unicode converter, a pronunciation
  tool, and an on-screen Coptic keyboard.

The order below is the order it was built, because each phase depended on the
knowledge earned in the previous one.

---

## Phase 1 — Mapping the Antonios font to Unicode

Most existing Coptic digital text was never real Unicode. It was typed in **legacy
"Antonios" fonts**, where ordinary Latin keystrokes are *drawn* as Coptic letters.
The bytes on disk say `a`, `b`, `c`; the screen shows Coptic — but only if you have
that exact font installed. Search, copy-paste, screen readers, and any modern tool
all break on this text.

To fix it, I first had to **know the full mapping** — every glyph the font could
produce and its true Unicode equivalent. There was no reliable table for this, so
I built one:

- I created an **app that displays every glyph of the Antonios mapping font**, one
  per key.
- Using an **on-screen keyboard**, I matched each rendered glyph to its correct
  Coptic Unicode codepoint by hand — including the tricky cases: combining marks,
  the **overline (nomina sacra)**, the **jenkim**, and punctuation that had to be
  preserved rather than converted.

The result is the mapping that now lives in
[`coptic-antonios-unicode/src/latin_coptic_map.json`](../coptic-antonios-unicode/src/latin_coptic_map.json)
and the single-pass converter in
[`coptic-antonios-unicode/src/index.ts`](../coptic-antonios-unicode/src/index.ts).

> This phase was mostly **research, not code**. The converter is a small loop; the
> value is the correctness of the mapping, which took manual glyph-by-glyph
> verification.

---

## Phase 2 — The English pronunciation engine

With real Unicode text in hand, the next problem was pronunciation. Coptic (in the
Bohairic tradition used liturgically) has pronunciation rules that are **not a
simple 1:1 letter-to-sound substitution**:

- Some letters change sound depending on the letters around them.
- Certain letter combinations produce a single sound.
- Diacritics and the jenkim affect syllable breaks.

I encoded these rules into an **English transliterator** — the logic in
[`coptic-pronounce/src/english.ts`](../coptic-pronounce/src/english.ts) — with a
base character map plus special-case handling for the context-dependent sounds.
This was iterative: build a rule, test it against real words, find the exception,
refine.

---

## Phase 3 — Adding Arabic transliteration

Because the largest Coptic-speaking community reads Arabic, I then built a **second
transliteration target**: Coptic Unicode → Arabic phonetics
([`coptic-pronounce/src/arabic.ts`](../coptic-pronounce/src/arabic.ts)).

Arabic is not just "the English rules with Arabic letters." It has its own sound
inventory, its own conventions for representing Coptic sounds, and different
edge cases. Reusing the *architecture* of the English engine while rewriting the
*rules* is what let both live behind a single, validated API:

```ts
pronounce(copticText, 'en'); // English phonetics
pronounce(copticText, 'ar'); // Arabic phonetics
```

The public entry point ([`coptic-pronounce/src/index.ts`](../coptic-pronounce/src/index.ts))
validates that the input really is Coptic Unicode (rejecting stray characters with
a precise `U+XXXX` error) and supports both single strings and arrays.

---

## Phase 4 — The PDF → JSON dictionary pipeline

The classical dictionaries — especially **Crum** — are extraordinary references,
but they exist as **PDF scans laid out for print**, not for search. Turning one
into structured data was the largest single effort in the project.

The pipeline:

1. **Adobe PDF Extract API** — used to convert the PDF into a structured
   representation (text runs, positions, styles) rather than flat, unusable text.
2. **Custom parsers** — Adobe's output is *structured*, but it is not a
   *dictionary*. I wrote special-purpose parsers to reconstruct dictionary
   semantics from the raw structure: headwords, senses, glosses, definitions,
   variants, and cross-references — reassembling entries that print layout had
   split across columns and lines.
3. **Pagination + indexing** — the parsed entries were written out as ~170
   per-page JSON files ([`frontend/public/dictionary_pages/`](../frontend/public/dictionary_pages/))
   and three search indexes ([`frontend/public/dictionary_index/`](../frontend/public/dictionary_index/)):
   by Coptic word, by transliteration, and by meaning.

The client-side search
([`frontend/src/lib/dictionarySearch.js`](../frontend/src/lib/dictionarySearch.js))
uses those indexes to resolve a query to the right pages, then loads only those
pages — a full dictionary search with **no backend server**.

---

## Phase 5 — Enrichment: adding what the PDF never had

This is the part that is easy to overlook but is where much of the value sits.

The source PDF **did not contain Coptic Unicode, and it did not contain
transliteration.** Those had to be *generated* — which was only possible because
of the earlier phases:

- **Unicode enrichment** — the Antonios→Unicode mapping from Phase 1 was applied to
  convert the dictionary's legacy script into real, searchable Coptic Unicode.
- **Transliteration enrichment** — the engines from Phases 2 and 3 were run over
  the entries to add English (and Arabic) pronunciation that never existed in the
  original book.

In other words, the dataset is **not a scan of a dictionary** — it is a *new,
enriched dataset* derived from one. Every entry now carries information the
original never had, produced by tools built specifically for this purpose.

---

## Phase 6 — The apps and libraries that tie it together

- Two libraries published to npm with dual CJS/ESM builds and TypeScript types
  (`coptic-antonios-unicode`, `coptic-pronounce`).
- A **Vue 3** single-page app with four tools: dictionary search, Unicode
  converter, pronunciation, and an on-screen Coptic writing keyboard.
- A static marketing site served alongside the SPA, deployed to GitHub Pages via a
  custom hybrid build (marketing pages at `/`, app under `/app/`).

---

## What made this hard

- **No shortcut for the mapping.** The Antonios→Unicode table had to be verified
  glyph by glyph; getting it wrong corrupts every downstream artifact.
- **Pronunciation is rule-based, not table-based.** Context-dependent sounds and
  two different target languages meant real linguistic modeling, not lookups.
- **PDF is hostile to structure.** Print layout actively destroys the logical
  structure of a dictionary; rebuilding entries from Adobe's output required
  bespoke parsing.
- **The enrichment depended on everything before it.** The dataset could only be
  enriched because the mapping and the transliterators already existed and were
  correct.
- **It needs two kinds of expertise at once** — software engineering *and* Coptic
  domain knowledge. Very few people have both.

---

## The value of this work

There are three separable assets here, and they are worth thinking about
independently.

**1. The libraries (`coptic-antonios-unicode`, `coptic-pronounce`).**
Clean, documented, published, reusable. A competent engineer could rebuild the
*code*, but not the *correctness* — the mapping and the pronunciation rules encode
domain knowledge that took real effort to get right. These are the reusable,
give-away-to-the-community pieces.

**2. The dictionary dataset — the moat.**
This is the hardest to replicate and the most valuable. It combines:

- a painful PDF-extraction + custom-parsing pipeline, and
- enrichment (Unicode + transliteration) that **did not exist in the source**,
  made possible only by the libraries built earlier.

The result is a structured, searchable, enriched dataset that essentially does not
exist elsewhere in this form. That scarcity — plus the fact that producing it needs
both the pipeline skills and the language knowledge — is where the real value is.

**3. The product (app + site + deployment).**
The delivery layer that makes all of the above usable by non-technical people every
day.

### In effort terms

Rebuilding this as contract work is realistically **~20–33 focused days**
(~160–260 hours) once you account for the glyph-mapping research, two
transliteration engines, the PDF pipeline, the enrichment step, and the app. At
professional rates that is on the order of **~$12k–20k** for a mid-market
delivery (more at senior Western freelance rates, less in lower-cost regions).

The single most valuable and least replicable component is the **PDF → JSON →
enriched dataset pipeline**, precisely because it required all the earlier work to
exist first.

> One caveat worth noting for any commercial use: check the **copyright status of
> the source dictionary**. The *enriched dataset and the tooling* are your original
> work, but the underlying dictionary content may carry its own licensing
> constraints that affect resale or redistribution.
