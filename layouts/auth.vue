<template>
  <div class="auth-shell min-h-screen flex">
    <!-- Left branding panel -->
    <div class="auth-panel hidden md:flex md:w-[55%] flex-col justify-between p-12 relative overflow-hidden">
      <!-- Subtle dot-grid texture -->
      <div class="auth-panel__grid absolute inset-0 pointer-events-none" />

      <!-- Spacer to balance flex layout -->
      <div></div>

      <!-- Central brand copy -->
      <div class="relative z-10 max-w-sm">
        <div class="mb-6 inline-block">
          <img src="/harika.jpg" alt="Harika" class="h-48 w-auto rounded-xl" />
        </div>
        <p class="auth-panel__tagline">{{ $t('auth.tagline') }}</p>
        <p class="auth-panel__subtitle">{{ $t('auth.subtitle') }}</p>
      </div>

      <!-- Footer -->
      <div class="relative z-10 flex items-center gap-3">
        <span class="auth-panel__footer-text">Harika &copy; {{ year }}</span>
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
