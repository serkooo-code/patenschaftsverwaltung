<template>
  <div class="flex flex-col gap-0.5">
    <dt class="text-xs" style="color: var(--color-text-muted)">{{ label }}</dt>
    <dd class="text-sm font-medium" style="color: var(--color-text)"><slot /></dd>
  </div>
</template>

<script setup lang="ts">
defineProps<{ label: string }>()
</script>
