<template>
  <div class="card max-w-2xl">
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
          <label class="form-label">{{ $t('student.birthDate') }} *</label>
          <input v-model="form.birthDate" type="date" class="form-input" required />
        </div>
        <div>
          <label class="form-label">{{ $t('student.class') }}</label>
          <select v-model.number="form.classId" class="form-input">
            <option :value="null">—</option>
            <option v-for="c in classes" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
      </div>

      <div>
        <label class="form-label">{{ $t('student.teachers') }}</label>
        <div class="flex flex-wrap gap-2 mt-1">
          <label v-for="t in teachers" :key="t.id" class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" :value="t.id" v-model="form.teacherIds" class="rounded" />
            <span class="text-sm" style="color:var(--color-text)">{{ t.name }} {{ t.surname }}</span>
          </label>
        </div>
      </div>

      <div>
        <label class="form-label">{{ $t('student.sessions') }}</label>
        <div class="flex flex-wrap gap-2 mt-1">
          <label v-for="s in sessions" :key="s.id" class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" :value="s.id" v-model="form.sessionIds" class="rounded" />
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
const [{ data: classes }, { data: teachers }, { data: sessions }] = await Promise.all([
  useFetch('/api/classes'), useFetch('/api/teachers'), useFetch('/api/sessions'),
])
const form = reactive({ name: '', surname: '', birthDate: '', classId: null as number | null, teacherIds: [] as number[], sessionIds: [] as number[] })
const loading = ref(false)
const error = ref('')

async function submit() {
  loading.value = true; error.value = ''
  try {
    await $fetch('/api/students', { method: 'POST', body: form })
    await navigateTo('/admin/students')
  } catch (e: any) { error.value = e?.data?.statusMessage ?? 'Fehler' }
  finally { loading.value = false }
}
</script>
