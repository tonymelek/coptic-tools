import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.join(__dirname, '..')
const PAGES_DIR = path.join(repoRoot, 'frontend/public/dictionary_pages')

const APPLY = process.argv.includes('--apply')
const isNumericLabel = (label) => typeof label === 'string' && /^\d+$/.test(label.trim())

// Strip numeric `label` from every sense on an entry (and nested variants).
function cleanEntry(entry) {
  let removed = 0

  for (const sense of entry.senses || []) {
    if (isNumericLabel(sense.label)) {
      delete sense.label
      removed += 1
    }
  }
  for (const variant of entry.variants || []) {
    removed += cleanEntry(variant)
  }

  return removed
}

const pageFiles = fs
  .readdirSync(PAGES_DIR)
  .filter((f) => /^\d+\.json$/.test(f))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))

let removedOld = 0
let removedNew = 0
const changedPages = new Map()

for (const file of pageFiles) {
  const pageNum = parseInt(file, 10)
  const data = JSON.parse(fs.readFileSync(path.join(PAGES_DIR, file), 'utf8'))
  const entries = Array.isArray(data) ? data : data.entries || []

  let removed = 0
  for (const entry of entries) removed += cleanEntry(entry)

  if (removed > 0) {
    changedPages.set(file, entries)
    if (pageNum >= 176) removedNew += removed
    else removedOld += removed
  }
}

console.log(APPLY ? 'MODE: apply (writing files)' : 'MODE: dry run (pass --apply to write)')
console.log(`Numeric sense labels removed:  ${removedOld + removedNew}`)
console.log(`  in original pages (<176):    ${removedOld}`)
console.log(`  in new pages (>=176):        ${removedNew}`)
console.log(`Pages affected:                ${changedPages.size}`)

if (APPLY) {
  for (const [file, entries] of changedPages) {
    fs.writeFileSync(path.join(PAGES_DIR, file), JSON.stringify(entries, null, 2) + '\n')
  }
  console.log(`\nWrote ${changedPages.size} page files. (Labels aren't indexed — no re-index needed.)`)
} else {
  console.log('\nDry run complete. Re-run with --apply to write.')
}
