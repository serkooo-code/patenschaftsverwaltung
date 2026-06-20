<template>
  <LookupPage :items="data" api-path="/api/disciplines" :col-count="1" @refresh="refresh">
    <template #fields="{ form }">
      <input v-model="form.name" :placeholder="$t('discipline.name')" class="form-input flex-1" required />
    </template>
    <template #headers>
      <th class="text-left px-4 py-3 font-semibold" style="color:var(--color-text-muted)">{{ $t('discipline.name') }}</th>
    </template>
    <template #row="{ item }">
      <td class="px-4 py-3" style="color:var(--color-text)">{{ item.name }}</td>
    </template>
  </LookupPage>
</template>
<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
const { data, refresh } = await useFetch('/api/disciplines')
</script>
