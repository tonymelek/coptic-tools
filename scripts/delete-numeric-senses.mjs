import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.join(__dirname, '..')
const PAGES_DIR = path.join(repoRoot, 'frontend/public/dictionary_pages')
const DELETED_OUT = path.join(repoRoot, 'docs/deleted-senses.json')

const APPLY = process.argv.includes('--apply')

// Every numeric-labeled sense came from the new lexicon, which lives either on
// new pages (>=176) or inside merged phrase-variants (identified by a `headword`
// field — the original data never has that on a variant). We delete those whole
// senses; original entry/variant senses (non-numeric or unlabeled) are kept.

const deleted = []

function recordAndClear(node, pageId, reason) {
  if (Array.isArray(node.senses) && node.senses.length) {
    for (const sense of node.senses) {
      deleted.push({ page: pageId, on: node.copticWord || node.headword || null, reason, sense })
    }
  }
  delete node.senses
}

// Strip senses from this node and its entire variant subtree.
function stripSubtree(node, pageId, reason) {
  recordAndClear(node, pageId, reason)
  for (const v of node.variants || []) stripSubtree(v, pageId, reason)
}

// Old page: keep original senses; only strip inside merged (headword) subtrees.
function processOld(node, pageId, insideMerged) {
  if (insideMerged) recordAndClear(node, pageId, 'merged-phrase-variant')
  for (const v of node.variants || []) {
    const merged = insideMerged || Object.prototype.hasOwnProperty.call(v, 'headword')
    processOld(v, pageId, merged)
  }
}

const pageFiles = fs
  .readdirSync(PAGES_DIR)
  .filter((f) => /^\d+\.json$/.test(f))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))

const changedPages = new Map()

for (const file of pageFiles) {
  const pageNum = parseInt(file, 10)
  const pageId = file.replace(/\.json$/, '')
  const before = deleted.length
  const entries = JSON.parse(fs.readFileSync(path.join(PAGES_DIR, file), 'utf8'))

  for (const entry of Array.isArray(entries) ? entries : entries.entries || []) {
    if (pageNum >= 176) stripSubtree(entry, pageId, 'new-page')
    else processOld(entry, pageId, false)
  }

  if (deleted.length > before) changedPages.set(file, entries)
}

const fromNew = deleted.filter((d) => d.reason === 'new-page').length
const fromMerged = deleted.filter((d) => d.reason === 'merged-phrase-variant').length

console.log(APPLY ? 'MODE: apply (writing files)' : 'MODE: dry run (pass --apply to write)')
console.log(`Senses deleted:            ${deleted.length}`)
console.log(`  on new pages (>=176):    ${fromNew}`)
console.log(`  in merged phrases (<176): ${fromMerged}`)
console.log(`Pages affected:            ${changedPages.size}`)

if (APPLY) {
  for (const [file, entries] of changedPages) {
    fs.writeFileSync(path.join(PAGES_DIR, file), JSON.stringify(entries, null, 2) + '\n')
  }
  fs.writeFileSync(DELETED_OUT, JSON.stringify(deleted, null, 2) + '\n')
  console.log(`\nWrote ${changedPages.size} pages. Preserved ${deleted.length} senses in ${path.relative(repoRoot, DELETED_OUT)}`)
  console.log('Now rebuild indexes:  node scripts/build-page-indexes.mjs')
} else {
  console.log('\nDry run complete. Re-run with --apply to delete.')
}
