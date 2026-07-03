const pronunciationMap: Record<string, string> = {
  'Ⲁ': 'A', 'ⲁ': 'a',
  'Ⲃ': 'V', 'ⲃ': 'v',
  'Ⲅ': 'G', 'ⲅ': 'g',
  'Ⲇ': 'D', 'ⲇ': 'd',
  'Ⲉ': 'E', 'ⲉ': 'e',
  'Ⲍ': 'Z', 'ⲍ': 'z',
  'Ⲏ': 'I', 'ⲏ': 'i',
  'Ⲑ': 'Th', 'ⲑ': 'th',
  'Ⲓ': 'I', 'ⲓ': 'i',
  'Ⲕ': 'K', 'ⲕ': 'k',
  'Ⲗ': 'L', 'ⲗ': 'l',
  'Ⲙ': 'M', 'ⲙ': 'm',
  'Ⲛ': 'N', 'ⲛ': 'n',
  'Ⲝ': 'Ks', 'ⲝ': 'ks',
  'Ⲟ': 'O', 'ⲟ': 'o',
  'Ⲡ': 'P', 'ⲡ': 'p',
  'Ⲣ': 'R', 'ⲣ': 'r',
  'Ⲥ': 'S', 'ⲥ': 's',
  'Ⲧ': 'T', 'ⲧ': 't',
  'Ⲩ': 'Y', 'ⲩ': 'y',
  'Ⲫ': 'F', 'ⲫ': 'f',
  'Ⲭ': 'Kh', 'ⲭ': 'kh',
  'Ⲯ': 'Ps', 'ⲯ': 'ps',
  'Ⲱ': 'Ō', 'ⲱ': 'ō',
  'Ϣ': 'Sh', 'ϣ': 'sh',
  'Ϥ': 'F', 'ϥ': 'f',
  'Ϧ': 'Kh', 'ϧ': 'kh',
  'Ϩ': 'H', 'ϩ': 'h',
  'Ϫ': 'J', 'ϫ': 'j',
  'Ϭ': 'Ch', 'ϭ': 'ch',
  'Ϯ': 'Ti', 'ϯ': 'ti',
};

const specialCases: { pattern: RegExp; replacement: string }[] = [
  { pattern: /ⲟⲩ|ⲟ̀ⲩ/g, replacement: 'ou' },
  { pattern: /Ⲟⲩ/g, replacement: 'Ou' },
  { pattern: /ⲃⲃ/g, replacement: 'v' },
  { pattern: /ⲓϫ/g, replacement: 'eeg' },
  { pattern: /ϫⲁ/g, replacement: 'ga' },
  { pattern: /(ⲓ|ⲏ)ⲃ/g, replacement: 'eeb' },
  { pattern: /ⲉⲓ/g, replacement: 'i' },
  { pattern: /ⲁⲩ/g, replacement: 'av' },
  { pattern: /ⲉⲩ/g, replacement: 'ev' },
  { pattern: /ⲏⲩ/g, replacement: 'y' },
  { pattern: /ⲟⲩⲓ/g, replacement: 'owi' },
  { pattern: /ⲅⲅ/g, replacement: 'ng' },
  { pattern: /ⲛⲕ/g, replacement: 'nk' },
  { pattern: /ⲛⲅ/g, replacement: 'ng' },
  { pattern: /ⲛⲭ/g, replacement: 'nkh' },
  { pattern: /Ⲡⲟ̅ⲥ̅|Ⲡ̀ⲟ̅ⲥ̅/g, replacement: 'Pchois' },
  { pattern: /Ⲫϯ/g, replacement: 'Efnouti' },
  { pattern: /ⲟ̅ⲥ̅/g, replacement: 'chois' },
  { pattern: /ⲭ̅ⲥ̅/g, replacement: 'Ekrestos' },
  { pattern: /(ⲉ̀̅ⲑ̅ⲩ̅|ⲉ̅ⲑ̅ⲩ̅)/g, replacement: 'Eth-ouab' },
];

function copticToEnglishPronunciation(copticWord: string): string {
  let word = copticWord;
  specialCases.forEach(({ pattern, replacement }) => {
    word = word.replace(pattern, replacement);
  });
  return word.split('').map((char) => pronunciationMap[char] ?? char).join('');
}

export function copticTextToEnglish(textArray: string[]): string[] {
  return textArray.map((text) => {
    const words = text.split(' ');
    const englishWords = words.map((word) => copticToEnglishPronunciation(word));
    return englishWords.join(' ');
  });
}
