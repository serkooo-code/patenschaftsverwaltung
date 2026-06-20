<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center gap-4">
      <NuxtLink to="/teacher" class="p-2 rounded-lg hover:bg-[var(--color-surface-alt)] transition-colors">
        <span class="material-icons-round" style="color:var(--color-text-muted)">arrow_back</span>
      </NuxtLink>
      <div v-if="student" class="flex-1">
        <h2 class="font-bold text-lg" style="color:var(--color-text)">{{ student.name }} {{ student.surname }}</h2>
        <p class="text-sm" style="color:var(--color-text-muted)">{{ student.studentNo }} · {{ student.className ?? '—' }}</p>
      </div>
      <div class="flex items-center gap-2">
        <label class="form-label mb-0 text-xs">{{ $t('period.select') }}</label>
        <select v-model.number="periodId" class="form-input w-48 text-sm">
          <option value="">—</option>
          <option v-for="p in periods" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>
      </div>
    </div>

    <div v-if="!periodId" class="card text-center py-8" style="color:var(--color-text-muted)">
      {{ $t('period.selectFirst') }}
    </div>

    <template v-else-if="student">
      <div v-for="sess in student.sessions" :key="sess.id" class="card">
        <h3 class="font-semibold mb-3" style="color:var(--color-text)">
          <span class="material-icons-round text-base align-middle mr-1" style="color:var(--color-primary)">event</span>
          {{ sess.name }}
        </h3>
        <div v-for="mod in sessionModules[sess.id] ?? []" :key="mod.id" class="mb-3">
          <p class="text-xs font-semibold mb-2 uppercase tracking-wide" style="color:var(--color-text-muted)">
            <span class="material-icons-round text-xs align-middle mr-1">layers</span>{{ mod.name }}
          </p>
          <div class="flex flex-col gap-1.5 pl-4">
            <div v-for="goal in moduleGoals[mod.id] ?? []" :key="goal.id"
              class="flex items-center gap-3 py-1.5 px-3 rounded-lg"
              style="background:var(--color-surface-alt)">
              <span class="flex-1 text-sm" style="color:var(--color-text)">{{ goal.name }}</span>
              <span v-if="goal.minAge" class="text-xs" style="color:var(--color-text-muted)">{{ goal.minAge }}–{{ goal.maxAge }}</span>
              <div class="flex gap-1">
                <button v-for="opt in resultOptions" :key="opt.value"
                  @click="setResult(goal.id, opt.value)"
                  class="px-2 py-0.5 rounded text-xs font-medium transition-colors"
                  :class="getResult(goal.id) === opt.value ? opt.activeClass : 'hover:bg-white/20'"
                  :style="getResult(goal.id) !== opt.value ? 'color:var(--color-text-muted)' : ''">
                  {{ opt.label }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!student.sessions?.length" class="card text-center py-8" style="color:var(--color-text-muted)">
        {{ $t('eval.noSessions') }}
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const route = useRoute()
const { user } = useUserSession()
const sessionUser = user.value as any

const studentId = Number(route.params.studentId)
const [{ data: student }, { data: periods }, { data: allModules }, { data: allGoals },
  { data: sessionModuleAssoc }, { data: moduleGoalAssoc }] = await Promise.all([
  useFetch(`/api/students/${studentId}`),
  useFetch('/api/periods'),
  useFetch('/api/modules'),
  useFetch('/api/goals'),
  useFetch('/api/associations'),
  useFetch('/api/associations'),
])

const periodId = ref<number | ''>('')
const results = ref<Record<number, 'completed' | 'working' | 'pending'>>({})

const { t } = useI18n()
const resultOptions = [
  { value: 'completed' as const, label: t('result.completed'), activeClass: 'badge-active' },
  { value: 'working' as const, label: t('result.working'), activeClass: 'badge-paused' },
  { value: 'pending' as const, label: t('result.pending'), activeClass: 'badge-ended' },
]

// Build lookup maps from association data
const sessionModules = computed(() => {
  const map: Record<number, { id: number; name: string }[]> = {}
  for (const r of (sessionModuleAssoc.value as any)?.sessionModules ?? []) {
    if (!map[r.sessionId]) map[r.sessionId] = []
    map[r.sessionId].push({ id: r.moduleId, name: r.moduleName })
  }
  return map
})

const moduleGoals = computed(() => {
  const map: Record<number, { id: number; name: string; minAge: number | null; maxAge: number | null }[]> = {}
  for (const r of (moduleGoalAssoc.value as any)?.moduleGoals ?? []) {
    if (!map[r.moduleId]) map[r.moduleId] = []
    const goal = (allGoals.value as any[])?.find((g: any) => g.id === r.goalId)
    map[r.moduleId].push({ id: r.goalId, name: r.goalName, minAge: goal?.minAge ?? null, maxAge: goal?.maxAge ?? null })
  }
  return map
})

// Load existing results when period changes
watch(periodId, async (pid) => {
  if (!pid) return
  const data = await $fetch('/api/evaluations', { query: { studentId, periodId: pid } }) as any[]
  results.value = {}
  for (const r of data) results.value[r.goalId] = r.result
})

function getResult(goalId: number) {
  return results.value[goalId] ?? null
}

async function setResult(goalId: number, result: 'completed' | 'working' | 'pending') {
  if (!periodId.value) return
  const teacherId = sessionUser?.teacherId ?? sessionUser?.id
  results.value[goalId] = result
  await $fetch('/api/evaluations', {
    method: 'POST',
    body: { studentId, goalId, teacherId, periodId: periodId.value, result },
  })
}
</script>
