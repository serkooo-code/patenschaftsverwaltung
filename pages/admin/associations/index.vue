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
      <!-- Section header + filter -->
      <div class="flex items-center gap-3 px-5 py-3" style="border-bottom:1px solid var(--color-border)">
        <button type="button"
          class="flex items-center gap-2 text-left hover:opacity-80 transition-opacity flex-1 min-w-0"
          @click="toggleSection(section.key)">
          <h3 class="font-semibold" style="color:var(--color-text)">{{ $t(`assoc.${section.key}`) }}</h3>
          <span class="text-xs opacity-50">({{ (assocData as any)?.[section.key]?.length ?? 0 }})</span>
          <span class="material-icons-round ml-1 transition-transform shrink-0"
            :style="{ transform: collapsedSections.has(section.key) ? 'rotate(-90deg)' : 'rotate(0deg)', color: 'var(--color-text-muted)' }">
            expand_more
          </span>
        </button>
        <div v-if="!collapsedSections.has(section.key)"
          class="flex items-center gap-1.5 px-2 py-1 rounded-lg shrink-0"
          style="border:1px solid var(--color-border);background:var(--color-surface)">
          <span class="material-icons-round text-sm" style="color:var(--color-text-muted)">search</span>
          <input v-model="sectionFilters[section.key]" type="text" :placeholder="$t('common.search')"
            class="bg-transparent text-xs outline-none w-32" style="color:var(--color-text)" />
          <button v-if="sectionFilters[section.key]" @click="sectionFilters[section.key] = ''" type="button">
            <span class="material-icons-round text-sm" style="color:var(--color-text-muted)">close</span>
          </button>
        </div>
      </div>

      <div v-show="!collapsedSections.has(section.key)" class="px-5 pb-5 pt-3">
        <div v-if="!filteredGrouped(section).length" class="text-sm" style="color:var(--color-text-muted)">
          {{ $t('common.noData') }}
        </div>
        <div v-else class="flex flex-col gap-2">
          <div v-for="group in filteredGrouped(section)" :key="group.aId"
            class="p-3 rounded-lg" style="background:var(--color-surface-alt)">

            <!-- Group header: name + Save/Reset buttons -->
            <div class="flex items-center justify-between mb-2">
              <p class="text-xs font-bold uppercase tracking-wide" style="color:var(--color-text-muted)">
                {{ group.aName }}
                <span class="ml-1 font-normal normal-case tracking-normal opacity-60">({{ group.rows.length }})</span>
              </p>
              <div v-if="isDirty(section.key, group.aId)" class="flex items-center gap-1.5">
                <button type="button" @click="resetGroup(section.key, group.aId)"
                  class="text-xs px-2.5 py-1 rounded-lg font-medium hover:opacity-80 transition-opacity"
                  style="background:var(--color-surface);border:1px solid var(--color-border);color:var(--color-text-muted)">
                  {{ $t('common.cancel') }}
                </button>
                <button type="button" @click="saveGroup(section, group.aId)"
                  class="text-xs px-2.5 py-1 rounded-lg font-medium hover:opacity-80 transition-opacity"
                  style="background:var(--color-success);color:#fff">
                  {{ $t('common.save') }}
                </button>
              </div>
            </div>

            <div class="flex flex-wrap gap-1.5 items-center">
              <!-- Existing tags (not marked for removal) -->
              <span v-for="row in nonRemovedRows(section, group)" :key="section.bId(row)"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                style="background:var(--color-surface);border:1px solid var(--color-border);color:var(--color-text)">
                {{ section.bName(row) }}
                <button @click="markRemove(section, group.aId, row)" class="ml-0.5 hover:opacity-70">
                  <span class="material-icons-round" style="font-size:12px">close</span>
                </button>
              </span>

              <!-- Pending removal tags (strikethrough, red) -->
              <span v-for="row in pendingRemovedRows(section, group)" :key="`rm-${section.bId(row)}`"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs line-through"
                style="background:color-mix(in srgb,var(--color-danger) 12%,transparent);border:1px solid var(--color-danger);color:var(--color-danger)">
                {{ section.bName(row) }}
                <button @click="undoRemove(section.key, group.aId, section.bId(row))"
                  class="ml-0.5 hover:opacity-70" :title="$t('common.cancel')">
                  <span class="material-icons-round" style="font-size:12px">undo</span>
                </button>
              </span>

              <!-- Pending add tags (green) -->
              <span v-for="item in getPendingAdds(section.key, group.aId)" :key="`add-${item.bId}`"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                style="background:color-mix(in srgb,var(--color-success) 12%,transparent);border:1px solid var(--color-success);color:var(--color-success)">
                {{ item.bName }}
                <button @click="undoAdd(section.key, group.aId, item.bId)" class="ml-0.5 hover:opacity-70">
                  <span class="material-icons-round" style="font-size:12px">close</span>
                </button>
              </span>

              <!-- Inline add button / dropdown -->
              <div class="relative inline-block">
                <button v-if="!isInlineOpen(section.key, group.aId)"
                  type="button"
                  @click="openInline(section.key, group.aId)"
                  class="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-medium hover:opacity-80 transition-opacity"
                  style="background:var(--color-primary-subtle);color:var(--color-primary);border:1px dashed var(--color-primary)">
                  <span class="material-icons-round" style="font-size:12px">add</span>
                  {{ $t('common.add') }}
                </button>
                <div v-else class="inline-flex items-center gap-1 rounded-full px-2 py-0.5"
                  style="background:var(--color-surface);border:1px solid var(--color-primary)">
                  <select
                    v-model="inlineAddVal[`${section.key}-${group.aId}`]"
                    class="bg-transparent text-xs outline-none max-w-44"
                    style="color:var(--color-text)"
                    @change="queueInlineAdd(section, group)">
                    <option value="">— {{ $t('common.search') }} —</option>
                    <option v-for="opt in availableOptions(section, group)" :key="opt.id" :value="opt.id">
                      {{ opt.label }}
                    </option>
                  </select>
                  <button type="button" @click="closeInline(section.key, group.aId)" class="hover:opacity-70">
                    <span class="material-icons-round" style="font-size:12px;color:var(--color-text-muted)">close</span>
                  </button>
                </div>
              </div>
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
            <div class="mb-5">
              <p class="text-xs font-bold uppercase tracking-wider mb-2" style="color:var(--color-text-muted)">
                {{ $t('nav.teachers') }}
                <span class="ml-2 px-1.5 py-0.5 rounded-full" style="background:var(--color-surface-alt)">{{ cls.teachers?.length ?? 0 }}</span>
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
                  <div class="text-xs font-bold px-2 py-0.5 rounded mb-1 inline-block"
                    style="background:var(--color-primary-subtle);color:var(--color-primary)">{{ group.letter }}</div>
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
          </div>
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
const typeConfig: Record<AssocType, any> = {
  moduleGoal:        { labelA: t('nav.modules'),     labelB: t('nav.goals'),    optA: moduleList,     optB: goalList,    aId: (r: any) => r.moduleId,     bId: (r: any) => r.goalId,    aName: (r: any) => r.moduleName,     bName: (r: any) => r.goalName },
  sessionModule:     { labelA: t('nav.sessions'),    labelB: t('nav.modules'),  optA: sessionList,    optB: moduleList,  aId: (r: any) => r.sessionId,    bId: (r: any) => r.moduleId,  aName: (r: any) => r.sessionName,    bName: (r: any) => r.moduleName },
  disciplineSession: { labelA: t('nav.disciplines'), labelB: t('nav.sessions'), optA: disciplineList, optB: sessionList, aId: (r: any) => r.disciplineId, bId: (r: any) => r.sessionId, aName: (r: any) => r.disciplineName, bName: (r: any) => r.sessionName },
}

