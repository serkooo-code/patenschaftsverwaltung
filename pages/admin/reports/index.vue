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
      <div class="card p-0 overflow-hidden">
        <button type="button" @click="teacherStatsOpen = !teacherStatsOpen"
          class="w-full flex items-center justify-between px-5 py-4 hover:bg-[var(--color-surface-alt)] transition-colors">
          <h2 class="font-semibold" style="color:var(--color-text)">{{ $t('report.teacherStats') }}</h2>
          <span class="material-icons-round text-base transition-transform duration-200"
            style="color:var(--color-text-muted)"
            :style="{ transform: teacherStatsOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }">
            expand_more
          </span>
        </button>

        <div v-if="teacherStatsOpen" style="border-top:1px solid var(--color-border)">
          <!-- Filter -->
          <div class="px-5 pb-3 pt-2 flex items-center gap-2">
            <span class="material-icons-round text-base shrink-0" style="color:var(--color-text-muted)">search</span>
            <input v-model="teacherFilter" type="text" :placeholder="$t('common.search')"
              class="flex-1 bg-transparent text-sm outline-none py-1" style="color:var(--color-text)" />
            <button v-if="teacherFilter" @click="teacherFilter = ''" type="button"
              class="shrink-0 p-0.5 rounded hover:bg-[var(--color-surface-alt)]">
              <span class="material-icons-round text-base" style="color:var(--color-text-muted)">close</span>
            </button>
          </div>

          <!-- Teacher rows -->
          <div style="border-top:1px solid var(--color-border)">
            <template v-for="t in filteredTeacherStats" :key="t.teacherId">
              <!-- Teacher row (clickable) -->
              <button type="button" @click="toggleTeacher(t.teacherId)"
                class="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-[var(--color-surface-alt)] transition-colors"
                style="border-bottom:1px solid var(--color-border)">
                <span class="material-icons-round text-base transition-transform duration-200 shrink-0"
                  style="color:var(--color-text-muted)"
                  :style="{ transform: expandedTeachers.has(t.teacherId) ? 'rotate(90deg)' : 'rotate(0deg)' }">
                  chevron_right
                </span>
                <span class="flex-1 text-sm font-medium" style="color:var(--color-text)">
                  {{ t.teacherName }} {{ t.teacherSurname }}
                </span>
                <!-- Progress bar + counts -->
                <div class="flex items-center gap-3 shrink-0">
                  <div class="w-32 h-2 rounded-full overflow-hidden" style="background:var(--color-surface-alt)">
                    <div class="h-full rounded-full transition-all" style="background:var(--color-success)"
                      :style="{ width: t.totalStudents > 0 ? `${Math.round(t.evaluatedCount / t.totalStudents * 100)}%` : '0%' }">
                    </div>
                  </div>
                  <span class="text-xs w-16 text-right" style="color:var(--color-text-muted)">
                    <span :style="{ color: t.evaluatedCount === t.totalStudents ? 'var(--color-success)' : 'var(--color-text)' }" class="font-semibold">
                      {{ t.evaluatedCount }}
                    </span>
                    / {{ t.totalStudents }}
                  </span>
                </div>
              </button>

              <!-- Student detail (expanded) -->
              <div v-if="expandedTeachers.has(t.teacherId)"
                class="grid gap-1 px-5 py-3"
                style="background:var(--color-surface-alt);border-bottom:1px solid var(--color-border);grid-template-columns:repeat(auto-fill,minmax(260px,1fr))">
                <button type="button" v-for="s in t.students" :key="s.studentId"
                  @click="selectStudent(s.studentId)"
                  class="flex items-center gap-2 px-3 py-2 rounded-lg w-full text-left hover:opacity-80 transition-opacity cursor-pointer"
                  style="background:var(--color-surface)">
                  <span class="material-icons-round text-base shrink-0"
                    :style="{ color: s.evaluated ? 'var(--color-success)' : 'var(--color-danger)' }">
                    {{ s.evaluated ? 'check_circle' : 'radio_button_unchecked' }}
                  </span>
                  <span class="flex-1 text-sm truncate" style="color:var(--color-text)">
                    {{ s.studentSurname }}, {{ s.studentName }}
                  </span>
                  <span class="text-xs shrink-0 px-1.5 py-0.5 rounded-full font-medium"
                    :style="s.evaluated
                      ? 'background:color-mix(in srgb,var(--color-success) 12%,transparent);color:var(--color-success)'
                      : 'background:color-mix(in srgb,var(--color-danger) 12%,transparent);color:var(--color-danger)'">
                    {{ s.evaluated ? $t('report.evaluated') : $t('report.open') }}
                  </span>
                </button>
              </div>
            </template>

            <div v-if="!filteredTeacherStats.length" class="px-5 py-6 text-center text-sm" style="color:var(--color-text-muted)">
              {{ $t('common.noData') }}
            </div>
          </div>
        </div>
      </div>

      <!-- Student completion -->
      <div ref="studentCompletionRef" class="card p-0 overflow-hidden">
        <button type="button" @click="studentCompletionOpen = !studentCompletionOpen"
          class="w-full flex items-center justify-between px-5 py-4 hover:bg-[var(--color-surface-alt)] transition-colors">
          <h2 class="font-semibold" style="color:var(--color-text)">{{ $t('report.studentCompletion') }}</h2>
          <span class="material-icons-round text-base transition-transform duration-200"
            style="color:var(--color-text-muted)"
            :style="{ transform: studentCompletionOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }">
            expand_more
          </span>
        </button>

        <div v-if="studentCompletionOpen" style="border-top:1px solid var(--color-border)">
          <div v-if="expandedTeachers.size === 0 && filteredStudentCompletion.length === 0" class="px-5 py-6 text-center text-sm" style="color:var(--color-text-muted)">
            Bitte einen Lehrer aufklappen, um dessen Schüler zu sehen.
          </div>
          <div v-for="s in filteredStudentCompletion" :key="s.studentId">
            <button type="button" @click="toggleStudent(s.studentId)"
              class="w-full flex items-start gap-3 px-5 py-3 hover:bg-[var(--color-surface-alt)] transition-colors text-left"
              style="border-bottom:1px solid var(--color-border)">
              <span class="material-icons-round text-base mt-0.5 transition-transform duration-200 shrink-0"
                style="color:var(--color-text-muted)"
                :style="{ transform: expandedStudents.has(s.studentId) ? 'rotate(90deg)' : 'rotate(0deg)' }">
                chevron_right
              </span>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-1.5">
                  <span class="text-sm font-medium" style="color:var(--color-text)">{{ s.studentName }} {{ s.studentSurname }}</span>
                  <span class="text-xs shrink-0 ml-3" style="color:var(--color-text-muted)">
                    {{ s.completed }}/{{ s.total }} {{ $t('result.completed') }}
                  </span>
                </div>
                <div class="h-2 rounded-full overflow-hidden" style="background:var(--color-surface-alt)">
                  <div class="h-full rounded-full transition-all" style="background:var(--color-success)"
                    :style="{ width: s.total > 0 ? `${Math.round(s.completed / s.total * 100)}%` : '0%' }"></div>
                </div>
              </div>
            </button>

            <div v-if="expandedStudents.has(s.studentId)"
              class="px-5 py-3 flex flex-col gap-2"
              style="background:var(--color-surface-alt);border-bottom:1px solid var(--color-border)">
              <div v-if="loadingStudents.has(s.studentId)" class="text-sm py-2 text-center" style="color:var(--color-text-muted)">
                {{ $t('common.loading') }}
              </div>
              <template v-else-if="studentGoals.get(s.studentId)?.length">
                <div v-for="g in studentGoals.get(s.studentId)" :key="g.id"
                  class="flex items-center gap-3 px-3 py-2 rounded-lg"
                  style="background:var(--color-surface)">
                  <span class="material-icons-round text-base shrink-0"
                    :style="{ color: g.result === 'completed' ? 'var(--color-success)' : g.result === 'working' ? 'var(--color-primary)' : 'var(--color-danger)' }">
                    {{ g.result === 'completed' ? 'check_circle' : g.result === 'working' ? 'pending' : 'radio_button_unchecked' }}
                  </span>
                  <span class="flex-1 text-sm" style="color:var(--color-text)">{{ g.goalName }}</span>
                  <span class="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
                    :style="g.result === 'completed'
                      ? 'background:color-mix(in srgb,var(--color-success) 15%,transparent);color:var(--color-success)'
                      : g.result === 'working'
                      ? 'background:var(--color-primary-subtle);color:var(--color-primary)'
                      : 'background:color-mix(in srgb,var(--color-danger) 15%,transparent);color:var(--color-danger)'">
                    {{ $t(`result.${g.result}`) }}
                  </span>
                </div>
              </template>
              <p v-else class="text-sm py-1 text-center" style="color:var(--color-text-muted)">{{ $t('common.noData') }}</p>
            </div>
          </div>

          <p v-if="filteredStudentCompletion.length === 0 && expandedTeachers.size > 0" class="px-5 py-6 text-center text-sm" style="color:var(--color-text-muted)">
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
const { data: report } = await useFetch('/api/reports', {
  query: computed(() => selectedPeriodId.value ? { periodId: selectedPeriodId.value } : {}),
})

