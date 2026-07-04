import { copticTextToArabic } from './arabic';
import { copticTextToEnglish } from './english';

export type PronounceLang = 'en' | 'ar' | 'english' | 'arabic';

function isCopticChar(char: string): boolean {
  const code = char.codePointAt(0)!;
  return (
    (code >= 0x2c80 && code <= 0x2cff) ||
    (code >= 0x03e2 && code <= 0x03ef) ||
    (code >= 0x0300 && code <= 0x036f) ||
    code === 0x60 // ` jenkim marker in Antonios / legacy text
  );
}

function getFirstWord(texts: string[]): string | null {
  for (const text of texts) {
    if (!text) continue;
    const word = text.trim().split(/\s+/).find(Boolean);
    if (word) return word;
  }
  return null;
}

function assertCopticWord(word: string): void {
  for (const char of word) {
    if (isCopticChar(char)) continue;
    const code = char.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0');
    throw new Error(
      `Expected Coptic Unicode text; found "${char}" (U+${code}) in "${word}"`,
    );
  }
}

export function pronounce(copticText: string, lang: PronounceLang): string;
export function pronounce(copticText: string[], lang: PronounceLang): string[];
export function pronounce(
  copticText: string | string[],
  lang: PronounceLang,
): string | string[] {
  const isArray = Array.isArray(copticText);
  const texts = isArray ? copticText : [copticText];

  if (texts.length === 0) return isArray ? [] : '';

  const firstWord = getFirstWord(texts);
  if (firstWord) assertCopticWord(firstWord);

  const normalized = String(lang).toLowerCase();

  if (normalized === 'en' || normalized === 'english') {
    const result = copticTextToEnglish(texts);
    return isArray ? result : result[0];
  }

  if (normalized === 'ar' || normalized === 'arabic') {
    const result = copticTextToArabic(texts);
    return isArray ? result : result[0];
  }

  throw new Error(`Unsupported language "${lang}". Use "en" or "ar".`);
}
