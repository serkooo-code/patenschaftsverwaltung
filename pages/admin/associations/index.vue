<template>
  <div class="flex flex-col gap-6">
    <!-- Add association form -->
    <div class="card">
      <h2 class="font-semibold mb-4" style="color:var(--color-text)">{{ $t('assoc.add') }}</h2>
      <form @submit.prevent="add" class="flex flex-wrap gap-3 items-end">
        <div>
          <label class="form-label">{{ $t('assoc.type') }}</label>
          <select v-model="form.type" class="form-input">
            <option value="moduleGoal">{{ $t('assoc.moduleGoal') }}</option>
            <option value="sessionModule">{{ $t('assoc.sessionModule') }}</option>
            <option value="disciplineSession">{{ $t('assoc.disciplineSession') }}</option>
          </select>
        </div>
        <div>
          <label class="form-label">{{ labelA }}</label>
          <select v-model.number="form.a" class="form-input">
            <option value="">—</option>
            <option v-for="o in optionsA" :key="o.id" :value="o.id">{{ o.label }}</option>
          </select>
        </div>
        <div>
          <label class="form-label">{{ labelB }}</label>
          <select v-model.number="form.b" class="form-input">
            <option value="">—</option>
            <option v-for="o in optionsB" :key="o.id" :value="o.id">{{ o.label }}</option>
          </select>
        </div>
        <button type="submit" class="btn-primary" :disabled="!form.a || !form.b">{{ $t('common.add') }}</button>
      </form>
      <p v-if="error" class="text-sm mt-2" style="color:var(--color-danger)">{{ error }}</p>
    </div>

    <!-- Current associations (grouped by left entity) -->
    <div v-for="section in sections" :key="section.key" class="card p-0 overflow-hidden">
      <button type="button"
        class="w-full flex items-center gap-2 px-5 py-4 text-left hover:opacity-80 transition-opacity"
        @click="toggleSection(section.key)">
        <h3 class="font-semibold" style="color:var(--color-text)">{{ $t(`assoc.${section.key}`) }}</h3>
        <span class="text-xs ml-1 opacity-50">
          ({{ (assocData as any)?.[section.key]?.length ?? 0 }})
        </span>
        <span class="material-icons-round ml-auto transition-transform"
          :style="{ transform: collapsedSections.has(section.key) ? 'rotate(-90deg)' : 'rotate(0deg)', color: 'var(--color-text-muted)' }">
          expand_more
        </span>
      </button>

      <div v-show="!collapsedSections.has(section.key)" class="px-5 pb-5">
        <div v-if="!(assocData as any)?.[section.key]?.length" class="text-sm" style="color:var(--color-text-muted)">
          {{ $t('common.noData') }}
        </div>
        <div v-else class="flex flex-col gap-2">
          <div v-for="group in grouped(section)" :key="group.aId"
            class="p-3 rounded-lg" style="background:var(--color-surface-alt)">
            <p class="text-xs font-bold mb-2 uppercase tracking-wide" style="color:var(--color-text-muted)">
              {{ group.aName }}
              <span class="ml-1 font-normal normal-case tracking-normal opacity-60">({{ group.rows.length }})</span>
            </p>
            <div class="flex flex-wrap gap-1.5">
              <span v-for="row in group.rows" :key="section.bId(row)"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                style="background:var(--color-surface);border:1px solid var(--color-border);color:var(--color-text)">
                {{ section.bName(row) }}
                <button @click="remove(section.type, section.aId(row), section.bId(row))"
                  class="ml-0.5 hover:opacity-70">
                  <span class="material-icons-round" style="font-size:12px">close</span>
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- School – Teacher – Student overview -->
    <div>
      <div class="flex items-center justify-between mb-4">
        <p class="text-xs font-bold uppercase tracking-wider" style="color:var(--color-text-muted)">
          {{ $t('assoc.overview') }}
        </p>
        <!-- Filter -->
        <div class="flex gap-2">
          <div class="relative">
            <span class="material-icons-round pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2"
              style="font-size:15px;color:var(--color-text-muted)">person</span>
            <input v-model="teacherFilter" :placeholder="$t('nav.teachers') + ' ' + $t('common.search')"
              class="form-input py-1.5 text-xs w-44 pl-8 pr-7" />
            <button v-if="teacherFilter" @click="teacherFilter = ''"
              class="absolute right-2 top-1/2 -translate-y-1/2 hover:opacity-70">
              <span class="material-icons-round" style="font-size:15px;color:var(--color-text-muted)">close</span>
            </button>
          </div>
          <div class="relative">
            <span class="material-icons-round pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2"
              style="font-size:15px;color:var(--color-text-muted)">people</span>
            <input v-model="studentFilter" :placeholder="$t('nav.students') + ' ' + $t('common.search')"
              class="form-input py-1.5 text-xs w-44 pl-8 pr-7" />
            <button v-if="studentFilter" @click="studentFilter = ''"
              class="absolute right-2 top-1/2 -translate-y-1/2 hover:opacity-70">
              <span class="material-icons-round" style="font-size:15px;color:var(--color-text-muted)">close</span>
            </button>
          </div>
        </div>
      </div>
      <div class="grid gap-4">
        <div v-if="!overview?.length" class="card py-8 text-center text-sm" style="color:var(--color-text-muted)">
          {{ $t('common.noData') }}
        </div>
        <div v-for="cls in overview" :key="cls.id" class="card">
          <!-- School header -->
          <button type="button" @click="toggleSchool(cls.id)"
            class="w-full flex items-center gap-2 text-left"
            :class="collapsedSchools.has(cls.id) ? '' : 'mb-4'">
            <span class="material-icons-round text-base" style="color:var(--color-primary)">school</span>
            <span class="font-bold text-sm" style="color:var(--color-text)">{{ cls.name }}</span>
            <span class="text-xs ml-1" style="color:var(--color-text-muted)">#{{ cls.schoolNo }}</span>
            <span class="text-xs ml-2" style="color:var(--color-text-muted)">
              {{ cls.teachers?.length ?? 0 }} öğretmen · {{ cls.students?.length ?? 0 }} öğrenci
            </span>
            <span class="material-icons-round ml-auto text-base transition-transform"
              :style="{ transform: collapsedSchools.has(cls.id) ? 'rotate(-90deg)' : 'rotate(0deg)', color: 'var(--color-text-muted)' }">
              expand_more
            </span>
          </button>

          <div v-show="!collapsedSchools.has(cls.id)">

          <!-- Teachers row -->
          <div class="mb-5">
            <p class="text-xs font-bold uppercase tracking-wider mb-2" style="color:var(--color-text-muted)">
              {{ $t('nav.teachers') }}
              <span class="ml-2 px-1.5 py-0.5 rounded-full" style="background:var(--color-surface-alt)">
                {{ cls.teachers?.length ?? 0 }}
              </span>
            </p>
            <div v-if="filteredTeachers(cls.teachers)?.length" class="grid grid-cols-4 gap-x-4 gap-y-1">
              <NuxtLink v-for="teacher in filteredTeachers(cls.teachers)" :key="teacher.id"
                :to="`/admin/teachers/${teacher.id}/edit`"
                class="flex items-center gap-1.5 py-1 text-xs border-b hover:opacity-70 transition-opacity"
                style="border-color:var(--color-border)">
                <span class="material-icons-round shrink-0" style="font-size:13px;color:var(--color-primary)">person</span>
                <span class="truncate font-medium" style="color:var(--color-primary)">{{ teacher.surname }}, {{ teacher.name }}</span>
                <span class="shrink-0 ml-auto" style="color:var(--color-text-muted)">#{{ teacher.teacherNo }}</span>
              </NuxtLink>
            </div>
            <p v-else class="text-xs" style="color:var(--color-text-muted)">{{ $t('assoc.noTeachers') }}</p>
          </div>

          <!-- Students row — alphabetisch gruppiert -->
          <div>
            <p class="text-xs font-bold uppercase tracking-wider mb-3" style="color:var(--color-text-muted)">
              {{ $t('nav.students') }}
              <span class="ml-2 px-1.5 py-0.5 rounded-full" style="background:var(--color-surface-alt)">
                {{ filteredStudents(cls.students).length }}
                <span v-if="studentFilter" class="opacity-60">/ {{ cls.students?.length ?? 0 }}</span>
              </span>
            </p>
            <div v-if="filteredStudents(cls.students).length">
              <div v-for="group in studentGroups(filteredStudents(cls.students))" :key="group.letter" class="mb-3">
                <!-- Buchstaben-Header -->
                <div class="text-xs font-bold px-2 py-0.5 rounded mb-1 inline-block"
                  style="background:var(--color-primary-subtle);color:var(--color-primary)">
                  {{ group.letter }}
                </div>
                <div class="grid grid-cols-4 gap-x-4 gap-y-0">
                  <NuxtLink v-for="student in group.students" :key="student.id"
                    :to="`/admin/students/${student.id}/edit`"
                    class="flex items-center gap-1 py-1 text-xs border-b hover:opacity-70 transition-opacity"
                    style="border-color:var(--color-border)">
                    <span class="truncate" style="color:var(--color-primary)">{{ student.surname }}, {{ student.name }}</span>
                    <span class="shrink-0 ml-auto" style="color:var(--color-text-muted)">#{{ student.studentNo }}</span>
                  </NuxtLink>
                </div>
              </div>
            </div>
            <p v-else class="text-xs" style="color:var(--color-text-muted)">{{ $t('assoc.noStudents') }}</p>
          </div>
          </div><!-- end collapsible -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
