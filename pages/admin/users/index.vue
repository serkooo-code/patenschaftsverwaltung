<template>
  <div>
    <div class="flex justify-end mb-6">
      <NuxtLink to="/admin/users/new" class="btn-primary flex items-center gap-2">
        <span class="material-icons-round text-base">person_add</span>{{ $t('user.new') }}
      </NuxtLink>
    </div>
    <div class="card p-0 overflow-hidden">
      <table class="data-table">
        <thead>
          <tr>
            <th>{{ $t('user.email') }}</th>
            <th>{{ $t('user.role') }}</th>
            <th>{{ $t('teacher.name') }}</th>
            <th class="w-12" style="border-right:none"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!data?.length">
            <td colspan="4" class="text-center py-8" style="color:var(--color-text-muted);border-right:none">{{ $t('common.noData') }}</td>
          </tr>
          <tr v-for="u in data" :key="u.id">
            <td>{{ u.email }}</td>
            <td>
              <span class="px-2 py-0.5 rounded text-xs font-medium"
                :style="u.role === 'admin'
                  ? 'background:color-mix(in srgb,var(--color-primary) 15%,transparent);color:var(--color-primary)'
                  : 'background:var(--color-surface-alt);color:var(--color-text-muted)'">
                {{ $t(`role.${u.role}`) }}
              </span>
            </td>
            <td style="color:var(--color-text-muted)">{{ u.teacherName ?? '—' }}</td>
            <td class="text-center" style="border-right:none">
              <button @click="remove(u.id)" class="p-1 rounded hover:bg-[var(--color-surface-alt)]">
                <span class="material-icons-round text-base" style="color:var(--color-danger)">delete</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
const { data, refresh } = await useFetch('/api/users')
const { t } = useI18n()
const { confirm: askConfirm } = useConfirm()
async function remove(id: number) {
  if (!await askConfirm(t('common.deleteConfirm'))) return
  await $fetch(`/api/users/${id}`, { method: 'DELETE' })
  refresh()
}
</script>
