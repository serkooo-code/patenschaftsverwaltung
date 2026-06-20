<template>
  <div class="flex flex-col gap-6">
    <!-- Period selector -->
    <div class="card flex items-center gap-4 py-4">
      <label class="form-label mb-0 shrink-0">{{ $t('period.select') }}</label>
      <select v-model="selectedPeriodId" class="form-input w-64">
        <option value="">— {{ $t('period.select') }} —</option>
        <option v-for="p in report?.periods" :key="p.id" :value="p.id">{{ p.name }}</option>
      </select>
    </div>

    <template v-if="selectedPeriodId && report">
      <!-- Teacher stats -->
      <div class="card">
        <h2 class="font-semibold mb-4" style="color:var(--color-text)">{{ $t('report.teacherStats') }}</h2>
        <table class="w-full text-sm">
          <thead>
            <tr style="border-bottom:1px solid var(--color-border)">
              <th class="text-left px-3 py-2 font-semibold" style="color:var(--color-text-muted)">{{ $t('teacher.name') }}</th>
              <th class="text-left px-3 py-2 font-semibold" style="color:var(--color-text-muted)">{{ $t('report.totalStudents') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in report.teacherStats" :key="t.teacherId"
              class="border-b table-row-hover" style="border-color:var(--color-border)">
              <td class="px-3 py-2" style="color:var(--color-text)">{{ t.teacherName }} {{ t.teacherSurname }}</td>
              <td class="px-3 py-2" style="color:var(--color-text-muted)">{{ t.totalStudents }}</td>
            </tr>
            <tr v-if="!report.teacherStats?.length">
              <td colspan="2" class="px-3 py-6 text-center" style="color:var(--color-text-muted)">{{ $t('common.noData') }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Student completion -->
      <div class="card">
        <h2 class="font-semibold mb-4" style="color:var(--color-text)">{{ $t('report.studentCompletion') }}</h2>
        <div class="flex flex-col gap-3">
          <div v-for="s in report.studentCompletion" :key="s.studentId">
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm font-medium" style="color:var(--color-text)">{{ s.studentName }} {{ s.studentSurname }}</span>
              <span class="text-xs" style="color:var(--color-text-muted)">
                {{ s.completed }}/{{ s.total }} {{ $t('result.completed') }}
              </span>
            </div>
            <div class="h-2 rounded-full overflow-hidden" style="background:var(--color-surface-alt)">
              <div class="h-full rounded-full transition-all" style="background:var(--color-success)"
                :style="{ width: s.total > 0 ? `${Math.round(s.completed / s.total * 100)}%` : '0%' }"></div>
            </div>
          </div>
          <p v-if="!report.studentCompletion?.length" class="text-center py-4" style="color:var(--color-text-muted)">
            {{ $t('common.noData') }}
          </p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
const selectedPeriodId = ref<number | ''>('')
const { data: report, refresh } = await useFetch('/api/reports')
watch(selectedPeriodId, (id) => {
  if (id) refresh({ query: { periodId: id } } as any)
})
</script>
