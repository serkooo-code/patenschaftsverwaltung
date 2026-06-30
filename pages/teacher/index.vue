<template>
  <div class="flex flex-col gap-4">
    <!-- Keine Schulen -->
    <div v-if="!schools?.length" class="card text-center py-10" style="color:var(--color-text-muted)">
      {{ $t('common.noData') }}
    </div>

    <!-- Okul → Öğrenciler -->
    <div v-for="school in schools" :key="school.id" class="card">
      <!-- Schul-Header -->
      <div class="flex items-center gap-2 mb-4 pb-3" style="border-bottom:1px solid var(--color-border)">
        <span class="material-icons-round text-base" style="color:var(--color-primary)">corporate_fare</span>
        <span class="font-bold" style="color:var(--color-text)">{{ school.name }}</span>
        <span class="text-xs ml-1" style="color:var(--color-text-muted)">#{{ school.schoolNo }}</span>
      </div>

      <!-- Schüler-Liste -->
      <div v-if="school.students?.length" class="flex flex-col gap-2">
        <div v-for="s in school.students" :key="s.id"
          class="flex items-center justify-between px-3 py-2.5 rounded-lg"
          style="background:var(--color-surface-alt)">
          <div class="flex items-center gap-2 min-w-0">
            <span class="material-icons-round text-base shrink-0" style="color:var(--color-text-muted)">person</span>
            <span class="font-medium text-sm truncate" style="color:var(--color-text)">
              {{ s.surname }}, {{ s.name }}
            </span>
            <span class="text-xs shrink-0" style="color:var(--color-text-muted)">#{{ s.studentNo }}</span>
          </div>
          <NuxtLink :to="`/teacher/evaluate/${s.id}`"
            class="btn-primary text-xs px-3 py-1.5 inline-flex shrink-0 ml-3">
            {{ $t('eval.evaluate') }}
          </NuxtLink>
        </div>
      </div>
      <p v-else class="text-sm" style="color:var(--color-text-muted)">
        {{ $t('assoc.noStudents') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const { data: schools } = await useFetch('/api/teacher/my-overview')
</script>
