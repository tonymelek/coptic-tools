import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.join(__dirname, '..')

const PAGES_DIR = path.join(repoRoot, 'frontend/public/dictionary_pages')
const EXTERNAL = '/Users/tonymelek/Desktop/projects/kella-coptic-dictionary/xml/Comprehensive_Coptic_Lexicon-v1.2-2020.page.json'
const OUT = path.join(repoRoot, 'docs/extra-entries.json')

/** How we decide two entries are "the same". Change this to tune matching. */
const KEY_MODE = process.env.KEY_MODE || 'copticWord+gloss' // or 'copticWord'

function norm(value) {
  return (value || '').normalize('NFC').trim().toLowerCase()
}

function entryKey(entry) {
  const coptic = norm(entry.copticWord)
  if (KEY_MODE === 'copticWord') return coptic
  return `${coptic}\u0000${norm(entry.gloss || entry.definition)}`
}

function loadPagesEntries() {
  const files = fs.readdirSync(PAGES_DIR).filter((f) => f.endsWith('.json'))
  const entries = []
  for (const file of files) {
    const raw = fs.readFileSync(path.join(PAGES_DIR, file), 'utf8')
    const data = JSON.parse(raw)
    const list = Array.isArray(data) ? data : data.entries || []
    entries.push(...list)
  }
  return entries
}

const existing = loadPagesEntries()
const existingKeys = new Set(existing.map(entryKey))

const external = JSON.parse(fs.readFileSync(EXTERNAL, 'utf8'))
const externalList = Array.isArray(external) ? external : external.entries || []

const seen = new Set()
const extra = []
for (const entry of externalList) {
  const key = entryKey(entry)
  if (existingKeys.has(key)) continue
  if (seen.has(key)) continue // de-dupe within the external file itself
  seen.add(key)
  extra.push(entry)
}

fs.writeFileSync(OUT, JSON.stringify(extra, null, 2))

console.log(`Key mode:            ${KEY_MODE}`)
console.log(`Existing entries:    ${existing.length} (${existingKeys.size} unique keys)`)
console.log(`External entries:    ${externalList.length}`)
console.log(`Extra (net-new):     ${extra.length}`)
console.log(`Written to:          ${path.relative(repoRoot, OUT)}`)
