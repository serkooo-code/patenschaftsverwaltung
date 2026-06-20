<template>
  <div class="min-h-screen flex items-center justify-center p-4"
    style="background-color: var(--color-surface-alt)">
    <slot />
  </div>
</template>

<script setup lang="ts">
const { initTheme } = useTheme()
onMounted(initTheme)
</script>
