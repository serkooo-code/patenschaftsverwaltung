<template>
  <div>
    <form @submit.prevent="add" class="flex gap-2 mb-6">
      <slot name="fields" :form="form" />
      <button type="submit" class="btn-primary flex items-center gap-1 shrink-0" :disabled="saving">
        <span class="material-icons-round text-base">add</span>
        {{ $t('common.add') }}
      </button>
    </form>
    <p v-if="error" class="text-sm mb-3" style="color:var(--color-danger)">{{ error }}</p>

    <div class="card p-0 overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr style="border-bottom: 1px solid var(--color-border)">
            <slot name="headers" />
            <th class="px-4 py-3 w-20"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!items?.length">
            <td :colspan="(colCount ?? 1) + 1" class="px-4 py-8 text-center" style="color:var(--color-text-muted)">
              {{ $t('common.noData') }}
            </td>
          </tr>
          <template v-for="item in items" :key="item.id">
            <!-- Normal row -->
            <tr v-if="editId !== item.id"
              class="border-b table-row-hover" style="border-color:var(--color-border)">
              <slot name="row" :item="item" />
              <td class="px-4 py-3 text-right whitespace-nowrap">
                <button v-if="editable" @click="startEdit(item)"
                  class="p-1 rounded hover:bg-[var(--color-surface-alt)] mr-1">
                  <span class="material-icons-round text-base" style="color:var(--color-primary)">edit</span>
                </button>
                <button @click="remove(item.id)" class="p-1 rounded hover:bg-[var(--color-surface-alt)]">
                  <span class="material-icons-round text-base" style="color:var(--color-danger)">delete</span>
                </button>
              </td>
            </tr>
            <!-- Inline edit row -->
            <tr v-else class="border-b" style="border-color:var(--color-border);background:var(--color-surface-alt)">
              <td :colspan="(colCount ?? 1) + 1" class="px-4 py-3">
                <form @submit.prevent="update" class="flex gap-2 items-center flex-wrap">
                  <slot name="fields" :form="editForm" />
                  <button type="submit" class="btn-primary text-xs px-3 py-1.5 flex items-center gap-1" :disabled="saving">
                    <span class="material-icons-round text-base">check</span>
                    {{ $t('common.save') }}
                  </button>
                  <button type="button" @click="editId = null"
                    class="text-xs px-3 py-1.5 rounded-lg" style="color:var(--color-text-muted)">
                    {{ $t('common.cancel') }}
                  </button>
                </form>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  items: any[] | null
  apiPath: string
  colCount?: number
  initialForm?: Record<string, unknown>
  editable?: boolean
}>()
const emit = defineEmits<{ refresh: [] }>()

const form = reactive<Record<string, unknown>>(props.initialForm ? { ...props.initialForm } : { name: '' })
const editId = ref<number | null>(null)
const editForm = reactive<Record<string, unknown>>({})
const saving = ref(false)
const error = ref('')

function startEdit(item: any) {
  editId.value = item.id
  Object.keys(editForm).forEach(k => delete editForm[k])
  Object.assign(editForm, { ...item })
}

async function add() {
  saving.value = true; error.value = ''
  try {
    await $fetch(props.apiPath, { method: 'POST', body: { ...form } })
    Object.keys(form).forEach(k => { form[k] = '' })
    emit('refresh')
  } catch (e: any) { error.value = e?.data?.statusMessage ?? 'Fehler' }
  finally { saving.value = false }
}

async function update() {
  if (!editId.value) return
  saving.value = true; error.value = ''
  try {
    await $fetch(`${props.apiPath}/${editId.value}`, { method: 'PUT', body: { ...editForm } })
    editId.value = null
    emit('refresh')
  } catch (e: any) { error.value = e?.data?.statusMessage ?? 'Fehler' }
  finally { saving.value = false }
}

async function remove(id: number) {
  if (!confirm('Löschen?')) return
  try {
    await $fetch(`${props.apiPath}/${id}`, { method: 'DELETE' })
    emit('refresh')
  } catch (e: any) { error.value = e?.data?.statusMessage ?? 'Fehler' }
}
</script>
