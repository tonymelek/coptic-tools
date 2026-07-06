# coptic-tools

Monorepo for **Coptic Language** — open tools for script conversion, pronunciation, and dictionary search.

| Package / app | Purpose |
|---------------|---------|
| [`coptic-antonios-unicode`](./coptic-antonios-unicode/) | Convert legacy Antonios-font Latin text → Coptic Unicode |
| [`coptic-pronounce`](./coptic-pronounce/) | Transliterate Coptic Unicode → English or Arabic phonetics |
| [`frontend`](./frontend/) | Web app (dictionary, Unicode converter, pronunciation, keyboard) + static site |

**How it was built:** the glyph mapping, transliteration engines, PDF extraction pipeline, and dictionary enrichment are documented in **[docs/how-it-was-built.md](./docs/how-it-was-built.md)**. The public-facing version lives on the [Our story](https://tonymelek.github.io/coptic-tools/story.html) page.

## Quick start

**Libraries** (from repo root):

```bash
npm run build
```

**Frontend** (local dev):

```bash
cd frontend
pnpm install   # or npm install
pnpm dev
```

Open `/app/` for the tools; marketing pages are served at `/`.

## Documentation

- [How it was built](./docs/how-it-was-built.md) — full build story and value of the work
- [coptic-antonios-unicode README](./coptic-antonios-unicode/README.md)
- [coptic-pronounce README](./coptic-pronounce/README.md)

## Repository

https://github.com/tonymelek/coptic-tools
