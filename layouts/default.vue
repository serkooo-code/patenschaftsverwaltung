<template>
  <div class="flex h-screen overflow-hidden">
    <AppSidebar />
    <div class="flex-1 flex flex-col overflow-hidden min-w-0">
      <!-- Top bar -->
      <header
        class="h-14 flex items-center justify-between px-5 shrink-0"
        style="background-color: var(--color-surface); border-bottom: 1px solid var(--color-border)"
      >
        <div class="flex items-center gap-2 min-w-0">
          <h1 class="text-sm font-bold truncate" style="color: var(--color-text)">
            {{ pageTitle }}
          </h1>
        </div>
        <div class="flex items-center gap-1 shrink-0">
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
      </header>

      <!-- Main content -->
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

const routeTitles: Record<string, string> = {
  'admin-reports': 'nav.reports',
  'admin-students': 'nav.students',
  'admin-students-id-edit': 'nav.students',
  'admin-students-new': 'nav.students',
  'admin-teachers': 'nav.teachers',
  'admin-teachers-id-edit': 'nav.teachers',
  'admin-teachers-new': 'nav.teachers',
  'admin-classes': 'nav.classes',
  'admin-disciplines': 'nav.disciplines',
  'admin-sessions': 'nav.sessions',
  'admin-modules': 'nav.modules',
  'admin-goals': 'nav.goals',
  'admin-periods': 'nav.periods',
  'admin-associations': 'nav.associations',
  'admin-users': 'nav.users',
  'admin-users-new': 'nav.users',
  'teacher': 'nav.myStudents',
  'teacher-schedule': 'nav.schedule',
  'teacher-evaluate-studentId': 'eval.evaluate',
}

const pageTitle = computed(() => {
  const name = route.name as string ?? ''
  for (const [key, i18nKey] of Object.entries(routeTitles)) {
    if (name.startsWith(key)) return t(i18nKey)
  }
  return t('app.name')
})
</script>
