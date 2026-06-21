<template>
  <div class="card max-w-md">
    <form @submit.prevent="submit" class="flex flex-col gap-4">
      <div>
        <label class="form-label">{{ $t('teacher.firstName') }} *</label>
        <input v-model="form.name" class="form-input" required />
      </div>
      <div>
        <label class="form-label">{{ $t('teacher.lastName') }} *</label>
        <input v-model="form.surname" class="form-input" required />
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
const form = reactive({ name: '', surname: '' })
const loading = ref(false)
const error = ref('')

async function submit() {
  loading.value = true; error.value = ''
  try {
    await $fetch('/api/teachers', { method: 'POST', body: form })
    await navigateTo('/admin/teachers')
  } catch (e: any) { error.value = e?.data?.statusMessage ?? 'Fehler' }
  finally { loading.value = false }
}
</script>
