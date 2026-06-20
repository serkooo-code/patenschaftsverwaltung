<template>
  <div class="w-full max-w-sm">
    <div class="card">
      <div class="text-center mb-8">
        <span class="material-icons text-4xl mb-2" style="color: var(--color-primary)">favorite</span>
        <h1 class="text-2xl font-bold" style="color: var(--color-text)">{{ $t('app.name') }}</h1>
      </div>

      <form @submit.prevent="submit" class="flex flex-col gap-4">
        <div>
          <label class="form-label">{{ $t('auth.email') }}</label>
          <input v-model="form.email" type="email" class="form-input" autocomplete="email" required />
        </div>
        <div>
          <label class="form-label">{{ $t('auth.password') }}</label>
          <input v-model="form.password" type="password" class="form-input" autocomplete="current-password" required />
        </div>
        <p v-if="error" class="text-sm" style="color: var(--color-danger)">{{ error }}</p>
        <button type="submit" class="btn-primary w-full" :disabled="loading">
          {{ loading ? $t('common.loading') : $t('auth.login') }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { loggedIn, fetch: refreshSession } = useUserSession()
if (loggedIn.value) await navigateTo('/sponsorships')

const form = reactive({ email: '', password: '' })
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await $fetch('/api/auth/login', { method: 'POST', body: form })
    await refreshSession()
    await navigateTo('/sponsorships')
  } catch (e: any) {
    error.value = e?.data?.statusMessage ?? 'Fehler'
  } finally {
    loading.value = false
  }
}
</script>