const teacherStatsOpen = ref(true)
const studentCompletionOpen = ref(true)
const teacherFilter = ref('')

const expandedTeachers = ref(new Set<number>())
const expandedStudents = ref(new Set<number>())
const studentGoals = ref(new Map<number, any[]>())
const loadingStudents = ref(new Set<number>())
const studentCompletionRef = ref<HTMLElement | null>(null)

function toggleTeacher(id: number) {
  if (expandedTeachers.value.has(id)) expandedTeachers.value.delete(id)
  else expandedTeachers.value.add(id)
  expandedTeachers.value = new Set(expandedTeachers.value)
}

function selectStudent(studentId: number) {
  nextTick(() => {
    studentCompletionRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

async function toggleStudent(studentId: number) {
  if (expandedStudents.value.has(studentId)) {
    expandedStudents.value.delete(studentId)
    expandedStudents.value = new Set(expandedStudents.value)
    return
  }
  expandedStudents.value.add(studentId)
  expandedStudents.value = new Set(expandedStudents.value)
  if (studentGoals.value.has(studentId)) return
  loadingStudents.value.add(studentId)
  loadingStudents.value = new Set(loadingStudents.value)
  try {
    const goals = await $fetch('/api/evaluations', {
      query: { studentId, periodId: selectedPeriodId.value }
    }) as any[]
    studentGoals.value.set(studentId, goals.sort((a, b) => {
      const order = { completed: 0, working: 1, pending: 2 }
      return (order[a.result as keyof typeof order] ?? 3) - (order[b.result as keyof typeof order] ?? 3)
    }))
    studentGoals.value = new Map(studentGoals.value)
  } finally {
    loadingStudents.value.delete(studentId)
    loadingStudents.value = new Set(loadingStudents.value)
  }
}

watch(selectedPeriodId, () => {
  expandedTeachers.value = new Set()
  expandedStudents.value = new Set()
  studentGoals.value = new Map()
})

const filteredTeacherStats = computed(() => {
  const q = teacherFilter.value.toLocaleLowerCase('tr')
  const list = (report.value as any)?.teacherStats ?? []
  if (!q) return list
  return list.filter((t: any) =>
    `${t.teacherName} ${t.teacherSurname}`.toLocaleLowerCase('tr').includes(q)
  )
})

// Student completion: only show when a teacher is expanded, filtered to their students
const filteredStudentCompletion = computed(() => {
  if (expandedTeachers.value.size === 0) return []
  const all = (report.value as any)?.studentCompletion ?? []
  const teacherStats = (report.value as any)?.teacherStats ?? []
  const allowedIds = new Set<number>()
  for (const t of teacherStats) {
    if (expandedTeachers.value.has(t.teacherId)) {
      for (const s of t.students) allowedIds.add(s.studentId)
    }
  }
  return all.filter((s: any) => allowedIds.has(s.studentId))
})
</script>
