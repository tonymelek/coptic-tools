# coptic-pronounce

[![npm version](https://img.shields.io/npm/v/coptic-pronounce.svg)](https://www.npmjs.com/package/coptic-pronounce)

Phonetic transliteration of **Coptic Unicode** text into **English** and **Arabic** script.

Handles individual Coptic letters, common digraphs (e.g. `ⲟⲩ` → `ou`), and liturgical abbreviations such as nomina sacra (`Ⲡⲟ̅ⲥ̅` → `Pchois`).

## Install

```bash
npm install coptic-pronounce
```

[npmjs.com/package/coptic-pronounce](https://www.npmjs.com/package/coptic-pronounce)

## Usage

### CommonJS

```js
const { pronounce } = require('coptic-pronounce');
```

### ES modules

```js
import { pronounce } from 'coptic-pronounce';
```

### Examples

```js
pronounce('ⲡⲛⲟⲩϯ', 'en');
// pnouti

pronounce('ⲡⲛⲟⲩϯ', 'ar');
// بنوتي

pronounce('ⲡⲛⲟⲩϯ ⲁⲛⲟⲕ', 'en');
// pnouti anok

pronounce('ⲡⲛⲟⲩϯ ⲁⲛⲟⲕ', 'ar');
// بنوتي انوك

pronounce(['ⲡⲛⲟⲩϯ ⲁⲛⲟⲕ', 'ⲁⲛⲟⲕ'], 'en');
// ['anok pnouti', 'anok']
```

`lang` accepts `'en'`, `'ar'`, `'english'`, or `'arabic'`.

Pass a **string** for a single result, or a **string array** to transliterate multiple phrases at once (returns an array).

Non-Coptic input is rejected: the first word is checked against Coptic Unicode (`U+2C80`–`U+2CFF`), supplemental Coptic letters (`U+03E2`–`U+03EF`, e.g. `ϯ`, `ϣ`), and combining marks (`U+0300`–`U+036F`) for jenkim and overlines.

```js
pronounce('hello', 'en');
// Error: Expected Coptic Unicode text; found "h" (U+0068) in "hello"
```

### TypeScript

Types are included — no `@types` package needed.

```ts
import { pronounce, type PronounceLang } from 'coptic-pronounce';

const lang: PronounceLang = 'en';
const word: string = pronounce('ⲡⲛⲟⲩϯ', lang);
const lines: string[] = pronounce(['ⲡⲛⲟⲩϯ', 'ⲁⲛⲟⲕ'], 'ar');
```

Works with `moduleResolution: "node16"`, `"nodenext"`, or `"bundler"`.

### Combined with Antonios font conversion

If your source text is Latin-encoded Antonios font, convert to Unicode first with [coptic-antonios-unicode](https://www.npmjs.com/package/coptic-antonios-unicode):

```js
import { toUnicode } from 'coptic-antonios-unicode';
import { pronounce } from 'coptic-pronounce';

const latin = 'P,oic';
const coptic = toUnicode(latin);

pronounce(coptic, 'en'); // Pkhois
pronounce(coptic, 'ar');  // بخويس
```

## API

### `pronounce(copticText, lang)`

| Parameter    | Type                | Description                              |
|--------------|---------------------|------------------------------------------|
| `copticText` | `string` \| `string[]` | Coptic Unicode phrase(s)            |
| `lang`       | string              | `'en'` / `'english'` or `'ar'` / `'arabic'` |

**Returns:** `string` or `string[]` — same shape as input. Returns `''` or `[]` for empty input.

The first word of the input is validated as Coptic Unicode before transliteration. Throws if a non-Coptic character is found.

For Arabic multi-word output, render with `dir="rtl"` in HTML.

## Liturgical special cases

Both English and Arabic modules include best-effort mappings for common liturgical forms:

| Coptic        | English     | Arabic      |
|---------------|-------------|-------------|
| `Ⲡⲟ̅ⲥ̅`       | Pchois      | بشويس       |
| `Ⲫϯ`          | Efnouti     | افنوتي      |
| `ⲭ̅ⲥ̅`        | Ekrestos    | اخرستوس     |
| `ⲉ̅ⲑ̅ⲩ̅`       | Eth-ouab    | اثؤاب       |

Verify against a trusted liturgical reference before using in production.

## License

MIT
