<template>
  <div class="w-full max-w-sm">
    <!-- Mobile brand mark (hidden on md+, where left panel shows it) -->
    <div class="md:hidden flex items-center gap-3 mb-8">
      <img src="/harika-logo.svg" alt="Harika" class="h-9 w-auto" />
      <span class="font-bold text-base" style="color: var(--color-text)">{{ $t('app.name') }}</span>
    </div>

    <div class="mb-8">
      <h2 class="text-2xl font-bold mb-1.5 tracking-tight" style="color: var(--color-text)">
        {{ $t('auth.welcome') }}
      </h2>
      <p class="text-sm" style="color: var(--color-text-muted)">{{ $t('auth.loginPrompt') }}</p>
    </div>

    <form @submit.prevent="submit" class="flex flex-col gap-5">
      <div>
        <label class="form-label">{{ $t('auth.email') }}</label>
        <input
          v-model="form.email"
          type="email"
          class="form-input"
          autocomplete="email"
          required
          placeholder="admin@schule.de"
        />
      </div>
      <div>
        <label class="form-label">{{ $t('auth.password') }}</label>
        <input
          v-model="form.password"
          type="password"
          class="form-input"
          autocomplete="current-password"
          required
        />
      </div>
      <p v-if="error" class="text-sm font-medium" style="color: var(--color-danger)">{{ error }}</p>
      <button type="submit" class="btn-primary w-full justify-center py-3 text-sm mt-1" :disabled="loading">
        {{ loading ? $t('common.loading') : $t('auth.login') }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { loggedIn, user, fetch: refreshSession } = useUserSession()
if (loggedIn.value) {
  const role = (user.value as any)?.role
  await navigateTo(role === 'admin' ? '/admin/reports' : '/teacher')
}

const form = reactive({ email: '', password: '' })
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await $fetch('/api/auth/login', { method: 'POST', body: form })
    await refreshSession()
    const role = (user.value as any)?.role
    await navigateTo(role === 'admin' ? '/admin/reports' : '/teacher')
  } catch (e: any) {
    error.value = e?.data?.statusMessage ?? 'Anmeldung fehlgeschlagen'
  } finally {
    loading.value = false
  }
}
</script>
