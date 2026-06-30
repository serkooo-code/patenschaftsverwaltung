<template>
  <div v-if="teacher" class="flex flex-col gap-6 max-w-2xl">

    <!-- Stammdaten + Schulen + Branşlar -->
    <div class="card">
      <form id="teacher-form" @submit.prevent="submit" class="flex flex-col gap-4">
        <div>
          <label class="form-label">{{ $t('teacher.firstName') }} *</label>
          <input v-model="form.name" class="form-input" required />
        </div>
        <div>
          <label class="form-label">{{ $t('teacher.lastName') }} *</label>
          <input v-model="form.surname" class="form-input" required />
        </div>
        <div>
          <label class="form-label">{{ $t('teacher.no') }}</label>
          <input v-model="form.teacherNo" class="form-input" required />
        </div>

        <!-- Schulzuordnung -->
        <div>
          <label class="form-label">{{ $t('nav.classes') }}</label>
          <div class="flex flex-col gap-1.5 mt-1 max-h-36 overflow-y-auto p-2 rounded-lg"
            style="border:1px solid var(--color-border)">
            <label v-if="!allClasses?.length" class="text-sm" style="color:var(--color-text-muted)">
              {{ $t('common.noData') }}
            </label>
            <label v-for="cls in allClasses" :key="cls.id"
              class="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-[var(--color-surface-alt)]">
              <input type="checkbox" :value="cls.id" v-model="form.classIds" class="rounded" />
              <span class="text-sm" style="color:var(--color-text)">{{ cls.name }}</span>
              <span class="text-xs" style="color:var(--color-text-muted)">#{{ cls.schoolNo }}</span>
            </label>
          </div>
        </div>

        <!-- Branş-Zuordnung -->
        <div>
          <label class="form-label">{{ $t('nav.disciplines') }}</label>
          <div class="flex flex-col gap-1.5 mt-1 max-h-48 overflow-y-auto p-2 rounded-lg"
            style="border:1px solid var(--color-border)">
            <label v-if="!allDisciplines?.length" class="text-sm" style="color:var(--color-text-muted)">
              {{ $t('common.noData') }}
            </label>
            <label v-for="disc in allDisciplines" :key="(disc as any).id"
              class="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-[var(--color-surface-alt)]">
              <input type="checkbox" :value="(disc as any).id" v-model="form.disciplineIds" class="rounded" />
              <span class="text-sm" style="color:var(--color-text)">{{ (disc as any).name }}</span>
            </label>
          </div>
        </div>

        <p v-if="error" class="text-sm" style="color:var(--color-danger)">{{ error }}</p>
      </form>
    </div>

    <!-- Schüler-Zuordnung -->
    <div class="card">
      <label class="form-label">{{ $t('nav.students') }}</label>

      <!-- Suche + Hinzufügen -->
      <div class="relative mt-1 mb-3">
        <div class="flex items-center gap-2 px-3 py-2 rounded-lg"
          style="border:1px solid var(--color-border);background:var(--color-surface)">
          <span class="material-icons-round text-base shrink-0" style="color:var(--color-text-muted)">search</span>
          <input
            v-model="studentSearch"
            type="text"
            :placeholder="$t('common.search')"
            class="flex-1 bg-transparent text-sm outline-none"
            style="color:var(--color-text)"
            @focus="showDropdown = true"
            @blur="hideDropdownSoon"
          />
        </div>
        <div v-if="showDropdown && filteredCandidates.length"
          class="absolute z-20 w-full mt-1 rounded-lg shadow-lg overflow-hidden max-h-56 overflow-y-auto"
          style="background:var(--color-surface);border:1px solid var(--color-border)">
          <button
            v-for="s in filteredCandidates" :key="s.id"
            type="button"
            @mousedown.prevent="addStudent(s)"
            class="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-[var(--color-surface-alt)] transition-colors">
            <span class="material-icons-round text-base shrink-0" style="color:var(--color-text-muted)">person_add</span>
            <span class="text-sm font-medium flex-1" style="color:var(--color-text)">{{ s.name }} {{ s.surname }}</span>
            <span class="text-xs shrink-0" style="color:var(--color-text-muted)">No: {{ s.studentNo }}</span>
          </button>
        </div>
        <p v-else-if="showDropdown && studentSearch && !filteredCandidates.length"
          class="absolute z-20 w-full mt-1 px-3 py-2 text-sm rounded-lg"
          style="background:var(--color-surface);border:1px solid var(--color-border);color:var(--color-text-muted)">
          {{ $t('common.noData') }}
        </p>
      </div>

      <!-- Zugeordnete Schüler: 2-Spalten-Grid, vertikal scrollbar -->
      <div v-if="assignedStudents.length"
        class="overflow-y-auto overflow-x-hidden rounded-lg p-1"
        style="max-height:480px;border:1px solid var(--color-border)">
        <div class="grid gap-1" style="grid-template-columns:1fr 1fr">
          <div v-for="s in assignedStudents" :key="s.id"
            class="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style="background:var(--color-surface)">
            <span class="flex-1 text-sm font-medium truncate" style="color:var(--color-text)">{{ s.name }} {{ s.surname }}</span>
            <span class="text-xs shrink-0" style="color:var(--color-text-muted)">{{ s.studentNo }}</span>
            <button type="button" @click="removeStudent(s.id)"
              class="shrink-0 p-0.5 rounded hover:bg-red-50 transition-colors"
              :title="$t('common.delete')">
              <span class="material-icons-round text-base" style="color:var(--color-danger)">close</span>
            </button>
          </div>
        </div>
      </div>
      <p v-else class="text-sm py-2" style="color:var(--color-text-muted)">{{ $t('common.noData') }}</p>
    </div>

    <!-- Buttons unten -->
    <div class="flex gap-3 pb-6">
      <button type="submit" form="teacher-form" class="btn-primary" :disabled="loading">
        {{ loading ? $t('common.saving') : $t('common.save') }}
      </button>
      <button type="button" class="btn-secondary" @click="cancel">{{ $t('common.cancel') }}</button>
    </div>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
