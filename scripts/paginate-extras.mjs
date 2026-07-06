import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.join(__dirname, '..')

const EXTRAS = path.join(repoRoot, 'docs/extra-entries.normalized.json')
const PAGES_DIR = path.join(repoRoot, 'frontend/public/dictionary_pages')

const CHUNK = 250
const APPLY = process.argv.includes('--apply')

const pad = (n) => String(n).padStart(3, '0')

const entries = JSON.parse(fs.readFileSync(EXTRAS, 'utf8'))

// Determine next page number.
const existing = fs.readdirSync(PAGES_DIR).filter((f) => /^\d+\.json$/.test(f))
const maxExisting = Math.max(...existing.map((f) => parseInt(f, 10)))
let pageNum = maxExisting + 1

// Chunk into pages.
const newPages = [] // { id, entries }
for (let i = 0; i < entries.length; i += CHUNK) {
  newPages.push({ id: pad(pageNum), entries: entries.slice(i, i + CHUNK) })
  pageNum += 1
}

console.log(APPLY ? 'MODE: apply (writing files)' : 'MODE: dry run (pass --apply to write)')
console.log(`Entries to paginate:    ${entries.length}`)
console.log(`New pages:              ${newPages.length}  (${newPages[0].id}.json .. ${newPages[newPages.length - 1].id}.json)`)
console.log(`Last page size:         ${newPages[newPages.length - 1].entries.length}`)

if (!APPLY) {
  console.log('\nDry run complete. Re-run with --apply to write the pages.')
} else {
  for (const page of newPages) {
    fs.writeFileSync(path.join(PAGES_DIR, `${page.id}.json`), JSON.stringify(page.entries, null, 2) + '\n')
  }
  console.log(`\nWrote ${newPages.length} pages.`)
  console.log('Now rebuild indexes:  node scripts/build-page-indexes.mjs')
  console.log('Revert pages with:    git checkout -- frontend/public/dictionary_pages')
}
