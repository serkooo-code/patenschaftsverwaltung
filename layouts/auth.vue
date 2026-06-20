<template>
  <div class="auth-shell min-h-screen flex">
    <!-- Left branding panel -->
    <div class="auth-panel hidden md:flex md:w-[55%] flex-col justify-between p-12 relative overflow-hidden">
      <!-- Subtle dot-grid texture -->
      <div class="auth-panel__grid absolute inset-0 pointer-events-none" />

      <!-- Logo mark -->
      <div class="relative z-10">
        <div
          class="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-lg select-none"
          style="background-color: rgba(255,255,255,0.15); color: white; backdrop-filter: blur(4px)"
        >D</div>
      </div>

      <!-- Central brand copy -->
      <div class="relative z-10 max-w-sm">
        <h1 class="auth-panel__title">{{ $t('app.name') }}</h1>
        <p class="auth-panel__tagline">{{ $t('auth.tagline') }}</p>
        <p class="auth-panel__subtitle">{{ $t('auth.subtitle') }}</p>
      </div>

      <!-- Footer -->
      <div class="relative z-10 flex items-center gap-3">
        <span class="auth-panel__footer-text">{{ $t('app.name') }} &copy; {{ year }}</span>
      </div>
    </div>

    <!-- Right form panel -->
    <div class="flex-1 flex items-center justify-center p-8" style="background-color: var(--color-surface)">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
const { initTheme } = useTheme()
onMounted(initTheme)
const year = new Date().getFullYear()
</script>

<style scoped>
.auth-shell {
  background-color: var(--color-surface-alt);
}

.auth-panel {
  background-color: var(--color-sidebar-bg);
}

.auth-panel__grid {
  background-image:
    radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px);
  background-size: 32px 32px;
}

.auth-panel__title {
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1.2;
  color: white;
  margin-bottom: 1.25rem;
  letter-spacing: -0.02em;
}

.auth-panel__tagline {
  font-size: 1.125rem;
  font-weight: 500;
  line-height: 1.6;
  color: var(--color-sidebar-text);
  margin-bottom: 0.5rem;
}

.auth-panel__subtitle {
  font-size: 0.9375rem;
  line-height: 1.6;
  color: var(--color-sidebar-text);
  opacity: 0.6;
}

.auth-panel__footer-text {
  font-size: 0.75rem;
  color: var(--color-sidebar-text);
  opacity: 0.3;
}
</style>
