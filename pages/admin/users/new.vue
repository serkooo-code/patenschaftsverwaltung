<template>
  <div class="card max-w-md">
    <form @submit.prevent="submit" class="flex flex-col gap-4">
      <div>
        <label class="form-label">{{ $t('user.email') }} *</label>
        <input v-model="form.email" type="email" class="form-input" required />
      </div>
      <div>
        <label class="form-label">{{ $t('auth.password') }} *</label>
        <input v-model="form.password" type="password" class="form-input" required minlength="8" />
      </div>
      <div>
        <label class="form-label">{{ $t('user.role') }}</label>
        <select v-model="form.role" class="form-input">
          <option value="teacher">{{ $t('role.teacher') }}</option>
          <option value="admin">{{ $t('role.admin') }}</option>
        </select>
      </div>

      <!-- Lehrer-Verknüpfung mit Suchfeld -->
      <div v-if="form.role === 'teacher'">
        <label class="form-label">{{ $t('teacher.link') }}</label>

        <!-- Ausgewählter Lehrer oder Suche -->
        <div class="relative">
          <div class="flex items-center gap-2 px-3 py-2 rounded-lg"
            style="border:1px solid var(--color-border);background:var(--color-surface)">
            <span class="material-icons-round text-base shrink-0" style="color:var(--color-text-muted)">search</span>
            <input
              v-model="teacherSearch"
              type="text"
              :placeholder="selectedTeacher ? selectedTeacher : $t('common.search')"
              class="flex-1 bg-transparent text-sm outline-none"
              style="color:var(--color-text)"
              @focus="showTeacherDropdown = true"
              @blur="hideTeacherDropdownSoon"
            />
            <button v-if="form.teacherId" type="button" @click="clearTeacher"
              class="shrink-0 p-0.5 rounded hover:bg-[var(--color-surface-alt)]">
              <span class="material-icons-round text-base" style="color:var(--color-text-muted)">close</span>
            </button>
          </div>

          <!-- Ausgewählter Name als Badge -->
          <div v-if="form.teacherId && !showTeacherDropdown" class="mt-1 px-2">
            <span class="text-sm font-medium" style="color:var(--color-primary)">{{ selectedTeacher }}</span>
          </div>

          <!-- Dropdown -->
          <div v-if="showTeacherDropdown"
            class="absolute z-20 w-full mt-1 rounded-lg shadow-lg overflow-hidden max-h-56 overflow-y-auto"
            style="background:var(--color-surface);border:1px solid var(--color-border)">
            <!-- Kein Lehrer -->
            <button type="button" @mousedown.prevent="selectTeacher(null)"
              class="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-[var(--color-surface-alt)] transition-colors">
              <span class="text-sm" style="color:var(--color-text-muted)">— {{ $t('common.none') }} —</span>
            </button>
            <button
              v-for="t in filteredTeachers" :key="t.id"
              type="button"
              @mousedown.prevent="selectTeacher(t)"
              class="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-[var(--color-surface-alt)] transition-colors">
              <span class="material-icons-round text-base shrink-0" style="color:var(--color-text-muted)">person</span>
              <span class="text-sm font-medium flex-1" style="color:var(--color-text)">{{ t.name }} {{ t.surname }}</span>
            </button>
            <p v-if="teacherSearch && !filteredTeachers.length"
              class="px-3 py-2 text-sm" style="color:var(--color-text-muted)">
              {{ $t('common.noData') }}
            </p>
          </div>
        </div>
      </div>

      <p v-if="error" class="text-sm" style="color:var(--color-danger)">{{ error }}</p>
      <div class="flex gap-3">
        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? $t('common.saving') : $t('common.save') }}
        </button>
        <NuxtLink to="/admin/users" class="btn-secondary">{{ $t('common.cancel') }}</NuxtLink>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
const { data: teachers } = await useFetch('/api/teachers')
const form = reactive({ email: '', password: '', role: 'teacher', teacherId: null as number | null })
const loading = ref(false)
const error = ref('')

const teacherSearch = ref('')
const showTeacherDropdown = ref(false)

const selectedTeacher = computed(() => {
  if (!form.teacherId) return ''
  const t = (teachers.value as any[])?.find((x: any) => x.id === form.teacherId)
  return t ? `${t.name} ${t.surname}` : ''
})

const filteredTeachers = computed(() => {
  const q = teacherSearch.value.toLocaleLowerCase('tr')
  const list = (teachers.value as any[]) ?? []
  const filtered = q
    ? list.filter((t: any) => `${t.name} ${t.surname}`.toLocaleLowerCase('tr').includes(q))
    : list
  return [...filtered].sort((a: any, b: any) => {
    const c = a.surname.localeCompare(b.surname, 'tr')
    return c !== 0 ? c : a.name.localeCompare(b.name, 'tr')
  })
})

function selectTeacher(t: { id: number; name: string; surname: string } | null) {
  form.teacherId = t?.id ?? null
  teacherSearch.value = ''
  showTeacherDropdown.value = false
}

function clearTeacher() {
  form.teacherId = null
  teacherSearch.value = ''
}

function hideTeacherDropdownSoon() {
  setTimeout(() => { showTeacherDropdown.value = false }, 150)
}

async function submit() {
  loading.value = true; error.value = ''
  try {
    await $fetch('/api/users', { method: 'POST', body: form })
    await navigateTo('/admin/users')
  } catch (e: any) { error.value = e?.data?.statusMessage ?? 'Fehler' }
  finally { loading.value = false }
}
</script>
