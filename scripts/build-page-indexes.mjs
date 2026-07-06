#!/usr/bin/env node
/**
 * Build lookup indexes from frontend/public/dictionary_pages/*.json
 *
 * Each index maps a field value to page filenames (without .json).
 * Duplicate keys collect unique page ids in sorted order.
 *
 * Field mapping mirrors what frontend/src/lib/dictionarySearch.js filters on:
 *   copticWord      <- entry.copticWord, variant.copticWord
 *   transliteration <- entry.headword, entry.englishTransliteration,
 *                      variant.word, variant.englishTransliteration
 *   definition      <- entry.definition, entry.gloss, sense.definition, sense.gloss
 *
 * Usage (from repo root):
 *   node scripts/build-page-indexes.mjs
 *   node scripts/build-page-indexes.mjs --pages-dir <path> --out-dir <path>
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  let pagesDir = path.join(__dirname, '../frontend/public/dictionary_pages');
  let outDir = path.join(__dirname, '../frontend/public/dictionary_index');

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--pages-dir' && argv[i + 1]) {
      pagesDir = path.resolve(argv[++i]);
    } else if (arg === '--out-dir' && argv[i + 1]) {
      outDir = path.resolve(argv[++i]);
    } else if (arg === '-h' || arg === '--help') {
      console.error(
        'Usage: node build-page-indexes.mjs [--pages-dir <path>] [--out-dir <path>]'
      );
      process.exit(1);
    }
  }

  return { pagesDir, outDir };
}

function addToIndex(index, key, pageId) {
  if (!key) return;
  const trimmed = String(key).trim();
  if (!trimmed) return;

  if (!index[trimmed]) {
    index[trimmed] = new Set();
  }
  index[trimmed].add(pageId);
}

function finalizeIndex(index) {
  const out = {};
  for (const key of Object.keys(index).sort()) {
    out[key] = [...index[key]].sort();
  }
  return out;
}

function collectFromEntry(entry, pageId, indexes) {
  addToIndex(indexes.copticWord, entry.copticWord, pageId);
  addToIndex(indexes.transliteration, entry.headword, pageId);
  addToIndex(indexes.transliteration, entry.englishTransliteration, pageId);
  addToIndex(indexes.definition, entry.definition, pageId);
  addToIndex(indexes.definition, entry.gloss, pageId);

  for (const variant of entry.variants || []) {
    addToIndex(indexes.copticWord, variant.copticWord, pageId);
    addToIndex(indexes.transliteration, variant.word, pageId);
    addToIndex(indexes.transliteration, variant.englishTransliteration, pageId);
  }

  for (const sense of entry.senses || []) {
    addToIndex(indexes.definition, sense.definition, pageId);
    addToIndex(indexes.definition, sense.gloss, pageId);
  }
}

function loadEntries(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.entries)) return data.entries;
  return [];
}

function main() {
  const { pagesDir, outDir } = parseArgs(process.argv.slice(2));

  const pageFiles = fs
    .readdirSync(pagesDir)
    .filter((name) => /^\d+\.json$/i.test(name))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const indexes = {
    copticWord: {},
    transliteration: {},
    definition: {},
  };

  for (const file of pageFiles) {
    const pageId = file.replace(/\.json$/i, '');
    const data = JSON.parse(fs.readFileSync(path.join(pagesDir, file), 'utf8'));

    for (const entry of loadEntries(data)) {
      collectFromEntry(entry, pageId, indexes);
    }
  }

  fs.mkdirSync(outDir, { recursive: true });

  const outputs = [
    ['copticWord.json', indexes.copticWord],
    ['transliteration.json', indexes.transliteration],
    ['definition.json', indexes.definition],
  ];

  for (const [filename, index] of outputs) {
    const outPath = path.join(outDir, filename);
    const finalized = finalizeIndex(index);
    fs.writeFileSync(outPath, JSON.stringify(finalized, null, 2), 'utf8');
    console.log(`Wrote ${outPath} (${Object.keys(finalized).length} keys)`);
  }

  console.log(`Indexed ${pageFiles.length} pages`);
}

main();