const { data: assocData, refresh } = await useFetch('/api/associations')
const { data: overview, refresh: refreshOverview } = await useFetch('/api/associations/overview')
const [{ data: moduleList }, { data: goalList }, { data: sessionList }, { data: disciplineList }] = await Promise.all([
  useFetch('/api/modules'), useFetch('/api/goals'), useFetch('/api/sessions'), useFetch('/api/disciplines'),
])

const form = reactive({ type: 'moduleGoal', a: '' as number | '', b: '' as number | '' })
const error = ref('')

type AssocType = 'moduleGoal' | 'sessionModule' | 'disciplineSession'

const { t } = useI18n()
const typeConfig: Record<AssocType, { labelA: string; labelB: string; optA: any; optB: any; labelFn: (r: any) => string; aId: (r: any) => number; bId: (r: any) => number; aName: (r: any) => string; bName: (r: any) => string }> = {
  moduleGoal:        { labelA: t('nav.modules'),     labelB: t('nav.goals'),    optA: moduleList,     optB: goalList,    labelFn: r => `${r.moduleName} → ${r.goalName}`,       aId: r => r.moduleId,     bId: r => r.goalId,    aName: r => r.moduleName,     bName: r => r.goalName },
  sessionModule:     { labelA: t('nav.sessions'),    labelB: t('nav.modules'),  optA: sessionList,    optB: moduleList,  labelFn: r => `${r.sessionName} → ${r.moduleName}`,    aId: r => r.sessionId,    bId: r => r.moduleId,  aName: r => r.sessionName,    bName: r => r.moduleName },
  disciplineSession: { labelA: t('nav.disciplines'), labelB: t('nav.sessions'), optA: disciplineList, optB: sessionList, labelFn: r => `${r.disciplineName} → ${r.sessionName}`, aId: r => r.disciplineId, bId: r => r.sessionId, aName: r => r.disciplineName, bName: r => r.sessionName },
}

