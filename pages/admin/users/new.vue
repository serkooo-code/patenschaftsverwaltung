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
      <div v-if="form.role === 'teacher'">
        <label class="form-label">{{ $t('teacher.link') }}</label>
        <select v-model.number="form.teacherId" class="form-input">
          <option :value="null">— {{ $t('common.none') }} —</option>
          <option v-for="t in teachers" :key="t.id" :value="t.id">{{ t.name }} {{ t.surname }}</option>
        </select>
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

async function submit() {
  loading.value = true; error.value = ''
  try {
    await $fetch('/api/users', { method: 'POST', body: form })
    await navigateTo('/admin/users')
  } catch (e: any) { error.value = e?.data?.statusMessage ?? 'Fehler' }
  finally { loading.value = false }
}
</script>
