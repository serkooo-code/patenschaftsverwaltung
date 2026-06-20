<template>
  <NuxtLink
    :to="to"
    class="sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150"
    :class="[collapsed ? 'justify-center' : '', isActive ? 'sidebar-item--active' : '']"
    :title="collapsed ? label : undefined"
  >
    <span class="sidebar-item__icon material-icons-round text-xl leading-none shrink-0">
      {{ icon }}
    </span>
    <span v-if="!collapsed" class="sidebar-item__label text-sm font-semibold truncate">
      {{ label }}
    </span>
    <span v-if="isActive && !collapsed" class="ml-auto w-1.5 h-1.5 rounded-full shrink-0 sidebar-item__dot" />
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps<{ to: string; icon: string; label: string; collapsed: boolean }>()
const route = useRoute()
const isActive = computed(() =>
  route.path === props.to || (props.to.length > 1 && route.path.startsWith(props.to + '/'))
)
</script>

<style scoped>
.sidebar-item {
  color: var(--color-sidebar-text);
}
.sidebar-item__icon,
.sidebar-item__label {
  color: var(--color-sidebar-text);
  opacity: 0.6;
  transition: opacity 0.15s;
}
.sidebar-item__dot {
  background-color: rgba(255,255,255,0.5);
}

.sidebar-item:hover .sidebar-item__icon,
.sidebar-item:hover .sidebar-item__label {
  opacity: 0.9;
}
.sidebar-item:hover:not(.sidebar-item--active) {
  background-color: rgba(255,255,255,0.07);
}

.sidebar-item--active {
  background-color: rgba(255,255,255,0.12);
}
.sidebar-item--active .sidebar-item__icon,
.sidebar-item--active .sidebar-item__label {
  color: white;
  opacity: 1;
}
</style>
