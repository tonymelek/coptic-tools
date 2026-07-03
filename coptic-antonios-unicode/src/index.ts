import CHAR_MAP from './latin_coptic_map.json';

/**
 * Antonios font Latin → Coptic Unicode.
 * Preserves punctuation, slashes, hyphens, and unmapped characters.
 */
export function toUnicode(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .split('')
    .map((char) => (CHAR_MAP[char as keyof typeof CHAR_MAP] ?? char))
    .join('');
}
