<template>
  <div>
    <form @submit.prevent="add" class="flex gap-2 mb-6">
      <input v-model="newName" :placeholder="$t('class.name')" class="form-input flex-1" required />
      <button type="submit" class="btn-primary flex items-center gap-1 shrink-0" :disabled="saving">
        <span class="material-icons-round text-base">add</span>{{ $t('common.add') }}
      </button>
    </form>
    <p v-if="error" class="text-sm mb-3" style="color:var(--color-danger)">{{ error }}</p>

    <div class="card p-0 overflow-hidden">
      <table class="data-table">
        <thead>
          <tr>
            <th class="w-20">{{ $t('class.no') }}</th>
            <th class="text-left">{{ $t('class.name') }}</th>
            <th class="w-24 text-center" style="border-right:none"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!data?.length">
            <td colspan="3" class="text-center py-8" style="color:var(--color-text-muted);border-right:none">{{ $t('common.noData') }}</td>
          </tr>
          <tr v-for="item in data" :key="item.id">
            <td class="text-sm" style="color:var(--color-text-muted)">{{ item.schoolNo ?? '—' }}</td>
            <td>
              <template v-if="editingId === item.id">
                <input v-model="editName" class="form-input py-1 text-sm" @keydown.esc="cancelEdit" />
              </template>
              <template v-else>{{ item.name }}</template>
            </td>
            <td class="text-center" style="border-right:none">
              <div class="flex items-center justify-center gap-1">
                <template v-if="editingId === item.id">
                  <button @click="saveEdit(item.id)" class="p-1 rounded hover:bg-[var(--color-surface-alt)]">
                    <span class="material-icons-round text-base" style="color:var(--color-primary)">check</span>
                  </button>
                  <button @click="cancelEdit" class="p-1 rounded hover:bg-[var(--color-surface-alt)]">
                    <span class="material-icons-round text-base" style="color:var(--color-text-muted)">close</span>
                  </button>
                </template>
                <template v-else>
                  <button @click="startEdit(item)" class="p-1 rounded hover:bg-[var(--color-surface-alt)]">
                    <span class="material-icons-round text-base" style="color:var(--color-text-muted)">edit</span>
                  </button>
                  <button @click="remove(item.id)" class="p-1 rounded hover:bg-[var(--color-surface-alt)]">
                    <span class="material-icons-round text-base" style="color:var(--color-danger)">delete</span>
                  </button>
                </template>
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

const { data, refresh } = await useFetch('/api/classes')

const newName = ref('')
const saving = ref(false)
const error = ref('')
const editingId = ref<number | null>(null)
const editName = ref('')

async function add() {
  saving.value = true; error.value = ''
  try {
    await $fetch('/api/classes', { method: 'POST', body: { name: newName.value } })
    newName.value = ''
    refresh()
  } catch (e: any) { error.value = e?.data?.statusMessage ?? 'Fehler' }
  finally { saving.value = false }
}

function startEdit(item: { id: number; name: string }) {
  editingId.value = item.id
  editName.value = item.name
}

function cancelEdit() {
  editingId.value = null
  editName.value = ''
}

async function saveEdit(id: number) {
  error.value = ''
  try {
    await $fetch(`/api/classes/${id}`, { method: 'PUT', body: { name: editName.value } })
    cancelEdit()
    refresh()
  } catch (e: any) { error.value = e?.data?.statusMessage ?? 'Fehler' }
}

async function remove(id: number) {
  if (!confirm('Löschen?')) return
  try {
    await $fetch(`/api/classes/${id}`, { method: 'DELETE' })
    refresh()
  } catch (e: any) { error.value = e?.data?.statusMessage ?? 'Fehler' }
}
</script>
