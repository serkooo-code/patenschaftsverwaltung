<template>
  <div>
    <div class="flex justify-end mb-6">
      <NuxtLink to="/admin/students/new" class="btn-primary flex items-center gap-2">
        <span class="material-icons-round text-base">add</span>{{ $t('student.new') }}
      </NuxtLink>
    </div>
    <div class="card p-0 overflow-hidden">
      <table class="data-table">
        <thead>
          <tr>
            <th>{{ $t('student.name') }}</th>
            <th>{{ $t('student.no') }}</th>
            <th>{{ $t('student.school') }}</th>
            <th>{{ $t('nav.sessions') }}</th>
            <th>{{ $t('student.birthDate') }}</th>
            <th class="w-24 text-center" style="border-right:none"></th>
          </tr>
          <!-- Filter row -->
          <tr style="background:var(--color-surface-alt)">
            <th class="px-3 py-2 font-normal">
              <input v-model="filters.name" type="text" :placeholder="$t('common.search')"
                class="w-full text-xs rounded px-2 py-1 border"
                style="background:var(--color-surface);border-color:var(--color-border);color:var(--color-text)" />
            </th>
            <th class="px-3 py-2 font-normal">
              <input v-model="filters.no" type="text" :placeholder="$t('common.search')"
                class="w-full text-xs rounded px-2 py-1 border"
                style="background:var(--color-surface);border-color:var(--color-border);color:var(--color-text)" />
            </th>
            <th class="px-3 py-2 font-normal">
              <select v-model="filters.school"
                class="w-full text-xs rounded px-2 py-1 border"
                style="background:var(--color-surface);border-color:var(--color-border);color:var(--color-text)">
                <option value="">{{ $t('common.all') }}</option>
                <option v-for="s in allSchools" :key="s" :value="s">{{ s }}</option>
              </select>
            </th>
            <th class="px-3 py-2 font-normal">
              <select v-model="filters.session"
                class="w-full text-xs rounded px-2 py-1 border"
                style="background:var(--color-surface);border-color:var(--color-border);color:var(--color-text)">
                <option value="">{{ $t('common.all') }}</option>
                <option v-for="s in allSessions" :key="s" :value="s">{{ s }}</option>
              </select>
            </th>
            <th class="px-3 py-2 font-normal" colspan="2" style="border-right:none">
              <button v-if="isFiltered" @click="clearFilters"
                class="flex items-center gap-1 text-xs px-2 py-1 rounded"
                style="color:var(--color-danger)">
                <span class="material-icons-round" style="font-size:14px">filter_alt_off</span>
                {{ $t('common.filterClear') }}
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!filteredData.length">
            <td colspan="6" class="text-center py-8" style="color:var(--color-text-muted);border-right:none">{{ $t('common.noData') }}</td>
          </tr>
          <tr v-for="s in filteredData" :key="s.id">
            <td class="font-medium">{{ s.name }} {{ s.surname }}</td>
            <td style="color:var(--color-text-muted)">{{ s.studentNo }}</td>
            <td style="color:var(--color-text-muted)">{{ s.className ?? '—' }}</td>
            <td>
              <div class="flex flex-wrap gap-1">
                <span v-for="sess in (s as any).sessions" :key="sess.id"
                  class="text-xs px-1.5 py-0.5 rounded font-medium"
                  style="background:var(--color-primary-subtle);color:var(--color-primary)">
                  {{ dayAbbr(sess.name) }}
                </span>
                <span v-if="!(s as any).sessions?.length" class="text-xs" style="color:var(--color-text-muted)">—</span>
              </div>
            </td>
            <td style="color:var(--color-text-muted)">{{ s.birthDate }}</td>
            <td class="text-center" style="border-right:none">
              <div class="flex items-center justify-center gap-1">
                <NuxtLink :to="`/admin/students/${s.id}/edit`" class="p-1 rounded hover:bg-[var(--color-surface-alt)]">
                  <span class="material-icons-round text-base" style="color:var(--color-text-muted)">edit</span>
                </NuxtLink>
                <button @click="remove(s.id)" class="p-1 rounded hover:bg-[var(--color-surface-alt)]">
                  <span class="material-icons-round text-base" style="color:var(--color-danger)">delete</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
const { data, refresh } = await useFetch('/api/students')

const ABBR: Record<string, string> = {
  'Pazartesi': 'Pzt', 'Salı': 'Sal', 'Çarşamba': 'Çar',
  'Perşembe': 'Per', 'Cuma': 'Cum', 'Cumartesi': 'Cmt', 'Pazar': 'Paz',
}
function dayAbbr(name: string) { return ABBR[name] ?? name.slice(0, 3) }

// ── Filters (useState → bleiben beim Zurücknavigieren erhalten) ───────────────
const filters = useState('student-filters', () => ({ name: '', no: '', school: '', session: '' }))

const isFiltered = computed(() =>
  filters.value.name || filters.value.no || filters.value.school || filters.value.session
)
function clearFilters() {
  filters.value = { name: '', no: '', school: '', session: '' }
}

const allSchools = computed(() => {
  const set = new Set<string>()
  for (const s of (data.value as any[]) ?? [])
    if (s.className) set.add(s.className)
  return [...set].sort((a, b) => a.localeCompare(b, 'tr'))
})

const allSessions = computed(() => {
  const set = new Set<string>()
  for (const s of (data.value as any[]) ?? [])
    for (const sess of s.sessions ?? []) set.add(sess.name)
  return [...set].sort((a, b) => a.localeCompare(b, 'tr'))
})

const filteredData = computed(() => {
  const name = filters.value.name.toLocaleLowerCase('tr')
  const no = filters.value.no.toLocaleLowerCase('tr')
  return ((data.value as any[]) ?? []).filter(s => {
    if (name && !`${s.name} ${s.surname}`.toLocaleLowerCase('tr').includes(name)) return false
    if (no && !s.studentNo?.toString().includes(no)) return false
    if (filters.value.school && s.className !== filters.value.school) return false
    if (filters.value.session && !s.sessions?.some((sess: any) => sess.name === filters.value.session)) return false
    return true
  })
})

const { t } = useI18n()
const { confirm: askConfirm } = useConfirm()
async function remove(id: number) {
  if (!await askConfirm(t('common.deleteConfirm'))) return
  await $fetch(`/api/students/${id}`, { method: 'DELETE' })
  refresh()
}
</script>
