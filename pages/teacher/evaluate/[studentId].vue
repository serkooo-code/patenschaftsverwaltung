<template>
  <div class="flex flex-col gap-4">
    <!-- Header -->
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
      <!-- Branş → Seans → Modül → Hedef -->
      <div v-for="disc in disciplineTree.disciplines" :key="disc.id" class="card">
        <!-- Branş header -->
        <div class="flex items-center gap-2 mb-4 pb-3" style="border-bottom:1px solid var(--color-border)">
          <span class="material-icons-round text-base" style="color:var(--color-primary)">sports</span>
          <span class="font-bold text-base" style="color:var(--color-text)">{{ disc.name }}</span>
        </div>

        <!-- Seanslar -->
        <div v-for="sess in disc.sessions" :key="sess.id" class="mb-5 last:mb-0">
          <p class="text-sm font-semibold mb-3 flex items-center gap-1.5" style="color:var(--color-text)">
            <span class="material-icons-round text-base" style="color:var(--color-primary);opacity:0.7">event</span>
            {{ sess.name }}
          </p>

          <!-- Modüller -->
          <div v-for="mod in sessionModules[sess.id] ?? []" :key="mod.id" class="mb-3 pl-4">
            <p class="text-xs font-bold mb-2 uppercase tracking-wider flex items-center gap-1" style="color:var(--color-text-muted)">
              <span class="material-icons-round" style="font-size:14px">layers</span>
              {{ mod.name }}
            </p>

            <!-- Hedefler -->
            <div class="flex flex-col gap-1.5 pl-4">
              <div v-for="goal in moduleGoals[mod.id] ?? []" :key="goal.id"
                class="flex items-center gap-3 py-2 px-3 rounded-lg"
                style="background:var(--color-surface-alt)">
                <span class="flex-1 text-sm" style="color:var(--color-text)">{{ goal.name }}</span>
                <span v-if="goal.minAge" class="text-xs shrink-0" style="color:var(--color-text-muted)">
                  {{ goal.minAge }}–{{ goal.maxAge }}
                </span>
                <!-- 3 Antwortmöglichkeiten -->
                <div class="flex gap-1 shrink-0">
                  <button v-for="opt in resultOptions" :key="opt.value"
                    @click="setResult(goal.id, opt.value)"
                    class="px-2.5 py-1 rounded text-xs font-medium transition-colors"
                    :class="getResult(goal.id) === opt.value ? opt.activeClass : 'hover:bg-white/10'"
                    :style="getResult(goal.id) !== opt.value ? 'color:var(--color-text-muted)' : ''">
                    {{ opt.label }}
                  </button>
                </div>
              </div>

              <p v-if="!(moduleGoals[mod.id] ?? []).length" class="text-xs pl-1" style="color:var(--color-text-muted)">
                {{ $t('common.noData') }}
              </p>
            </div>
          </div>

          <p v-if="!(sessionModules[sess.id] ?? []).length" class="text-xs pl-4" style="color:var(--color-text-muted)">
            {{ $t('common.noData') }}
          </p>
        </div>
      </div>

      <!-- Sessions ohne Branş-Zuordnung -->
      <div v-if="disciplineTree.ungrouped.length" class="card">
        <div class="flex items-center gap-2 mb-4 pb-3" style="border-bottom:1px solid var(--color-border)">
          <span class="material-icons-round text-base" style="color:var(--color-text-muted)">event_note</span>
          <span class="font-bold text-base" style="color:var(--color-text-muted)">{{ $t('nav.sessions') }}</span>
        </div>
        <div v-for="sess in disciplineTree.ungrouped" :key="sess.id" class="mb-5 last:mb-0">
          <p class="text-sm font-semibold mb-3" style="color:var(--color-text)">{{ sess.name }}</p>
          <div v-for="mod in sessionModules[sess.id] ?? []" :key="mod.id" class="mb-3 pl-4">
            <p class="text-xs font-bold mb-2 uppercase tracking-wider" style="color:var(--color-text-muted)">{{ mod.name }}</p>
            <div class="flex flex-col gap-1.5 pl-4">
              <div v-for="goal in moduleGoals[mod.id] ?? []" :key="goal.id"
                class="flex items-center gap-3 py-2 px-3 rounded-lg"
                style="background:var(--color-surface-alt)">
                <span class="flex-1 text-sm" style="color:var(--color-text)">{{ goal.name }}</span>
                <div class="flex gap-1 shrink-0">
                  <button v-for="opt in resultOptions" :key="opt.value"
                    @click="setResult(goal.id, opt.value)"
                    class="px-2.5 py-1 rounded text-xs font-medium transition-colors"
                    :class="getResult(goal.id) === opt.value ? opt.activeClass : 'hover:bg-white/10'"
                    :style="getResult(goal.id) !== opt.value ? 'color:var(--color-text-muted)' : ''">
                    {{ opt.label }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!disciplineTree.disciplines.length && !disciplineTree.ungrouped.length"
        class="card text-center py-8" style="color:var(--color-text-muted)">
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
const [{ data: student }, { data: periods }, { data: allGoals }, { data: assoc }, { data: myDisciplineIds }] = await Promise.all([
  useFetch(`/api/students/${studentId}`),
  useFetch('/api/periods'),
  useFetch('/api/goals'),
  useFetch('/api/associations'),
  useFetch('/api/teacher/my-disciplines'),
])

const periodId = ref<number | ''>('')
const results = ref<Record<number, 'completed' | 'working' | 'pending'>>({})

const { t } = useI18n()
const resultOptions = [
  { value: 'completed' as const, label: t('result.completed'), activeClass: 'badge-active' },
  { value: 'working' as const, label: t('result.working'), activeClass: 'badge-paused' },
  { value: 'pending' as const, label: t('result.pending'), activeClass: 'badge-pending' },
]

// Seans → Modüller
const sessionModules = computed(() => {
  const map: Record<number, { id: number; name: string }[]> = {}
  for (const r of (assoc.value as any)?.sessionModule ?? []) {
    if (!map[r.sessionId]) map[r.sessionId] = []
    map[r.sessionId].push({ id: r.moduleId, name: r.moduleName })
  }
  return map
})

// Modül → Hedefler
const moduleGoals = computed(() => {
  const map: Record<number, { id: number; name: string; minAge: number | null; maxAge: number | null }[]> = {}
  for (const r of (assoc.value as any)?.moduleGoal ?? []) {
    if (!map[r.moduleId]) map[r.moduleId] = []
    const goal = (allGoals.value as any[])?.find((g: any) => g.id === r.goalId)
    map[r.moduleId].push({ id: r.goalId, name: r.goalName, minAge: goal?.minAge ?? null, maxAge: goal?.maxAge ?? null })
  }
  return map
})

// Branş → Seanslar → (nur Schüler-Sessions, gefiltert nach Lehrer-Branşlar)
const disciplineTree = computed(() => {
  const studentSessionIds = new Set((student.value as any)?.sessions?.map((s: any) => s.id) ?? [])
  const disciplineSessions: any[] = (assoc.value as any)?.disciplineSession ?? []
  // null = Admin (kein Filter), Array = Lehrer-Branşlar
  const allowedIds: number[] | null = myDisciplineIds.value as any

  const disciplineMap = new Map<number, { id: number; name: string; sessions: { id: number; name: string }[] }>()
  for (const ds of disciplineSessions) {
    if (!studentSessionIds.has(ds.sessionId)) continue
    if (allowedIds !== null && !allowedIds.includes(ds.disciplineId)) continue
    if (!disciplineMap.has(ds.disciplineId)) {
      disciplineMap.set(ds.disciplineId, { id: ds.disciplineId, name: ds.disciplineName, sessions: [] })
    }
    const disc = disciplineMap.get(ds.disciplineId)!
    if (!disc.sessions.find(s => s.id === ds.sessionId)) {
      disc.sessions.push({ id: ds.sessionId, name: ds.sessionName })
    }
  }

  const assignedSessionIds = new Set(disciplineSessions.map((ds: any) => ds.sessionId))
  const ungrouped = ((student.value as any)?.sessions ?? [])
    .filter((s: any) => !assignedSessionIds.has(s.id))

  return { disciplines: [...disciplineMap.values()], ungrouped }
})

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
