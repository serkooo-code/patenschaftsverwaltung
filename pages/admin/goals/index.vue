<template>
  <LookupPage :items="data" api-path="/api/goals" :col-count="3"
    :initial-form="{ name: '', minAge: '', maxAge: '' }" @refresh="refresh">
    <template #fields="{ form }">
      <input v-model="form.name" :placeholder="$t('goal.name')" class="form-input flex-1" required />
      <input v-model.number="form.minAge" type="number" :placeholder="$t('goal.minAge')" class="form-input w-24" />
      <input v-model.number="form.maxAge" type="number" :placeholder="$t('goal.maxAge')" class="form-input w-24" />
    </template>
    <template #headers>
      <th class="text-left px-4 py-3 font-semibold" style="color:var(--color-text-muted)">{{ $t('goal.name') }}</th>
      <th class="text-left px-4 py-3 font-semibold" style="color:var(--color-text-muted)">{{ $t('goal.minAge') }}</th>
      <th class="text-left px-4 py-3 font-semibold" style="color:var(--color-text-muted)">{{ $t('goal.maxAge') }}</th>
    </template>
    <template #row="{ item }">
      <td class="px-4 py-3" style="color:var(--color-text)">{{ item.name }}</td>
      <td class="px-4 py-3" style="color:var(--color-text-muted)">{{ item.minAge ?? '—' }}</td>
      <td class="px-4 py-3" style="color:var(--color-text-muted)">{{ item.maxAge ?? '—' }}</td>
    </template>
  </LookupPage>
</template>
<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
const { data, refresh } = await useFetch('/api/goals')
</script>
