import CHAR_MAP from './latin_coptic_map.json';

const OVERLINE = '\u0305'; // combining overline (nomina sacra)

/**
 * Antonios font Latin → Coptic Unicode.
 * Preserves punctuation, slashes, hyphens, and unmapped characters.
 * A leading `=` before a letter adds a combining overline to that letter.
 */
export function toUnicode(text: string | null | undefined): string {
  if (!text) return '';

  let result = '';
  let pendingOverline = false;

  for (const char of text) {
    if (char === '=') {
      pendingOverline = true;
      continue;
    }

    const mapped = CHAR_MAP[char as keyof typeof CHAR_MAP];
    if (mapped !== undefined) {
      result += mapped;
      if (pendingOverline) {
        result += OVERLINE;
        pendingOverline = false;
      }
    } else {
      result += char;
    }
  }

  return result;
}
