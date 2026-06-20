<template>
  <div class="flex h-screen overflow-hidden">
    <AppSidebar />
    <div class="flex-1 flex flex-col overflow-hidden">
      <header class="h-14 flex items-center justify-between px-6 border-b shrink-0"
        style="background-color: var(--color-surface); border-color: var(--color-border)">
        <h1 class="text-base font-semibold" style="color: var(--color-text)">
          {{ pageTitle }}
        </h1>
        <div class="flex items-center gap-3">
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
      </header>
      <main class="flex-1 overflow-auto p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const { initTheme } = useTheme()
onMounted(initTheme)

const route = useRoute()
const { t } = useI18n()

const pageTitle = computed(() => {
  const name = route.name as string ?? ''
  if (name.startsWith('sponsorships-id-edit')) return t('nav.editSponsorship')
  if (name.startsWith('sponsorships-new')) return t('nav.newSponsorship')
  if (name.startsWith('sponsorships-id')) return t('nav.sponsorshipDetail')
  if (name.startsWith('sponsorships')) return t('nav.sponsorships')
  if (name.startsWith('admin-users')) return t('nav.users')
  return t('nav.sponsorships')
})
</script>
