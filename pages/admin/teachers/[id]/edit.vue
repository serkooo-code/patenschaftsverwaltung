<template>
  <div v-if="teacher" class="card max-w-lg">
    <form @submit.prevent="submit" class="flex flex-col gap-4">
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
      <div class="flex gap-3">
        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? $t('common.saving') : $t('common.save') }}
        </button>
        <NuxtLink to="/admin/teachers" class="btn-secondary">{{ $t('common.cancel') }}</NuxtLink>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
const route = useRoute()
const id = route.params.id

const [{ data: teacher }, { data: allClasses }, { data: assignedClassIds }, { data: allDisciplines }, { data: assignedDisciplineIds }] = await Promise.all([
  useFetch(`/api/teachers/${id}`),
  useFetch('/api/classes'),
  useFetch(`/api/teachers/${id}/schools`),
  useFetch('/api/disciplines'),
  useFetch(`/api/teachers/${id}/disciplines`),
])

if (!teacher.value) await navigateTo('/admin/teachers')

const t = teacher.value as any
const form = reactive({
  name: t?.name ?? '',
  surname: t?.surname ?? '',
  teacherNo: t?.teacherNo ?? '',
  classIds: [...(assignedClassIds.value as number[] ?? [])],
  disciplineIds: [...(assignedDisciplineIds.value as number[] ?? [])],
})
const loading = ref(false)
const error = ref('')

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
