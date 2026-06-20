<template>
  <aside class="flex flex-col shrink-0 transition-all duration-200 h-full"
    :style="{ width: collapsed ? '60px' : '220px', backgroundColor: 'var(--color-sidebar-bg)' }">

    <div class="h-14 flex items-center px-3" :class="collapsed ? 'justify-center' : 'justify-between'">
      <span v-if="!collapsed" class="text-sm font-semibold truncate" style="color: var(--color-sidebar-text)">
        {{ $t('app.name') }}
      </span>
      <button @click="collapsed = !collapsed" class="p-1.5 rounded-lg transition-colors hover:bg-white/10">
        <span class="material-icons text-xl" style="color: var(--color-sidebar-text)">
          {{ collapsed ? 'menu_open' : 'menu' }}
        </span>
      </button>
    </div>

    <nav class="flex-1 flex flex-col gap-0.5 px-2 py-2 overflow-y-auto">
      <template v-if="isAdmin">
        <SidebarItem to="/admin/reports" icon="bar_chart" :label="$t('nav.reports')" :collapsed="collapsed" />
        <div v-if="!collapsed" class="px-2 pt-3 pb-1 text-xs font-semibold uppercase tracking-wider" style="color: var(--color-sidebar-text); opacity:0.4">
          {{ $t('nav.definitions') }}
        </div>
        <div v-else class="my-1 mx-2 border-t" style="border-color: rgba(255,255,255,0.1)"></div>
        <SidebarItem to="/admin/students" icon="school" :label="$t('nav.students')" :collapsed="collapsed" />
        <SidebarItem to="/admin/teachers" icon="person" :label="$t('nav.teachers')" :collapsed="collapsed" />
        <SidebarItem to="/admin/classes" icon="class" :label="$t('nav.classes')" :collapsed="collapsed" />
        <SidebarItem to="/admin/disciplines" icon="sports" :label="$t('nav.disciplines')" :collapsed="collapsed" />
        <SidebarItem to="/admin/sessions" icon="event" :label="$t('nav.sessions')" :collapsed="collapsed" />
        <SidebarItem to="/admin/modules" icon="layers" :label="$t('nav.modules')" :collapsed="collapsed" />
        <SidebarItem to="/admin/goals" icon="flag" :label="$t('nav.goals')" :collapsed="collapsed" />
        <SidebarItem to="/admin/periods" icon="date_range" :label="$t('nav.periods')" :collapsed="collapsed" />
        <SidebarItem to="/admin/associations" icon="account_tree" :label="$t('nav.associations')" :collapsed="collapsed" />
        <div v-if="!collapsed" class="px-2 pt-3 pb-1 text-xs font-semibold uppercase tracking-wider" style="color: var(--color-sidebar-text); opacity:0.4">
          {{ $t('nav.system') }}
        </div>
        <div v-else class="my-1 mx-2 border-t" style="border-color: rgba(255,255,255,0.1)"></div>
        <SidebarItem to="/admin/users" icon="manage_accounts" :label="$t('nav.users')" :collapsed="collapsed" />
      </template>

      <template v-else>
        <SidebarItem to="/teacher" icon="people" :label="$t('nav.myStudents')" :collapsed="collapsed" />
        <SidebarItem to="/teacher/schedule" icon="checklist" :label="$t('nav.schedule')" :collapsed="collapsed" />
      </template>
    </nav>

    <div class="border-t p-2" style="border-color: rgba(255,255,255,0.1)">
      <div v-if="!collapsed" class="px-2 py-1 mb-1">
        <p class="text-xs truncate" style="color: var(--color-sidebar-text); opacity: 0.7">{{ user?.email }}</p>
        <p class="text-xs font-medium" style="color: var(--color-sidebar-text); opacity: 0.4">{{ $t(`role.${user?.role}`) }}</p>
      </div>
      <button @click="logout" class="w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-colors hover:bg-white/10"
        :class="collapsed ? 'justify-center' : ''">
        <span class="material-icons text-xl" style="color: var(--color-sidebar-text); opacity: 0.7">logout</span>
        <span v-if="!collapsed" class="text-sm" style="color: var(--color-sidebar-text); opacity: 0.7">{{ $t('auth.logout') }}</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
const collapsed = ref(false)
const { user } = useUserSession()
const isAdmin = computed(() => (user.value as any)?.role === 'admin')

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await navigateTo('/login')
}
</script>
