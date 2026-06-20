<template>
  <div class="relative" ref="containerRef">
    <button @click="open = !open" class="flex items-center gap-1 px-2 py-1.5 rounded-lg transition-colors hover:bg-[var(--color-surface-alt)]">
      <span class="material-icons-round text-lg" style="color: var(--color-text-muted)">language</span>
      <span class="text-xs font-medium uppercase" style="color: var(--color-text-muted)">{{ locale }}</span>
    </button>

    <div v-if="open"
      class="absolute right-0 top-full mt-1 z-50 rounded-xl shadow-lg overflow-hidden"
      style="background-color: var(--color-surface); border: 1px solid var(--color-border)">
      <button
        v-for="loc in locales"
        :key="loc.code"
        @click="switchTo(loc.code)"
        class="flex items-center gap-2 w-full px-4 py-2 text-sm transition-colors hover:bg-[var(--color-surface-alt)]"
        :style="locale === loc.code ? { fontWeight: 600, color: 'var(--color-primary)' } : { color: 'var(--color-text)' }"
      >
        {{ loc.name }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const { locale, locales, setLocale } = useI18n()
const open = ref(false)
const containerRef = ref<HTMLElement>()

async function switchTo(code: string) {
  await setLocale(code)
  open.value = false
}

function onDocClick(e: MouseEvent) {
  if (!containerRef.value?.contains(e.target as Node)) open.value = false
}

onMounted(() => document.addEventListener('click', onDocClick))
onUnmounted(() => document.removeEventListener('click', onDocClick))
</script>
