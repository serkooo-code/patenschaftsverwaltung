export function useConfirm() {
  const state = useState('confirm-dialog', () => ({
    open: false,
    message: '',
    resolve: null as ((v: boolean) => void) | null,
  }))

  function confirm(message: string): Promise<boolean> {
    return new Promise(resolve => {
      state.value.message = message
      state.value.open = true
      state.value.resolve = resolve
    })
  }

  function answer(value: boolean) {
    state.value.open = false
    state.value.resolve?.(value)
    state.value.resolve = null
  }

  return { confirmState: state, confirm, answer }
}
