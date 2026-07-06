<script setup>
import { toDictionaryUnicode } from '../lib/dictionaryUnicode'

defineProps({
  entry: {
    type: Object,
    required: true,
  },
  pageId: {
    type: String,
    required: true,
  },
})

const normalize = (value) => (value || '').replace(/\s+/g, ' ').trim()

// Definition is only worth showing when it adds something beyond the gloss.
// In most entries gloss === definition (often with stray PDF whitespace), so
// comparing normalized text avoids rendering the same meaning twice.
function definitionAddsInfo(gloss, definition) {
  const d = normalize(definition)
  return Boolean(d) && d !== normalize(gloss)
}
</script>

<template>
  <article class="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
    <header class="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
      <div class="min-w-0">
        <p class="font-coptic text-3xl text-burgundy-900 break-words">{{ entry.copticWord }}</p>
        <p class="mt-1 font-mono text-lg text-slate-800 break-words">
          {{ entry.englishTransliteration || entry.headword }}
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2 text-xs">
        <span class="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-700">
          p. {{ pageId }}
        </span>
        <span
          v-if="entry.reference"
          class="rounded-full bg-burgundy-50 px-2.5 py-1 font-medium text-burgundy-800"
        >
          {{ entry.reference }}
        </span>
        <span
          v-if="entry.partOfSpeech"
          class="rounded-full bg-gold/15 px-2.5 py-1 font-medium text-burgundy-900"
        >
          {{ entry.partOfSpeech }}
        </span>
        <span
          v-if="entry.isGreek"
          class="rounded-full bg-slate-800 px-2.5 py-1 font-medium text-white"
        >
          Greek
        </span>
      </div>
    </header>

    <div class="mt-4 space-y-4">
      <div v-if="entry.gloss || entry.definition">
        <h3 class="text-xs font-semibold uppercase tracking-wide text-slate-500">Meaning</h3>
        <p class="mt-1 text-slate-800 leading-relaxed break-words">
          {{ entry.gloss || entry.definition }}
        </p>
      </div>

      <div v-if="definitionAddsInfo(entry.gloss, entry.definition)">
        <h3 class="text-xs font-semibold uppercase tracking-wide text-slate-500">Definition</h3>
        <p class="mt-1 text-slate-800 leading-relaxed whitespace-pre-wrap break-words">
          {{ entry.definition }}
        </p>
      </div>

      <div v-if="entry.variants?.length">
        <h3 class="text-xs font-semibold uppercase tracking-wide text-slate-500">Variants</h3>
        <ul class="mt-2 space-y-2">
          <li
            v-for="(variant, index) in entry.variants"
            :key="`${variant.word}-${index}`"
            class="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
          >
            <p class="font-coptic text-xl text-burgundy-900 break-words">
              {{ variant.copticWord || '—' }}
            </p>
            <p class="font-mono text-sm text-slate-700 break-words">
              {{ variant.englishTransliteration || variant.word }}
              <span v-if="variant.type" class="text-slate-500"> · {{ variant.type }}</span>
              <span v-if="variant.note" class="text-slate-500"> · {{ variant.note }}</span>
            </p>
          </li>
        </ul>
      </div>

      <div v-if="entry.senses?.length">
        <h3 class="text-xs font-semibold uppercase tracking-wide text-slate-500">Senses</h3>
        <ul class="mt-2 space-y-2">
          <li
            v-for="(sense, index) in entry.senses"
            :key="`${sense.label}-${index}`"
            class="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
          >
            <div
              v-if="sense.label || sense.reference || sense.partOfSpeech || sense.isGreek"
              class="flex flex-wrap items-center gap-2 text-xs text-slate-600"
            >
              <span v-if="sense.label" class="font-semibold text-burgundy-800">{{ sense.label }}</span>
              <span v-if="sense.reference">{{ sense.reference }}</span>
              <span v-if="sense.partOfSpeech">{{ sense.partOfSpeech }}</span>
              <span v-if="sense.isGreek">Greek</span>
            </div>
            <p v-if="sense.gloss || sense.definition" class="mt-1 text-slate-800">
              {{ sense.gloss || sense.definition }}
            </p>
            <p
              v-if="definitionAddsInfo(sense.gloss, sense.definition)"
              class="mt-1 text-slate-700 whitespace-pre-wrap break-words"
            >
              {{ sense.definition }}
            </p>
          </li>
        </ul>
      </div>

      <div
        v-if="entry.crossReference"
        class="rounded-lg border border-burgundy-100 bg-burgundy-50 px-3 py-2 text-sm text-burgundy-900"
      >
        <span class="font-semibold">See also:</span>
        <span class="font-coptic text-base">{{ toDictionaryUnicode(entry.crossReference.target) }}</span>
        <span v-if="entry.crossReference.gloss"> — {{ entry.crossReference.gloss }}</span>
      </div>
    </div>
  </article>
</template>
