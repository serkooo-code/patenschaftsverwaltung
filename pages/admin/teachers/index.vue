<template>
  <div>
    <div class="flex justify-end mb-6">
      <NuxtLink to="/admin/teachers/new" class="btn-primary flex items-center gap-2">
        <span class="material-icons text-base">add</span>{{ $t('teacher.new') }}
      </NuxtLink>
    </div>
    <div class="card p-0 overflow-hidden">
      <table class="data-table">
        <thead>
          <tr>
            <th>{{ $t('teacher.name') }}</th>
            <th>{{ $t('teacher.no') }}</th>
            <th class="w-24" style="border-right:none"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!data?.length">
            <td colspan="3" class="text-center py-8" style="color:var(--color-text-muted);border-right:none">{{ $t('common.noData') }}</td>
          </tr>
          <tr v-for="t in data" :key="t.id">
            <td class="font-medium">{{ t.name }} {{ t.surname }}</td>
            <td style="color:var(--color-text-muted)">{{ t.teacherNo }}</td>
            <td class="text-center" style="border-right:none">
              <div class="flex items-center justify-center gap-1">
                <NuxtLink :to="`/admin/teachers/${t.id}/edit`" class="p-1 rounded hover:bg-[var(--color-surface-alt)]">
                  <span class="material-icons text-base" style="color:var(--color-text-muted)">edit</span>
                </NuxtLink>
                <button @click="remove(t.id)" class="p-1 rounded hover:bg-[var(--color-surface-alt)]">
                  <span class="material-icons text-base" style="color:var(--color-danger)">delete</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
const { data, refresh } = await useFetch('/api/teachers')
async function remove(id: number) {
  if (!confirm('Öğretmeni sil?')) return
  await $fetch(`/api/teachers/${id}`, { method: 'DELETE' })
  refresh()
}
</script>