const labelA = computed(() => typeConfig[form.type as AssocType]?.labelA ?? '')
const labelB = computed(() => typeConfig[form.type as AssocType]?.labelB ?? '')

const optionsA = computed(() => {
  const raw = typeConfig[form.type as AssocType]?.optA?.value ?? []
  return raw.map((r: any) => ({ id: r.id, label: r.name ?? `${r.name} ${r.surname}` }))
})
const optionsB = computed(() => {
  const raw = typeConfig[form.type as AssocType]?.optB?.value ?? []
  return raw.map((r: any) => ({ id: r.id, label: r.name ?? `${r.name} ${r.surname}` }))
})

const sections = computed(() =>
  (Object.keys(typeConfig) as AssocType[]).map(key => ({
    key, type: key,
    label: typeConfig[key].labelFn,
    aId: typeConfig[key].aId,
    bId: typeConfig[key].bId,
    aName: typeConfig[key].aName,
    bName: typeConfig[key].bName,
  }))
)

function grouped(section: { key: string; aId: (r: any) => number; aName: (r: any) => string; bId: (r: any) => number; bName: (r: any) => string }) {
  const rows = (assocData.value as any)?.[section.key] ?? []
  const map = new Map<number, { aId: number; aName: string; rows: any[] }>()
  for (const row of rows) {
    const id = section.aId(row)
    if (!map.has(id)) map.set(id, { aId: id, aName: section.aName(row), rows: [] })
    map.get(id)!.rows.push(row)
  }
  return [...map.values()].sort((a, b) => a.aName.localeCompare(b.aName, 'tr'))
}

async function add() {
  error.value = ''
  try {
    await $fetch('/api/associations', { method: 'POST', body: { type: form.type, a: form.a, b: form.b } })
    form.a = ''; form.b = ''
    refresh()
    refreshOverview()
  } catch (e: any) { error.value = e?.data?.statusMessage ?? 'Fehler' }
}

async function remove(type: string, a: number, b: number) {
  await $fetch('/api/associations', { method: 'DELETE', body: { type, a, b } })
  refresh()
  refreshOverview()
}

const collapsedSections = ref(new Set<string>())
function toggleSection(key: string) {
  if (collapsedSections.value.has(key)) collapsedSections.value.delete(key)
  else collapsedSections.value.add(key)
  collapsedSections.value = new Set(collapsedSections.value)
}

const teacherFilter = ref('')
const studentFilter = ref('')
const collapsedSchools = ref(new Set<number>())

function toggleSchool(id: number) {
  if (collapsedSchools.value.has(id)) collapsedSchools.value.delete(id)
  else collapsedSchools.value.add(id)
  collapsedSchools.value = new Set(collapsedSchools.value)
}

function filteredTeachers(teachers: any[]) {
  if (!teacherFilter.value) return teachers ?? []
  const q = teacherFilter.value.toLocaleLowerCase('tr')
  return (teachers ?? []).filter(t =>
    `${t.surname} ${t.name}`.toLocaleLowerCase('tr').includes(q) ||
    String(t.teacherNo).includes(q)
  )
}

function filteredStudents(students: any[]) {
  if (!studentFilter.value) return students ?? []
  const q = studentFilter.value.toLocaleLowerCase('tr')
  return (students ?? []).filter(s =>
    `${s.surname} ${s.name}`.toLocaleLowerCase('tr').includes(q) ||
    String(s.studentNo).includes(q)
  )
}

function studentGroups(students: any[]) {
  const map = new Map<string, any[]>()
  for (const s of students) {
    const letter = s.surname?.[0]?.toLocaleUpperCase('tr') ?? '?'
    if (!map.has(letter)) map.set(letter, [])
    map.get(letter)!.push(s)
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b, 'tr'))
    .map(([letter, students]) => ({ letter, students }))
}
</script>
