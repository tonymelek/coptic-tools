import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.join(__dirname, '..')

const PAGES_DIR = path.join(repoRoot, 'frontend/public/dictionary_pages')
const EXTRAS_IN = path.join(repoRoot, 'docs/extra-entries.json')
const EXTRAS_OUT = path.join(repoRoot, 'docs/extra-entries.normalized.json')

const APPLY = process.argv.includes('--apply') // without this, do a dry run

function norm(value) {
  return (value || '').normalize('NFC').trim()
}
function tokens(copticWord) {
  return norm(copticWord).split(/\s+/).filter(Boolean)
}
const isSingleWord = (e) => tokens(e.copticWord).length === 1
const isMultiWord = (e) => tokens(e.copticWord).length > 1

// --- Load existing pages (keep file provenance) ---
const pageFiles = fs.readdirSync(PAGES_DIR).filter((f) => f.endsWith('.json'))
const pages = new Map() // file -> entries[]
for (const file of pageFiles) {
  pages.set(file, JSON.parse(fs.readFileSync(path.join(PAGES_DIR, file), 'utf8')))
}

// --- Load extras ---
const extras = JSON.parse(fs.readFileSync(EXTRAS_IN, 'utf8'))

// --- Build single-word index over BOTH sources (existing pages win on ties) ---
const singleWordIndex = new Map() // key -> { entry, file|null }
for (const file of pageFiles) {
  for (const entry of pages.get(file)) {
    if (!isSingleWord(entry)) continue
    const key = norm(entry.copticWord)
    if (!singleWordIndex.has(key)) singleWordIndex.set(key, { entry, file })
  }
}
for (const entry of extras) {
  if (!isSingleWord(entry)) continue
  const key = norm(entry.copticWord)
  if (!singleWordIndex.has(key)) singleWordIndex.set(key, { entry, file: null })
}

// --- Attach multi-word extras onto their base single word ---
const removedFromExtras = new Set()
const dirtyPages = new Set()
let attachedToPage = 0
let attachedToExtra = 0
let unmatched = 0

extras.forEach((entry, i) => {
  if (!isMultiWord(entry)) return

  const match = tokens(entry.copticWord).find((tok) => singleWordIndex.has(tok))
  if (!match) {
    unmatched += 1
    return
  }

  const { entry: target, file } = singleWordIndex.get(match)
  if (!Array.isArray(target.variants)) target.variants = []
  target.variants.push(entry) // full phrase preserved (lossless)

  removedFromExtras.add(i)
  if (file) {
    dirtyPages.add(file)
    attachedToPage += 1
  } else {
    attachedToExtra += 1
  }
})

const extrasResult = extras.filter((_, i) => !removedFromExtras.has(i))

// --- Report ---
const multiWordTotal = extras.filter(isMultiWord).length
console.log(APPLY ? 'MODE: apply (writing files)' : 'MODE: dry run (no files written; pass --apply to write)')
console.log(`Existing single words:    ${[...singleWordIndex.values()].filter((v) => v.file).length}`)
console.log(`Extra single words:       ${[...singleWordIndex.values()].filter((v) => !v.file).length}`)
console.log(`Multi-word extras:        ${multiWordTotal}`)
console.log(`  attached to a page:     ${attachedToPage}`)
console.log(`  attached to an extra:   ${attachedToExtra}`)
console.log(`  kept (no match):        ${unmatched}`)
console.log(`Pages to update:          ${dirtyPages.size}`)
console.log(`Extras out:               ${extrasResult.length} (was ${extras.length})`)

if (!APPLY) {
  console.log('\nDry run complete. Re-run with --apply to write changes.')
  console.log('Revert pages afterwards with: git checkout -- frontend/public/dictionary_pages')
} else {
  for (const file of dirtyPages) {
    fs.writeFileSync(path.join(PAGES_DIR, file), JSON.stringify(pages.get(file), null, 2) + '\n')
  }
  fs.writeFileSync(EXTRAS_OUT, JSON.stringify(extrasResult, null, 2))
  console.log(`\nWrote ${dirtyPages.size} page files (in place) and ${path.relative(repoRoot, EXTRAS_OUT)}`)
  console.log('Revert pages with: git checkout -- frontend/public/dictionary_pages')
}
