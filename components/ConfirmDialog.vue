<template>
  <Teleport to="body">
    <Transition name="confirm-fade">
      <div v-if="confirmState.open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        style="background:rgba(0,0,0,0.45)"
        @mousedown.self="answer(false)">
        <div class="w-full max-w-sm rounded-2xl shadow-xl p-6 flex flex-col gap-5"
          style="background:var(--color-surface)">
          <div class="flex items-start gap-3">
            <span class="material-icons-round mt-0.5 shrink-0" style="color:var(--color-warning)">warning</span>
            <p class="text-sm leading-relaxed" style="color:var(--color-text)">{{ confirmState.message }}</p>
          </div>
          <div class="flex gap-3 justify-end">
            <button @click="answer(false)"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style="background:var(--color-surface-alt);color:var(--color-text)">
              {{ $t('common.no') }}
            </button>
            <button @click="answer(true)"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style="background:var(--color-danger);color:#fff">
              {{ $t('common.yes') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const { confirmState, answer } = useConfirm()
</script>

<style scoped>
.confirm-fade-enter-active, .confirm-fade-leave-active { transition: opacity 0.15s ease; }
.confirm-fade-enter-from, .confirm-fade-leave-to { opacity: 0; }
</style>