const route = useRoute()
const id = Number(route.params.id)

const [{ data: teacher }, { data: allClasses }, { data: assignedClassIds }, { data: allDisciplines }, { data: assignedDisciplineIds }, { data: allStudents }, { data: teacherData }] = await Promise.all([
  useFetch(`/api/teachers/${id}`),
  useFetch('/api/classes'),
  useFetch(`/api/teachers/${id}/schools`),
  useFetch('/api/disciplines'),
  useFetch(`/api/teachers/${id}/disciplines`),
  useFetch('/api/students'),
  useFetch('/api/teachers'),
])

if (!teacher.value) await navigateTo('/admin/teachers')

const teacherRaw = teacher.value as any
const form = reactive({
  name: teacherRaw?.name ?? '',
  surname: teacherRaw?.surname ?? '',
  teacherNo: teacherRaw?.teacherNo ?? '',
  classIds: [...(assignedClassIds.value as number[] ?? [])],
  disciplineIds: [...(assignedDisciplineIds.value as number[] ?? [])],
})
const loading = ref(false)
const error = ref('')

// ── Schüler-Zuordnung ─────────────────────────────────────────────────────────
const thisTeacher = computed(() => (teacherData.value as any[])?.find((x: any) => x.id === id))
const sortByName = (arr: { name: string; surname: string }[]) =>
  [...arr].sort((a, b) => {
    const c = a.surname.localeCompare(b.surname, 'tr')
    return c !== 0 ? c : a.name.localeCompare(b.name, 'tr')
  })

const assignedStudents = ref<{ id: number; name: string; surname: string; studentNo: string }[]>(
  sortByName(thisTeacher.value?.students ?? []) as any
)

const studentSearch = ref('')
const showDropdown = ref(false)
const assignedIds = computed(() => new Set(assignedStudents.value.map(s => s.id)))

const filteredCandidates = computed(() => {
  const q = studentSearch.value.toLocaleLowerCase('tr')
  if (!q) return []
  return ((allStudents.value as any[]) ?? [])
    .filter((s: any) => !assignedIds.value.has(s.id) &&
      (`${s.name} ${s.surname}`.toLocaleLowerCase('tr').includes(q) || s.studentNo.includes(q)))
    .sort((a: any, b: any) => {
      const c = a.surname.localeCompare(b.surname, 'tr')
      return c !== 0 ? c : a.name.localeCompare(b.name, 'tr')
    })
    .slice(0, 20)
})

function hideDropdownSoon() {
  setTimeout(() => { showDropdown.value = false }, 150)
}

async function addStudent(s: { id: number; name: string; surname: string; studentNo: string }) {
  await $fetch('/api/student-teachers', { method: 'POST', body: { teacherId: id, studentId: s.id } })
  assignedStudents.value = sortByName([...assignedStudents.value, s]) as any
  studentSearch.value = ''
  showDropdown.value = false
}

const { t } = useI18n()
const { confirm: askConfirm } = useConfirm()
async function removeStudent(studentId: number) {
  if (!await askConfirm(t('common.deleteConfirm'))) return
  await $fetch('/api/student-teachers', { method: 'DELETE', body: { teacherId: id, studentId } })
  assignedStudents.value = assignedStudents.value.filter(s => s.id !== studentId)
}

// ── Navigation ────────────────────────────────────────────────────────────────
// Shared filter state so the teachers list restores its filters on back-navigation
const teacherFilters = useState('teacher-filters', () => ({ name: '', no: '', school: '', discipline: '' }))

function cancel() { navigateTo('/admin/teachers') }

async function submit() {
  loading.value = true; error.value = ''
  try {
    await Promise.all([
      $fetch(`/api/teachers/${id}`, { method: 'PUT', body: { name: form.name, surname: form.surname, teacherNo: form.teacherNo } }),
      $fetch(`/api/teachers/${id}/schools`, { method: 'PUT', body: { classIds: form.classIds } }),
      $fetch(`/api/teachers/${id}/disciplines`, { method: 'PUT', body: { disciplineIds: form.disciplineIds } }),
    ])
    await navigateTo('/admin/teachers')
  } catch (e: any) {
    error.value = e?.data?.statusMessage ?? 'Fehler'
  } finally {
    loading.value = false
  }
}
</script>
