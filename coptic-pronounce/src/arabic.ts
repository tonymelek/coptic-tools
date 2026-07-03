const pronunciationMap: Record<string, string> = {
  'Ⲁ': 'ا', 'ⲁ': 'ا',
  'Ⲃ': 'ڤ', 'ⲃ': 'ڤ',
  'Ⲅ': 'غ', 'ⲅ': 'غ',
  'Ⲇ': 'د', 'ⲇ': 'د',
  'Ⲉ': 'ي', 'ⲉ': 'ي',
  'Ⲍ': 'ز', 'ⲍ': 'ز',
  'Ⲏ': 'ي', 'ⲏ': 'ي',
  'Ⲑ': 'ث', 'ⲑ': 'ث',
  'Ⲓ': 'ي', 'ⲓ': 'ي',
  'Ⲕ': 'ك', 'ⲕ': 'ك',
  'Ⲗ': 'ل', 'ⲗ': 'ل',
  'Ⲙ': 'م', 'ⲙ': 'م',
  'Ⲛ': 'ن', 'ⲛ': 'ن',
  'Ⲝ': 'كس', 'ⲝ': 'كس',
  'Ⲟ': 'و', 'ⲟ': 'و',
  'Ⲡ': 'ب', 'ⲡ': 'ب',
  'Ⲣ': 'ر', 'ⲣ': 'ر',
  'Ⲥ': 'س', 'ⲥ': 'س',
  'Ⲧ': 'ت', 'ⲧ': 'ت',
  'Ⲩ': 'ي', 'ⲩ': 'ي',
  'Ⲫ': 'ف', 'ⲫ': 'ف',
  'Ⲭ': 'خ', 'ⲭ': 'خ',
  'Ⲯ': 'بس', 'ⲯ': 'بس',
  'Ⲱ': 'و', 'ⲱ': 'و',
  'Ϣ': 'ش', 'ϣ': 'ش',
  'Ϥ': 'ف', 'ϥ': 'ف',
  'Ϧ': 'خ', 'ϧ': 'خ',
  'Ϩ': 'ه', 'ϩ': 'ه',
  'Ϫ': 'ج', 'ϫ': 'ج',
  'Ϭ': 'تش', 'ϭ': 'تش',
  'Ϯ': 'تي', 'ϯ': 'تي',
};

// NOTE: liturgical entries are best-effort Arabic phonetic renderings —
// verify against a trusted Coptic/Arabic liturgical reference before production use.
const specialCases: { pattern: RegExp; replacement: string }[] = [
  { pattern: /Ⲡⲟ̅ⲥ̅|Ⲡ̀ⲟ̅ⲥ̅|ⲡ̀ϭⲟⲓⲥ|Ⲡ̀ϭⲟⲓⲥ/g, replacement: 'بشويس' },
  { pattern: /ϭⲟⲓⲥ/g, replacement: 'شويس' },
  { pattern: /Ⲫϯ/g, replacement: 'افنوتي' },
  { pattern: /ⲭ̅ⲥ̅/g, replacement: 'اخرستوس' },
  { pattern: /ⲟ̅ⲥ̅/g, replacement: 'شويس' },
  { pattern: /(ⲉ̀̅ⲑ̅ⲩ̅|ⲉ̅ⲑ̅ⲩ̅)/g, replacement: 'اثؤاب' },
  { pattern: /ⲟⲩ|ⲟ̀ⲩ/g, replacement: 'و' },
  { pattern: /Ⲟⲩ/g, replacement: 'و' },
  { pattern: /ⲃⲃ/g, replacement: 'ڤ' },
  { pattern: /ⲓϫ/g, replacement: 'يج' },
  { pattern: /ϫⲁ/g, replacement: 'جا' },
  { pattern: /(ⲓ|ⲏ)ⲃ/g, replacement: 'يب' },
  { pattern: /ⲉⲓ/g, replacement: 'ي' },
  { pattern: /ⲁⲩ/g, replacement: 'اڤ' },
  { pattern: /ⲉⲩ/g, replacement: 'يڤ' },
  { pattern: /ⲏⲩ/g, replacement: 'ي' },
  { pattern: /ⲟⲩⲓ/g, replacement: 'اوي' },
  { pattern: /ⲅⲅ/g, replacement: 'نج' },
  { pattern: /ⲛⲕ/g, replacement: 'نك' },
  { pattern: /ⲛⲅ/g, replacement: 'نج' },
  { pattern: /ⲛⲭ/g, replacement: 'نخ' },
];

const COMBINING_MARKS = /[\u0300-\u036F]/g;
const TRAILING_PUNCT = /[.,:;!?]+$/;

function copticToArabicPronunciation(copticWord: string): string {
  const suffix = copticWord.match(TRAILING_PUNCT)?.[0] ?? '';
  let word = suffix ? copticWord.slice(0, -suffix.length) : copticWord;

  specialCases.forEach(({ pattern, replacement }) => {
    word = word.replace(pattern, replacement);
  });

  const transliterated = word
    .split('')
    .map((char) => pronunciationMap[char] ?? char)
    .join('')
    .replace(COMBINING_MARKS, '');

  return transliterated + suffix;
}

export function copticTextToArabic(textArray: string[]): string[] {
  return textArray.map((text) => {
    const words = text.split(' ');
    const arabicWords = words.map((word) => copticToArabicPronunciation(word));
    return arabicWords.join(' ');
  });
}
