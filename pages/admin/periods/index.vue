<template>
  <LookupPage :items="data" api-path="/api/periods" :col-count="3" :editable="true"
    :initial-form="{ name: '', startDate: '', endDate: '' }" @refresh="refresh">
    <template #fields="{ form }">
      <input v-model="form.name" :placeholder="$t('period.name')" class="form-input flex-1" required />
      <input v-model="form.startDate" type="date" class="form-input w-36" required />
      <input v-model="form.endDate" type="date" class="form-input w-36" required />
    </template>
    <template #headers>
      <th class="text-left px-4 py-3 font-semibold" style="color:var(--color-text-muted)">{{ $t('period.name') }}</th>
      <th class="text-left px-4 py-3 font-semibold" style="color:var(--color-text-muted)">{{ $t('period.startDate') }}</th>
      <th class="text-left px-4 py-3 font-semibold" style="color:var(--color-text-muted)">{{ $t('period.endDate') }}</th>
    </template>
    <template #row="{ item }">
      <td class="px-4 py-3" style="color:var(--color-text)">{{ item.name }}</td>
      <td class="px-4 py-3" style="color:var(--color-text-muted)">{{ item.startDate }}</td>
      <td class="px-4 py-3" style="color:var(--color-text-muted)">{{ item.endDate }}</td>
    </template>
  </LookupPage>
</template>
<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
const { data, refresh } = await useFetch('/api/periods')
</script>
