<template>
  <div v-if="student" class="card max-w-2xl">
    <form @submit.prevent="submit" class="flex flex-col gap-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="form-label">{{ $t('student.firstName') }} *</label>
          <input v-model="form.name" class="form-input" required />
        </div>
        <div>
          <label class="form-label">{{ $t('student.lastName') }} *</label>
          <input v-model="form.surname" class="form-input" required />
        </div>
        <div>
          <label class="form-label">{{ $t('student.no') }}</label>
          <div class="form-input flex items-center text-sm" style="color:var(--color-text-muted);background:var(--color-surface-alt);cursor:default">{{ s.studentNo }}</div>
        </div>
        <div>
          <label class="form-label">{{ $t('student.birthDate') }} *</label>
          <input v-model="form.birthDate" type="date" class="form-input" required />
        </div>
        <div>
          <label class="form-label">{{ $t('student.school') }}</label>
          <select v-model.number="form.classId" class="form-input">
            <option :value="null">—</option>
            <option v-for="c in classes" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
      </div>

      <div>
        <label class="form-label">{{ $t('student.teachers') }}</label>
        <div class="flex flex-wrap gap-3 mt-1">
          <label v-for="t in teachers" :key="t.id" class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" :value="t.id" v-model="form.teacherIds" />
            <span class="text-sm" style="color:var(--color-text)">{{ t.name }} {{ t.surname }}</span>
          </label>
        </div>
      </div>

      <div>
        <label class="form-label">{{ $t('student.sessions') }}</label>
        <div class="flex flex-wrap gap-3 mt-1">
          <label v-for="s in sessions" :key="s.id" class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" :value="s.id" v-model="form.sessionIds" />
            <span class="text-sm" style="color:var(--color-text)">{{ s.name }}</span>
          </label>
        </div>
      </div>

      <p v-if="error" class="text-sm" style="color:var(--color-danger)">{{ error }}</p>
      <div class="flex gap-3">
        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? $t('common.saving') : $t('common.save') }}
        </button>
        <NuxtLink to="/admin/students" class="btn-secondary">{{ $t('common.cancel') }}</NuxtLink>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
const route = useRoute()
const id = route.params.id

const [{ data: student }, { data: classes }, { data: teachers }, { data: sessions }] = await Promise.all([
  useFetch(`/api/students/${id}`),
  useFetch('/api/classes'),
  useFetch('/api/teachers'),
  useFetch('/api/sessions'),
])

if (!student.value) await navigateTo('/admin/students')

const s = student.value as any
const form = reactive({
  name: s?.name ?? '',
  surname: s?.surname ?? '',
  birthDate: s?.birthDate ?? '',
  classId: s?.classId ?? null as number | null,
  teacherIds: (s?.teachers ?? []).map((t: any) => t.id) as number[],
  sessionIds: (s?.sessions ?? []).map((s: any) => s.id) as number[],
})

const loading = ref(false)
const error = ref('')

async function submit() {
  loading.value = true; error.value = ''
  try {
    await $fetch(`/api/students/${id}`, { method: 'PUT', body: form })
    await navigateTo('/admin/students')
  } catch (e: any) {
    error.value = e?.data?.statusMessage ?? 'Fehler'
  } finally {
    loading.value = false
  }
}
</script>
