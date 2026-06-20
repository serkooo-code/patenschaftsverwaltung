<template>
  <div>
    <div class="flex justify-end mb-6">
      <NuxtLink to="/admin/students/new" class="btn-primary flex items-center gap-2">
        <span class="material-icons-round text-base">add</span>{{ $t('student.new') }}
      </NuxtLink>
    </div>
    <div class="card p-0 overflow-hidden">
      <table class="data-table">
        <thead>
          <tr>
            <th>{{ $t('student.name') }}</th>
            <th>{{ $t('student.no') }}</th>
            <th>{{ $t('student.school') }}</th>
            <th>{{ $t('student.birthDate') }}</th>
            <th class="w-24 text-center" style="border-right:none"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!data?.length">
            <td colspan="5" class="text-center py-8" style="color:var(--color-text-muted);border-right:none">{{ $t('common.noData') }}</td>
          </tr>
          <tr v-for="s in data" :key="s.id">
            <td class="font-medium">{{ s.name }} {{ s.surname }}</td>
            <td style="color:var(--color-text-muted)">{{ s.studentNo }}</td>
            <td style="color:var(--color-text-muted)">{{ s.className ?? '—' }}</td>
            <td style="color:var(--color-text-muted)">{{ s.birthDate }}</td>
            <td class="text-center" style="border-right:none">
              <div class="flex items-center justify-center gap-1">
                <NuxtLink :to="`/admin/students/${s.id}/edit`" class="p-1 rounded hover:bg-[var(--color-surface-alt)]">
                  <span class="material-icons-round text-base" style="color:var(--color-text-muted)">edit</span>
                </NuxtLink>
                <button @click="remove(s.id)" class="p-1 rounded hover:bg-[var(--color-surface-alt)]">
                  <span class="material-icons-round text-base" style="color:var(--color-danger)">delete</span>
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
const { data, refresh } = await useFetch('/api/students')
async function remove(id: number) {
  if (!confirm('Öğrenciyi sil?')) return
  await $fetch(`/api/students/${id}`, { method: 'DELETE' })
  refresh()
}
</script>
