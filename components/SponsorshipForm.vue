<template>
  <form @submit.prevent="$emit('submit', form)" class="flex flex-col gap-4 max-w-2xl">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="md:col-span-2">
        <label class="form-label">{{ $t('sponsorship.title') }} *</label>
        <input v-model="form.title" type="text" class="form-input" required />
      </div>
      <div>
        <label class="form-label">{{ $t('sponsorship.sponsor') }} *</label>
        <input v-model="form.sponsor" type="text" class="form-input" required />
      </div>
      <div>
        <label class="form-label">{{ $t('sponsorship.beneficiary') }} *</label>
        <input v-model="form.beneficiary" type="text" class="form-input" required />
      </div>
      <div>
        <label class="form-label">{{ $t('sponsorship.status') }}</label>
        <select v-model="form.status" class="form-input">
          <option value="active">{{ $t('status.active') }}</option>
          <option value="paused">{{ $t('status.paused') }}</option>
          <option value="ended">{{ $t('status.ended') }}</option>
        </select>
      </div>
      <div>
        <label class="form-label">{{ $t('sponsorship.startDate') }} *</label>
        <input v-model="form.startDate" type="date" class="form-input" required />
      </div>
      <div>
        <label class="form-label">{{ $t('sponsorship.endDate') }}</label>
        <input v-model="form.endDate" type="date" class="form-input" />
      </div>
      <div class="md:col-span-2">
        <label class="form-label">{{ $t('sponsorship.notes') }}</label>
        <textarea v-model="form.notes" rows="4" class="form-input resize-none"></textarea>
      </div>
    </div>

    <p v-if="error" class="text-sm" style="color: var(--color-danger)">{{ error }}</p>

    <div class="flex gap-3">
      <button type="submit" class="btn-primary" :disabled="loading">
        {{ loading ? $t('common.saving') : $t('common.save') }}
      </button>
      <NuxtLink :to="cancelTo" class="btn-secondary">{{ $t('common.cancel') }}</NuxtLink>
      <button v-if="showDelete" type="button" class="btn-danger ml-auto" @click="$emit('delete')">
        {{ $t('common.delete') }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
const props = defineProps<{
  initialData?: Partial<{
    title: string; sponsor: string; beneficiary: string
    status: string; startDate: string; endDate: string; notes: string
  }>
  loading?: boolean
  error?: string
  cancelTo: string
  showDelete?: boolean
}>()

defineEmits<{ submit: [form: typeof form]; delete: [] }>()

const form = reactive({
  title: props.initialData?.title ?? '',
  sponsor: props.initialData?.sponsor ?? '',
  beneficiary: props.initialData?.beneficiary ?? '',
  status: props.initialData?.status ?? 'active',
  startDate: props.initialData?.startDate ?? '',
  endDate: props.initialData?.endDate ?? '',
  notes: props.initialData?.notes ?? '',
})
</script>
