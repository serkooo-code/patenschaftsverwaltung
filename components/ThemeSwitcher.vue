<template>
  <div class="relative" ref="containerRef">
    <button @click="open = !open" class="flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-colors hover:bg-[var(--color-surface-alt)]">
      <span class="material-icons text-lg" style="color: var(--color-text-muted)">palette</span>
      <span class="material-icons text-sm" style="color: var(--color-text-muted)">
        {{ mode === 'dark' ? 'dark_mode' : 'light_mode' }}
      </span>
    </button>

    <div v-if="open"
      class="absolute right-0 top-full mt-1 z-50 rounded-xl shadow-lg p-3 min-w-[180px]"
      style="background-color: var(--color-surface); border: 1px solid var(--color-border)">
      <!-- Mode toggle -->
      <div class="flex gap-1 mb-3 p-1 rounded-lg" style="background-color: var(--color-surface-alt)">
        <button v-for="m in modes" :key="m.value"
          @click="setMode(m.value)"
          class="flex-1 flex items-center justify-center gap-1 py-1 rounded-md text-xs font-medium transition-colors"
          :style="mode === m.value
            ? { backgroundColor: 'var(--color-primary)', color: 'white' }
            : { color: 'var(--color-text-muted)' }">
          <span class="material-icons text-sm">{{ m.icon }}</span>
          {{ m.label }}
        </button>
      </div>

      <!-- Palettes -->
      <p class="text-xs mb-2" style="color: var(--color-text-muted)">{{ $t('theme.palette') }}</p>
      <div class="flex flex-col gap-1">
        <button v-for="p in palettes" :key="p.value"
          @click="setPalette(p.value)"
          class="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors"
          :style="palette === p.value
            ? { backgroundColor: 'var(--color-surface-alt)', fontWeight: 600, color: 'var(--color-text)' }
            : { color: 'var(--color-text-muted)' }">
          <span class="w-4 h-4 rounded-full inline-block" :style="{ backgroundColor: p.color }"></span>
          {{ p.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Palette, Mode } from '~/composables/useTheme'

const { palette, mode, setPalette, setMode } = useTheme()
const { t } = useI18n()
const open = ref(false)
const containerRef = ref<HTMLElement>()

const modes = computed(() => [
  { value: 'light' as Mode, icon: 'light_mode', label: t('theme.light') },
  { value: 'dark' as Mode, icon: 'dark_mode', label: t('theme.dark') },
])

const palettes = [
  { value: 'indigo' as Palette, label: 'Indigo', color: '#4f46e5' },
  { value: 'teal' as Palette, label: 'Teal', color: '#0d9488' },
  { value: 'rose' as Palette, label: 'Rose', color: '#e11d48' },
]

function onDocClick(e: MouseEvent) {
  if (!containerRef.value?.contains(e.target as Node)) open.value = false
}

onMounted(() => document.addEventListener('click', onDocClick))
onUnmounted(() => document.removeEventListener('click', onDocClick))
</script>
