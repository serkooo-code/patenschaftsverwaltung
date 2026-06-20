<template>
  <div>
    <div class="card p-0 overflow-hidden">
      <table class="data-table">
        <thead>
          <tr>
            <th>{{ $t('student.name') }}</th>
            <th>{{ $t('student.no') }}</th>
            <th>{{ $t('student.school') }}</th>
            <th class="text-center" style="border-right:none">{{ $t('eval.evaluate') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!allStudents?.length">
            <td colspan="4" class="text-center py-8" style="color:var(--color-text-muted);border-right:none">{{ $t('common.noData') }}</td>
          </tr>
          <tr v-for="s in allStudents" :key="s.id">
            <td class="font-medium">{{ s.name }} {{ s.surname }}</td>
            <td style="color:var(--color-text-muted)">{{ s.studentNo }}</td>
            <td style="color:var(--color-text-muted)">{{ s.className ?? '—' }}</td>
            <td class="text-center" style="border-right:none">
              <NuxtLink :to="`/teacher/evaluate/${s.id}`" class="btn-primary text-xs px-3 py-1.5 inline-flex">
                {{ $t('eval.evaluate') }}
              </NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const { data: allStudents } = await useFetch('/api/students')
</script>
