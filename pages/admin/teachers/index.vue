<template>
  <div>
    <div class="flex justify-end mb-6">
      <NuxtLink to="/admin/teachers/new" class="btn-primary flex items-center gap-2">
        <span class="material-icons-round text-base">add</span>{{ $t('teacher.new') }}
      </NuxtLink>
    </div>
    <div class="card p-0 overflow-hidden">
      <table class="data-table">
        <thead>
          <tr>
            <th>{{ $t('teacher.name') }}</th>
            <th>{{ $t('teacher.no') }}</th>
            <th>{{ $t('nav.classes') }}</th>
            <th>{{ $t('nav.disciplines') }}</th>
            <th>{{ $t('nav.students') }}</th>
            <th class="w-24" style="border-right:none"></th>
          </tr>
          <!-- Filter row -->
          <tr style="background:var(--color-surface-alt)">
            <th class="px-3 py-2 font-normal">
              <input v-model="filterName" type="text" :placeholder="$t('common.search')"
                class="w-full text-xs rounded px-2 py-1 border"
                style="background:var(--color-surface);border-color:var(--color-border);color:var(--color-text)" />
            </th>
            <th class="px-3 py-2 font-normal">
              <input v-model="filterNo" type="text" :placeholder="$t('common.search')"
                class="w-full text-xs rounded px-2 py-1 border"
                style="background:var(--color-surface);border-color:var(--color-border);color:var(--color-text)" />
            </th>
            <th class="px-3 py-2 font-normal">
              <select v-model="filterSchool"
                class="w-full text-xs rounded px-2 py-1 border"
                style="background:var(--color-surface);border-color:var(--color-border);color:var(--color-text)">
                <option value="">{{ $t('common.all') }}</option>
                <option v-for="s in allSchools" :key="s" :value="s">{{ s }}</option>
              </select>
            </th>
            <th class="px-3 py-2 font-normal">
              <select v-model="filterDiscipline"
                class="w-full text-xs rounded px-2 py-1 border"
                style="background:var(--color-surface);border-color:var(--color-border);color:var(--color-text)">
                <option value="">{{ $t('common.all') }}</option>
                <option v-for="d in allDisciplines" :key="d" :value="d">{{ d }}</option>
              </select>
            </th>
            <th class="px-3 py-2 font-normal" colspan="2" style="border-right:none">
              <button v-if="isFiltered" @click="clearFilters"
                class="flex items-center gap-1 text-xs px-2 py-1 rounded"
                style="color:var(--color-danger)">
                <span class="material-icons-round" style="font-size:14px">filter_alt_off</span>
                {{ $t('common.filterClear') }}
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!filteredData.length">
            <td colspan="6" class="text-center py-8" style="color:var(--color-text-muted);border-right:none">{{ $t('common.noData') }}</td>
          </tr>
          <template v-for="t in filteredData" :key="t.id">
            <tr>
              <td class="font-medium">{{ t.name }} {{ t.surname }}</td>
              <td style="color:var(--color-text-muted)">{{ t.teacherNo }}</td>
              <td>
                <div class="flex flex-wrap gap-1">
                  <span v-for="s in (t as any).schools" :key="s.id"
                    class="text-xs px-2 py-0.5 rounded-full font-medium"
                    style="background:var(--color-primary-subtle);color:var(--color-primary)">
                    {{ s.name }}
                  </span>
                  <span v-if="!(t as any).schools?.length" class="text-xs" style="color:var(--color-text-muted)">—</span>
                </div>
              </td>
              <td>
                <div class="flex flex-wrap gap-1">
                  <span v-for="d in (t as any).disciplines" :key="d.id"
                    class="text-xs px-2 py-0.5 rounded-full font-medium"
                    style="background:var(--color-surface-alt);color:var(--color-text)">
                    {{ d.name }}
                  </span>
                  <span v-if="!(t as any).disciplines?.length" class="text-xs" style="color:var(--color-text-muted)">—</span>
                </div>
              </td>
              <td>
                <button v-if="(t as any).students?.length" @click="toggleStudents(t.id)"
                  class="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium hover:opacity-80 transition-opacity"
                  style="background:var(--color-primary-subtle);color:var(--color-primary)">
                  <span class="material-icons-round" style="font-size:14px">
                    {{ expandedTeachers.has(t.id) ? 'expand_less' : 'expand_more' }}
                  </span>
                  {{ (t as any).students.length }} {{ $t('nav.students') }}
                </button>
                <span v-else class="text-xs" style="color:var(--color-text-muted)">—</span>
              </td>
              <td class="text-center" style="border-right:none">
                <div class="flex items-center justify-center gap-1">
                  <NuxtLink :to="`/admin/teachers/${t.id}/edit`" class="p-1 rounded hover:bg-[var(--color-surface-alt)]">
                    <span class="material-icons-round text-base" style="color:var(--color-text-muted)">edit</span>
                  </NuxtLink>
                  <button @click="remove(t.id)" class="p-1 rounded hover:bg-[var(--color-surface-alt)]">
                    <span class="material-icons-round text-base" style="color:var(--color-danger)">delete</span>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="expandedTeachers.has(t.id)">
              <td colspan="6" class="p-4" style="background:var(--color-surface-alt);border-right:none">
                <div class="grid gap-1.5" style="grid-template-columns:repeat(auto-fill,minmax(220px,1fr))">
                  <div v-for="s in (t as any).students" :key="s.id"
                    class="flex items-center justify-between gap-2 px-3 py-2 rounded-lg"
                    style="background:var(--color-surface);border:1px solid var(--color-border)">
                    <div class="min-w-0">
                      <p class="text-sm font-medium truncate" style="color:var(--color-text)">{{ s.name }} {{ s.surname }}</p>
                      <p class="text-xs" style="color:var(--color-text-muted)">No: {{ s.studentNo }}</p>
                    </div>
                    <button @click.stop="removeStudent(t.id, s.id)"
                      class="shrink-0 p-0.5 rounded transition-colors hover:bg-red-50"
                      title="Öğrenciyi kaldır">
                      <span class="material-icons-round text-base" style="color:var(--color-danger)">close</span>
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
const { data, refresh } = await useFetch('/api/teachers')

