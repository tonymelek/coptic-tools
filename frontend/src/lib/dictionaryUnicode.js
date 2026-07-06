// Crum/Antonios dictionary Latin (e.g. cross-reference targets like "yeoc")
// -> Coptic Unicode. Mirrors the parent pipeline's lib/toDictionaryUnicode.js:
// the standard Antonios keyboard map plus dictionary-only overrides
// (y->ⲑ, Y->Ⲑ, /->ⲏ, ?->Ⲏ). Kept in sync with
// coptic-antonios-unicode/src/latin_coptic_map.json.

const CHAR_MAP = {
  '"': 'Ⲯ',
  "'": 'ⲯ',
  ',': 'ⲭ',
  ':': 'Ⲑ',
  ';': 'ⲑ',
  '<': 'Ⲭ',
  A: 'Ⲁ',
  B: 'Ⲃ',
  C: 'Ⲥ',
  D: 'Ⲇ',
  E: 'Ⲉ',
  G: 'Ⲅ',
  H: 'Ϩ',
  I: 'Ⲓ',
  J: 'Ϫ',
  K: 'Ⲕ',
  L: 'Ⲗ',
  M: 'Ⲙ',
  N: 'Ⲛ',
  O: 'Ⲟ',
  P: 'Ⲡ',
  Q: 'Ϧ',
  R: 'Ⲣ',
  S: 'Ϣ',
  U: 'Ⲩ',
  V: 'Ⲫ',
  W: 'Ⲱ',
  X: 'Ⲝ',
  Y: 'Ⲏ',
  Z: 'Ⲍ',
  '[': 'ϭ',
  ']': 'ϯ',
  '^': 'ⲋ',
  a: 'ⲁ',
  b: 'ⲃ',
  c: 'ⲥ',
  d: 'ⲇ',
  e: 'ⲉ',
  F: 'Ϥ',
  f: 'ϥ',
  g: 'ⲅ',
  h: 'ϩ',
  i: 'ⲓ',
  j: 'ϫ',
  k: 'ⲕ',
  l: 'ⲗ',
  m: 'ⲙ',
  n: 'ⲛ',
  o: 'ⲟ',
  p: 'ⲡ',
  T: 'Ⲧ',
  q: 'ϧ',
  r: 'ⲣ',
  s: 'ϣ',
  t: 'ⲧ',
  u: 'ⲩ',
  '}': 'Ϯ',
  '{': 'Ϭ',
  z: 'ⲍ',
  y: 'ⲏ',
  x: 'ⲝ',
  w: 'ⲱ',
  v: 'ⲫ',
  '@': ':',
}

const DICTIONARY_OVERRIDES = {
  y: 'ⲑ',
  Y: 'Ⲑ',
  '/': 'ⲏ',
  '?': 'Ⲏ',
}

const DICTIONARY_CHAR_MAP = { ...CHAR_MAP, ...DICTIONARY_OVERRIDES }

const OVERLINE = '\u0305'

export function toDictionaryUnicode(text) {
  if (!text) return ''

  let result = ''
  let pendingOverline = false

  for (const char of text) {
    if (char === '=') {
      pendingOverline = true
      continue
    }

    const mapped = DICTIONARY_CHAR_MAP[char]
    if (mapped !== undefined) {
      result += mapped
      if (pendingOverline) {
        result += OVERLINE
        pendingOverline = false
      }
    } else {
      result += char
    }
  }

  return result
}
