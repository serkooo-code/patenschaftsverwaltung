<template>
  <div class="relative" ref="containerRef">
    <button @click="open = !open"
      class="flex items-center gap-1.5 h-9 px-3 rounded-lg transition-colors hover:bg-[var(--color-surface-alt)]"
      :title="$t('theme.palette')">
      <span class="w-4 h-4 rounded-full ring-1 ring-black/10 shrink-0"
        :style="{ backgroundColor: currentColor }" />
      <span class="material-icons-round text-base leading-none" style="color: var(--color-text-muted)">
        {{ mode === 'dark' ? 'dark_mode' : 'light_mode' }}
      </span>
    </button>

    <div v-if="open"
      class="absolute right-0 top-full mt-2 z-50 rounded-2xl shadow-xl p-4 w-52"
      style="background-color: var(--color-surface); border: 1px solid var(--color-border)">

      <!-- Light / Dark toggle -->
      <div class="flex gap-1 mb-4 p-1 rounded-xl" style="background-color: var(--color-surface-alt)">
        <button v-for="m in modes" :key="m.value"
          @click="setMode(m.value)"
          class="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
          :style="mode === m.value
            ? { backgroundColor: 'var(--color-primary)', color: 'white' }
            : { color: 'var(--color-text-muted)' }">
          <span class="material-icons-round text-sm leading-none">{{ m.icon }}</span>
          {{ m.label }}
        </button>
      </div>

      <!-- Palettes -->
      <p class="text-xs font-bold uppercase tracking-wider mb-2" style="color: var(--color-text-muted)">
        {{ $t('theme.palette') }}
      </p>
      <div class="flex flex-col gap-0.5">
        <button v-for="p in palettes" :key="p.value"
          @click="setPalette(p.value)"
          class="flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm font-medium transition-colors"
          :style="palette === p.value
            ? { backgroundColor: 'var(--color-primary-subtle)', color: 'var(--color-primary)' }
            : { color: 'var(--color-text-muted)' }">
          <span class="w-4 h-4 rounded-full shrink-0 ring-1 ring-black/10"
            :style="{ backgroundColor: p.color }" />
          {{ p.label }}
          <span v-if="palette === p.value" class="material-icons-round text-base leading-none ml-auto">check</span>
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

const palettes = [
  { value: 'blue' as Palette, label: 'Blue', color: '#2563eb' },
  { value: 'emerald' as Palette, label: 'Emerald', color: '#059669' },
  { value: 'violet' as Palette, label: 'Violet', color: '#7c3aed' },
]

const currentColor = computed(() => palettes.find(p => p.value === palette.value)?.color ?? '#2563eb')

const modes = computed(() => [
  { value: 'light' as Mode, icon: 'light_mode', label: t('theme.light') },
  { value: 'dark' as Mode, icon: 'dark_mode', label: t('theme.dark') },
])

function onDocClick(e: MouseEvent) {
  if (!containerRef.value?.contains(e.target as Node)) open.value = false
}

onMounted(() => document.addEventListener('click', onDocClick))
onUnmounted(() => document.removeEventListener('click', onDocClick))
</script>
