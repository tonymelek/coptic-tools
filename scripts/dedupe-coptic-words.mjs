import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.join(__dirname, '..')
const PAGES_DIR = path.join(repoRoot, 'frontend/public/dictionary_pages')
const DELETED_OUT = path.join(repoRoot, 'docs/deleted-duplicates.json')

const APPLY = process.argv.includes('--apply')

const normCoptic = (v) => (v || '').normalize('NFC').trim()
const normMeaning = (v) => (v || '').normalize('NFC').replace(/\s+/g, ' ').trim().toLowerCase()
const meaningOf = (e) => normMeaning(e.gloss || e.definition)

const pageFiles = fs
  .readdirSync(PAGES_DIR)
  .filter((f) => /^\d+\.json$/.test(f))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))

const seen = new Map() // copticWord -> { pageId, meaning }
let totalEntries = 0
let deletedIdentical = 0
let deletedDifferent = 0
const differentExamples = []
const changedPages = new Map() // file -> filtered entries
const deletedEntries = [] // preserved so nothing is truly lost

for (const file of pageFiles) {
  const pageId = file.replace(/\.json$/, '')
  const data = JSON.parse(fs.readFileSync(path.join(PAGES_DIR, file), 'utf8'))
  const entries = Array.isArray(data) ? data : data.entries || []
  const kept = []
  let changed = false

  for (const entry of entries) {
    totalEntries += 1
    const key = normCoptic(entry.copticWord)

    if (key && seen.has(key)) {
      const first = seen.get(key)
      const sameMeaning = first.meaning === meaningOf(entry)
      if (sameMeaning) deletedIdentical += 1
      else {
        deletedDifferent += 1
        if (differentExamples.length < 15) {
          differentExamples.push(
            `  ${entry.copticWord}  (p.${pageId}: "${entry.gloss || entry.definition || ''}")  ` +
              `dropped; kept p.${first.pageId}: "${first.gloss || ''}"`,
          )
        }
      }
      deletedEntries.push({
        copticWord: entry.copticWord,
        fromPage: pageId,
        keptOnPage: first.pageId,
        sameMeaning,
        entry,
      })
      changed = true
      continue // delete this duplicate
    }

    if (key) seen.set(key, { pageId, meaning: meaningOf(entry), gloss: entry.gloss || entry.definition })
    kept.push(entry)
  }

  if (changed) changedPages.set(file, kept)
}

console.log(APPLY ? 'MODE: apply (writing files)' : 'MODE: dry run (pass --apply to write)')
console.log(`Total entries:                 ${totalEntries}`)
console.log(`Unique copticWords:            ${seen.size}`)
console.log(`Duplicates to delete:          ${deletedIdentical + deletedDifferent}`)
console.log(`  identical meaning:           ${deletedIdentical}`)
console.log(`  DIFFERENT meaning (homograph): ${deletedDifferent}`)
console.log(`Pages affected:                ${changedPages.size}`)
console.log(`Entries remaining:             ${totalEntries - deletedIdentical - deletedDifferent}`)

if (differentExamples.length) {
  console.log(`\nExamples of DIFFERENT-meaning entries that would be deleted:`)
  console.log(differentExamples.join('\n'))
}

if (APPLY) {
  for (const [file, kept] of changedPages) {
    fs.writeFileSync(path.join(PAGES_DIR, file), JSON.stringify(kept, null, 2) + '\n')
  }
  fs.writeFileSync(DELETED_OUT, JSON.stringify(deletedEntries, null, 2) + '\n')
  console.log(`\nWrote ${changedPages.size} page files.`)
  console.log(`Preserved ${deletedEntries.length} deleted entries in ${path.relative(repoRoot, DELETED_OUT)}`)
  console.log('Now rebuild indexes:')
  console.log('  node scripts/build-page-indexes.mjs')
} else {
  console.log('\nDry run complete. Re-run with --apply to delete duplicates.')
}
