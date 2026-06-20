<template>
  <div class="flex flex-col gap-6">
    <!-- Add association form -->
    <div class="card">
      <h2 class="font-semibold mb-4" style="color:var(--color-text)">{{ $t('assoc.add') }}</h2>
      <form @submit.prevent="add" class="flex flex-wrap gap-3 items-end">
        <div>
          <label class="form-label">{{ $t('assoc.type') }}</label>
          <select v-model="form.type" class="form-input">
            <option value="moduleGoal">{{ $t('assoc.moduleGoal') }}</option>
            <option value="sessionModule">{{ $t('assoc.sessionModule') }}</option>
            <option value="disciplineSession">{{ $t('assoc.disciplineSession') }}</option>
            <option value="teacherDiscipline">{{ $t('assoc.teacherDiscipline') }}</option>
            <option value="classTeacher">{{ $t('assoc.classTeacher') }}</option>
          </select>
        </div>
        <div>
          <label class="form-label">{{ labelA }}</label>
          <select v-model.number="form.a" class="form-input">
            <option value="">—</option>
            <option v-for="o in optionsA" :key="o.id" :value="o.id">{{ o.label }}</option>
          </select>
        </div>
        <div>
          <label class="form-label">{{ labelB }}</label>
          <select v-model.number="form.b" class="form-input">
            <option value="">—</option>
            <option v-for="o in optionsB" :key="o.id" :value="o.id">{{ o.label }}</option>
          </select>
        </div>
        <button type="submit" class="btn-primary" :disabled="!form.a || !form.b">{{ $t('common.add') }}</button>
      </form>
      <p v-if="error" class="text-sm mt-2" style="color:var(--color-danger)">{{ error }}</p>
    </div>

    <!-- Current associations -->
    <div v-for="section in sections" :key="section.key" class="card">
      <h3 class="font-semibold mb-3" style="color:var(--color-text)">{{ $t(`assoc.${section.key}`) }}</h3>
      <div class="flex flex-wrap gap-2">
        <span v-for="row in (assocData as any)?.[section.key]" :key="JSON.stringify(row)"
          class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm"
          style="background:var(--color-surface-alt); color:var(--color-text)">
          {{ section.label(row) }}
          <button @click="remove(section.type, section.aId(row), section.bId(row))"
            class="ml-1 hover:opacity-70">
            <span class="material-icons-round text-sm">close</span>
          </button>
        </span>
        <span v-if="!(assocData as any)?.[section.key]?.length"
          class="text-sm" style="color:var(--color-text-muted)">{{ $t('common.noData') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
const { data: assocData, refresh } = await useFetch('/api/associations')
const [{ data: moduleList }, { data: goalList }, { data: sessionList },
  { data: disciplineList }, { data: teacherList }, { data: classList }] = await Promise.all([
  useFetch('/api/modules'), useFetch('/api/goals'), useFetch('/api/sessions'),
  useFetch('/api/disciplines'), useFetch('/api/teachers'), useFetch('/api/classes'),
])

const form = reactive({ type: 'moduleGoal', a: '' as number | '', b: '' as number | '' })
const error = ref('')

type AssocType = 'moduleGoal' | 'sessionModule' | 'disciplineSession' | 'teacherDiscipline' | 'classTeacher'

const { t } = useI18n()
const typeConfig: Record<AssocType, { labelA: string; labelB: string; optA: any; optB: any; labelFn: (r: any) => string; aId: (r: any) => number; bId: (r: any) => number }> = {
  moduleGoal:        { labelA: t('nav.modules'),     labelB: t('nav.goals'),       optA: moduleList,     optB: goalList,       labelFn: r => `${r.moduleName} → ${r.goalName}`,       aId: r => r.moduleId,     bId: r => r.goalId },
  sessionModule:     { labelA: t('nav.sessions'),    labelB: t('nav.modules'),     optA: sessionList,    optB: moduleList,     labelFn: r => `${r.sessionName} → ${r.moduleName}`,    aId: r => r.sessionId,    bId: r => r.moduleId },
  disciplineSession: { labelA: t('nav.disciplines'), labelB: t('nav.sessions'),    optA: disciplineList, optB: sessionList,    labelFn: r => `${r.disciplineName} → ${r.sessionName}`, aId: r => r.disciplineId, bId: r => r.sessionId },
  teacherDiscipline: { labelA: t('nav.teachers'),    labelB: t('nav.disciplines'), optA: teacherList,    optB: disciplineList, labelFn: r => `${r.teacherName} ${r.teacherSurname} → ${r.disciplineName}`, aId: r => r.teacherId, bId: r => r.disciplineId },
  classTeacher:      { labelA: t('nav.classes'),     labelB: t('nav.teachers'),    optA: classList,      optB: teacherList,    labelFn: r => `${r.className} → ${r.teacherName} ${r.teacherSurname}`, aId: r => r.classId, bId: r => r.teacherId },
}

const labelA = computed(() => typeConfig[form.type as AssocType]?.labelA ?? '')
const labelB = computed(() => typeConfig[form.type as AssocType]?.labelB ?? '')

const optionsA = computed(() => {
  const raw = typeConfig[form.type as AssocType]?.optA?.value ?? []
  return raw.map((r: any) => ({ id: r.id, label: r.name ?? `${r.name} ${r.surname}` }))
})
const optionsB = computed(() => {
  const raw = typeConfig[form.type as AssocType]?.optB?.value ?? []
  return raw.map((r: any) => ({ id: r.id, label: r.name ?? `${r.name} ${r.surname}` }))
})

const sections = computed(() =>
  (Object.keys(typeConfig) as AssocType[]).map(key => ({
    key, type: key,
    label: typeConfig[key].labelFn,
    aId: typeConfig[key].aId,
    bId: typeConfig[key].bId,
  }))
)

async function add() {
  error.value = ''
  try {
    await $fetch('/api/associations', { method: 'POST', body: { type: form.type, a: form.a, b: form.b } })
    form.a = ''; form.b = ''
    refresh()
  } catch (e: any) { error.value = e?.data?.statusMessage ?? 'Fehler' }
}

async function remove(type: string, a: number, b: number) {
  await $fetch('/api/associations', { method: 'DELETE', body: { type, a, b } })
  refresh()
}
</script>