const labelA = computed(() => typeConfig[form.type as AssocType]?.labelA ?? '')
const labelB = computed(() => typeConfig[form.type as AssocType]?.labelB ?? '')
const optionsA = computed(() => (typeConfig[form.type as AssocType]?.optA?.value ?? []).map((r: any) => ({ id: r.id, label: r.name })))
const optionsB = computed(() => (typeConfig[form.type as AssocType]?.optB?.value ?? []).map((r: any) => ({ id: r.id, label: r.name })))

const sections = computed(() =>
  (Object.keys(typeConfig) as AssocType[]).map(key => ({ key, type: key, ...typeConfig[key] }))
)

// ── Section filters ────────────────────────────────────────────────────────────
const sectionFilters = reactive<Record<string, string>>({ moduleGoal: '', sessionModule: '', disciplineSession: '' })

function grouped(section: any) {
  const rows = (assocData.value as any)?.[section.key] ?? []
  const map = new Map<number, { aId: number; aName: string; rows: any[] }>()
  for (const row of rows) {
    const id = section.aId(row)
    if (!map.has(id)) map.set(id, { aId: id, aName: section.aName(row), rows: [] })
    map.get(id)!.rows.push(row)
  }
  return [...map.values()].sort((a, b) => a.aName.localeCompare(b.aName, 'tr'))
}

function filteredGrouped(section: any) {
  const q = sectionFilters[section.key]?.toLocaleLowerCase('tr') ?? ''
  const groups = grouped(section)
  return q ? groups.filter(g => g.aName.toLocaleLowerCase('tr').includes(q)) : groups
}

// ── Pending changes per group ──────────────────────────────────────────────────
interface GroupPending { adds: { bId: number; bName: string }[]; removes: Set<number> }
const pending = ref(new Map<string, GroupPending>())

function gkey(sectionKey: string, aId: number) { return `${sectionKey}-${aId}` }

function getOrCreate(k: string): GroupPending {
  if (!pending.value.has(k)) pending.value.set(k, { adds: [], removes: new Set() })
  return pending.value.get(k)!
}

function isDirty(sectionKey: string, aId: number) {
  const p = pending.value.get(gkey(sectionKey, aId))
  return !!(p && (p.adds.length > 0 || p.removes.size > 0))
}

function nonRemovedRows(section: any, group: any) {
  const removes = pending.value.get(gkey(section.key, group.aId))?.removes ?? new Set()
  return group.rows.filter((r: any) => !removes.has(section.bId(r)))
}

