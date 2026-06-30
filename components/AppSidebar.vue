<template>
  <aside
    class="sidebar flex flex-col shrink-0 h-full transition-all duration-200"
    :style="{ width: collapsed ? '64px' : '240px' }"
  >
    <!-- Logo header -->
    <div class="h-16 flex items-center shrink-0"
         :class="collapsed ? 'justify-center' : 'px-3 gap-3'">
      <template v-if="!collapsed">
        <img
          src="https://www.harikaegitim.com/public/assets/images/logo.svg"
          alt="Harika Eğitim"
          class="h-8 w-auto shrink-0 object-contain"
          style="filter: brightness(0) invert(1)"
        />
        <button
          @click="collapsed = true"
          class="p-1.5 rounded-lg transition-colors hover:bg-white/10 ml-auto shrink-0"
          title="Collapse"
        >
          <span class="material-icons-round text-lg leading-none" style="color: rgba(255,255,255,0.4)">
            chevron_left
          </span>
        </button>
      </template>
      <button
        v-else
        @click="collapsed = false"
        class="p-1.5 rounded-lg transition-colors hover:bg-white/10"
        title="Expand"
      >
        <span class="material-icons-round text-lg leading-none" style="color: rgba(255,255,255,0.4)">
          chevron_right
        </span>
      </button>
    </div>

    <!-- Nav -->
    <nav class="flex-1 flex flex-col gap-0.5 px-2 py-2 overflow-y-auto overflow-x-hidden">
      <template v-if="isAdmin">
        <SidebarItem to="/admin/reports" icon="bar_chart" :label="$t('nav.reports')" :collapsed="collapsed" />

        <div class="nav-section-label" :class="collapsed ? 'nav-section-label--collapsed' : ''">
          <span v-if="!collapsed" class="nav-section-label__text">{{ $t('nav.definitions') }}</span>
          <span v-else class="nav-section-label__divider" />
        </div>

        <SidebarItem to="/admin/students" icon="school" :label="$t('nav.students')" :collapsed="collapsed" />
        <SidebarItem to="/admin/teachers" icon="person" :label="$t('nav.teachers')" :collapsed="collapsed" />
        <SidebarItem to="/admin/classes" icon="corporate_fare" :label="$t('nav.classes')" :collapsed="collapsed" />
        <SidebarItem to="/admin/disciplines" icon="sports" :label="$t('nav.disciplines')" :collapsed="collapsed" />
        <SidebarItem to="/admin/sessions" icon="event" :label="$t('nav.sessions')" :collapsed="collapsed" />
        <SidebarItem to="/admin/modules" icon="layers" :label="$t('nav.modules')" :collapsed="collapsed" />
        <SidebarItem to="/admin/goals" icon="flag" :label="$t('nav.goals')" :collapsed="collapsed" />
        <SidebarItem to="/admin/periods" icon="date_range" :label="$t('nav.periods')" :collapsed="collapsed" />
        <SidebarItem to="/admin/associations" icon="account_tree" :label="$t('nav.associations')" :collapsed="collapsed" />

        <div class="nav-section-label" :class="collapsed ? 'nav-section-label--collapsed' : ''">
          <span v-if="!collapsed" class="nav-section-label__text">{{ $t('nav.system') }}</span>
          <span v-else class="nav-section-label__divider" />
        </div>

        <SidebarItem to="/admin/users" icon="manage_accounts" :label="$t('nav.users')" :collapsed="collapsed" />
      </template>

      <template v-else>
        <SidebarItem to="/teacher" icon="people" :label="$t('nav.myStudents')" :collapsed="collapsed" />
        <SidebarItem to="/teacher/schedule" icon="checklist" :label="$t('nav.schedule')" :collapsed="collapsed" />
      </template>
    </nav>

    <!-- User footer -->
    <div class="shrink-0 border-t border-white/10 p-2">
      <div v-if="!collapsed" class="px-2 py-2 mb-1">
        <p class="text-xs font-semibold truncate text-white/80">{{ user?.email }}</p>
        <p class="text-xs text-white/40 mt-0.5">{{ $t(`role.${user?.role}`) }}</p>
      </div>
      <button
        @click="logout"
        class="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl transition-colors hover:bg-white/10"
        :class="collapsed ? 'justify-center' : ''"
      >
        <span class="material-icons-round text-xl leading-none" style="color: rgba(255,255,255,0.4)">logout</span>
        <span v-if="!collapsed" class="text-sm font-medium" style="color: rgba(255,255,255,0.5)">
          {{ $t('auth.logout') }}
        </span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
const collapsed = ref(false)
const { user, clear } = useUserSession()
const isAdmin = computed(() => (user.value as any)?.role === 'admin')

async function logout() {
  await clear()
  await navigateTo('/login')
}
</script>

<style scoped>
.sidebar {
  background-color: var(--color-sidebar-bg);
  border-right: 1px solid rgba(255, 255, 255, 0.06);
}

.nav-section-label {
  padding: 0.875rem 0.5rem 0.25rem;
}
.nav-section-label--collapsed {
  padding: 0.5rem 0.5rem;
}
.nav-section-label__text {
  display: block;
  font-size: 0.625rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-sidebar-text);
  opacity: 0.35;
}
.nav-section-label__divider {
  display: block;
  height: 1px;
  background-color: rgba(255, 255, 255, 0.08);
}
</style>
