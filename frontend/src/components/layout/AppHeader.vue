<script setup>
import { ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { tools } from '../../config/tools.js'

const route = useRoute()
const logoSrc = `${import.meta.env.BASE_URL}images/logo-gold.png`
const menuOpen = ref(false)

function isActive(path) {
  return route.path === path || route.path === path + '/'
}

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

watch(() => route.path, () => {
  menuOpen.value = false
})
</script>

<template>
  <header class="bg-burgundy-900 border-b-4 border-gold sticky top-0 z-50 shadow-md">
    <nav class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 relative">
      <a href="/" class="flex items-center gap-2 sm:gap-2.5 text-base sm:text-lg font-bold tracking-tight text-gold hover:text-white transition shrink-0 no-underline">
        <img :src="logoSrc" alt="" class="h-8 w-8 sm:h-9 sm:w-9 shrink-0" width="36" height="36" decoding="async" />
        <span>COPTIC LANGUAGE</span>
      </a>

      <div class="hidden md:flex items-center gap-1 sm:gap-2">
        <RouterLink
          v-for="tool in tools"
          :key="tool.to"
          :to="tool.to"
          class="px-3 py-1.5 text-sm font-semibold rounded-md transition no-underline"
          :class="isActive(tool.to)
            ? 'bg-gold text-burgundy-900'
            : 'text-white hover:text-gold hover:bg-burgundy-800'"
        >
          {{ tool.label }}
        </RouterLink>
      </div>

      <button
        type="button"
        class="md:hidden inline-flex items-center justify-center p-2 rounded-md text-white/80 hover:text-gold hover:bg-burgundy-800 transition"
        :aria-expanded="menuOpen"
        aria-label="Toggle navigation menu"
        @click="toggleMenu"
      >
        <svg v-if="!menuOpen" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <svg v-else class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div
        v-show="menuOpen"
        class="absolute top-16 left-0 w-full bg-burgundy-800 border-b border-gold/30 shadow-xl flex flex-col px-4 py-4 gap-2 font-medium md:hidden z-40"
      >
        <RouterLink
          v-for="tool in tools"
          :key="tool.to"
          :to="tool.to"
          class="px-3 py-2 rounded-md text-sm font-semibold transition no-underline"
          :class="isActive(tool.to)
            ? 'bg-gold text-burgundy-900'
            : 'text-white hover:text-gold hover:bg-burgundy-700'"
        >
          {{ tool.label }}
        </RouterLink>
      </div>
    </nav>
  </header>
</template>