// ── Filters (useState → bleiben beim Zurücknavigieren erhalten) ───────────────
const filters = useState('teacher-filters', () => ({ name: '', no: '', school: '', discipline: '' }))
const filterName = computed({ get: () => filters.value.name, set: v => { filters.value.name = v } })
const filterNo = computed({ get: () => filters.value.no, set: v => { filters.value.no = v } })
const filterSchool = computed({ get: () => filters.value.school, set: v => { filters.value.school = v } })
const filterDiscipline = computed({ get: () => filters.value.discipline, set: v => { filters.value.discipline = v } })

const isFiltered = computed(() =>
  filters.value.name || filters.value.no || filters.value.school || filters.value.discipline
)

function clearFilters() {
  filters.value = { name: '', no: '', school: '', discipline: '' }
}

const allSchools = computed(() => {
  const set = new Set<string>()
  for (const t of (data.value as any[]) ?? [])
    for (const s of t.schools ?? []) set.add(s.name)
  return [...set].sort((a, b) => a.localeCompare(b, 'tr'))
})

const allDisciplines = computed(() => {
  const set = new Set<string>()
  for (const t of (data.value as any[]) ?? [])
    for (const d of t.disciplines ?? []) set.add(d.name)
  return [...set].sort((a, b) => a.localeCompare(b, 'tr'))
})

const filteredData = computed(() => {
  const name = filterName.value.toLocaleLowerCase('tr')
  const no = filterNo.value.toLocaleLowerCase('tr')
  return ((data.value as any[]) ?? []).filter(t => {
    if (name && !`${t.name} ${t.surname}`.toLocaleLowerCase('tr').includes(name)) return false
    if (no && !t.teacherNo?.toLocaleLowerCase('tr').includes(no)) return false
    if (filterSchool.value && !t.schools?.some((s: any) => s.name === filterSchool.value)) return false
    if (filterDiscipline.value && !t.disciplines?.some((d: any) => d.name === filterDiscipline.value)) return false
    return true
  })
})

// ── Expand students ───────────────────────────────────────────────────────────
const expandedTeachers = ref(new Set<number>())
function toggleStudents(id: number) {
  if (expandedTeachers.value.has(id)) expandedTeachers.value.delete(id)
  else expandedTeachers.value.add(id)
  expandedTeachers.value = new Set(expandedTeachers.value)
}

const { t } = useI18n()
const { confirm: askConfirm } = useConfirm()
async function removeStudent(teacherId: number, studentId: number) {
  if (!await askConfirm(t('common.deleteConfirm'))) return
  await $fetch('/api/student-teachers', { method: 'DELETE', body: { teacherId, studentId } })
  refresh()
}

async function remove(id: number) {
  if (!await askConfirm(t('common.deleteConfirm'))) return
  await $fetch(`/api/teachers/${id}`, { method: 'DELETE' })
  refresh()
}
</script>
