<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center gap-3">
      <label class="form-label mb-0 shrink-0">{{ $t('period.select') }}</label>
      <select v-model.number="periodId" class="form-input w-64">
        <option value="">—</option>
        <option v-for="p in periods" :key="p.id" :value="p.id">{{ p.name }}</option>
      </select>
    </div>

    <div v-if="periodId" class="card p-0 overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr style="border-bottom:1px solid var(--color-border)">
            <th class="text-left px-4 py-3 font-semibold" style="color:var(--color-text-muted)">{{ $t('student.name') }}</th>
            <th class="text-left px-4 py-3 font-semibold" style="color:var(--color-text-muted)">{{ $t('eval.completed') }}</th>
            <th class="text-left px-4 py-3 font-semibold" style="color:var(--color-text-muted)">{{ $t('eval.working') }}</th>
            <th class="text-left px-4 py-3 font-semibold" style="color:var(--color-text-muted)">{{ $t('eval.pending') }}</th>
            <th class="text-left px-4 py-3 font-semibold" style="color:var(--color-text-muted)">{{ $t('eval.progress') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!scheduleRows.length">
            <td colspan="5" class="px-4 py-8 text-center" style="color:var(--color-text-muted)">{{ $t('common.noData') }}</td>
          </tr>
          <tr v-for="row in scheduleRows" :key="row.studentId"
            class="border-b table-row-hover cursor-pointer" style="border-color:var(--color-border)"
            @click="navigateTo(`/teacher/evaluate/${row.studentId}`)">
            <td class="px-4 py-3 font-medium" style="color:var(--color-text)">{{ row.studentName }} {{ row.studentSurname }}</td>
            <td class="px-4 py-3"><span class="badge-active">{{ row.completed }}</span></td>
            <td class="px-4 py-3"><span class="badge-paused">{{ row.working }}</span></td>
            <td class="px-4 py-3"><span class="badge-ended">{{ row.pending }}</span></td>
            <td class="px-4 py-3 w-40">
              <div class="h-2 rounded-full overflow-hidden" style="background:var(--color-surface-alt)">
                <div class="h-full rounded-full" style="background:var(--color-success)"
                  :style="{ width: row.total > 0 ? `${Math.round(row.completed / row.total * 100)}%` : '0%' }"></div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const { data: periods } = await useFetch('/api/periods')
const periodId = ref<number | ''>('')
const { data: evalData, refresh } = await useFetch('/api/evaluations', { query: computed(() => periodId.value ? { periodId: periodId.value } : {}) })

const scheduleRows = computed(() => {
  if (!evalData.value?.length) return []
  const map = new Map<number, { studentId: number; studentName: string; studentSurname: string; completed: number; working: number; pending: number; total: number }>()
  for (const r of evalData.value as any[]) {
    if (!map.has(r.studentId)) {
      map.set(r.studentId, { studentId: r.studentId, studentName: r.studentName, studentSurname: r.studentSurname, completed: 0, working: 0, pending: 0, total: 0 })
    }
    const entry = map.get(r.studentId)!
    entry.total++
    if (r.result === 'completed') entry.completed++
    else if (r.result === 'working') entry.working++
    else entry.pending++
  }
  return [...map.values()]
})
</script>
