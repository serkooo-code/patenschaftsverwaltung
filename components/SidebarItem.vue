<template>
  <NuxtLink
    :to="to"
    class="flex items-center gap-3 px-2 py-2 rounded-lg transition-colors"
    :class="[collapsed ? 'justify-center' : '', isActive ? 'bg-white/15' : 'hover:bg-white/10']"
    :title="collapsed ? label : undefined"
  >
    <span class="material-icons text-xl" :style="{ color: isActive ? 'white' : 'var(--color-sidebar-text)', opacity: isActive ? 1 : 0.7 }">
      {{ icon }}
    </span>
    <span v-if="!collapsed" class="text-sm font-medium truncate"
      :style="{ color: isActive ? 'white' : 'var(--color-sidebar-text)', opacity: isActive ? 1 : 0.7 }">
      {{ label }}
    </span>
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps<{ to: string; icon: string; label: string; collapsed: boolean }>()
const route = useRoute()
const isActive = computed(() => route.path.startsWith(props.to))
</script>