function pendingRemovedRows(section: any, group: any) {
  const removes = pending.value.get(gkey(section.key, group.aId))?.removes ?? new Set()
  return group.rows.filter((r: any) => removes.has(section.bId(r)))
}

function getPendingAdds(sectionKey: string, aId: number) {
  return pending.value.get(gkey(sectionKey, aId))?.adds ?? []
}

function markRemove(section: any, aId: number, row: any) {
  const p = getOrCreate(gkey(section.key, aId))
  p.removes.add(section.bId(row))
  pending.value = new Map(pending.value)
}

function undoRemove(sectionKey: string, aId: number, bId: number) {
  pending.value.get(gkey(sectionKey, aId))?.removes.delete(bId)
  pending.value = new Map(pending.value)
}

function undoAdd(sectionKey: string, aId: number, bId: number) {
  const p = pending.value.get(gkey(sectionKey, aId))
  if (p) { p.adds = p.adds.filter(a => a.bId !== bId); pending.value = new Map(pending.value) }
}

function resetGroup(sectionKey: string, aId: number) {
  pending.value.delete(gkey(sectionKey, aId))
  pending.value = new Map(pending.value)
  closeInline(sectionKey, aId)
}

async function saveGroup(section: any, aId: number) {
  const k = gkey(section.key, aId)
  const p = pending.value.get(k)
  if (!p) return
  error.value = ''
  try {
    for (const bId of p.removes)
      await $fetch('/api/associations', { method: 'DELETE', body: { type: section.type, a: aId, b: bId } })
    for (const { bId } of p.adds)
      await $fetch('/api/associations', { method: 'POST', body: { type: section.type, a: aId, b: bId } })
    pending.value.delete(k)
    pending.value = new Map(pending.value)
    refresh(); refreshOverview()
  } catch (e: any) { error.value = e?.data?.statusMessage ?? 'Fehler' }
}

function availableOptions(section: any, group: any) {
  const k = gkey(section.key, group.aId)
  const removes = pending.value.get(k)?.removes ?? new Set()
  const addedIds = new Set((pending.value.get(k)?.adds ?? []).map((a: any) => a.bId))
  const existingIds = new Set(group.rows.filter((r: any) => !removes.has(section.bId(r))).map((r: any) => section.bId(r)))
  return ((section.optB?.value ?? []) as any[])
    .filter((o: any) => !existingIds.has(o.id) && !addedIds.has(o.id))
    .map((o: any) => ({ id: o.id, label: o.name }))
    .sort((a, b) => a.label.localeCompare(b.label, 'tr'))
}

// ── Inline add (now queues instead of saving immediately) ──────────────────────
const inlineOpen = ref(new Set<string>())
const inlineAddVal = reactive<Record<string, number | ''>>({})

function isInlineOpen(sectionKey: string, aId: number) { return inlineOpen.value.has(gkey(sectionKey, aId)) }
function openInline(sectionKey: string, aId: number) {
  const k = gkey(sectionKey, aId)
  inlineAddVal[k] = ''
  inlineOpen.value.add(k); inlineOpen.value = new Set(inlineOpen.value)
}
function closeInline(sectionKey: string, aId: number) {
  inlineOpen.value.delete(gkey(sectionKey, aId)); inlineOpen.value = new Set(inlineOpen.value)
}

function queueInlineAdd(section: any, group: any) {
  const k = gkey(section.key, group.aId)
  const bId = Number(inlineAddVal[k])
  if (!bId) return
  const bName = (section.optB?.value ?? []).find((o: any) => o.id === bId)?.name ?? ''
  const p = getOrCreate(k)
  p.adds.push({ bId, bName })
  pending.value = new Map(pending.value)
  closeInline(section.key, group.aId)
}

// ── Global add form ────────────────────────────────────────────────────────────
async function add() {
  error.value = ''
  try {
    await $fetch('/api/associations', { method: 'POST', body: { type: form.type, a: form.a, b: form.b } })
    form.a = ''; form.b = ''
    refresh(); refreshOverview()
  } catch (e: any) { error.value = e?.data?.statusMessage ?? 'Fehler' }
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
  return (teachers ?? []).filter((t: any) =>
    `${t.surname} ${t.name}`.toLocaleLowerCase('tr').includes(q) || String(t.teacherNo).includes(q)
  )
}

function filteredStudents(students: any[]) {
  if (!studentFilter.value) return students ?? []
  const q = studentFilter.value.toLocaleLowerCase('tr')
  return (students ?? []).filter((s: any) =>
    `${s.surname} ${s.name}`.toLocaleLowerCase('tr').includes(q) || String(s.studentNo).includes(q)
  )
}

function studentGroups(students: any[]) {
  const map = new Map<string, any[]>()
  for (const s of students) {
    const letter = s.surname?.[0]?.toLocaleUpperCase('tr') ?? '?'
    if (!map.has(letter)) map.set(letter, [])
    map.get(letter)!.push(s)
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b, 'tr')).map(([letter, students]) => ({ letter, students }))
}
</script>
