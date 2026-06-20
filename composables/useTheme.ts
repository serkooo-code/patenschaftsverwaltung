export type Palette = 'indigo' | 'teal' | 'rose'
export type Mode = 'light' | 'dark'

const STORAGE_KEY_PALETTE = 'app-palette'
const STORAGE_KEY_MODE = 'app-mode'

export function useTheme() {
  const palette = useState<Palette>('palette', () => 'indigo')
  const mode = useState<Mode>('mode', () => 'light')

  function applyTheme(p: Palette, m: Mode) {
    if (import.meta.client) {
      document.documentElement.setAttribute('data-palette', p)
      document.documentElement.classList.toggle('dark', m === 'dark')
      localStorage.setItem(STORAGE_KEY_PALETTE, p)
      localStorage.setItem(STORAGE_KEY_MODE, m)
    }
  }

  function setPalette(p: Palette) {
    palette.value = p
    applyTheme(p, mode.value)
  }

  function setMode(m: Mode) {
    mode.value = m
    applyTheme(palette.value, m)
  }

  function toggleMode() {
    setMode(mode.value === 'light' ? 'dark' : 'light')
  }

  function initTheme() {
    if (import.meta.client) {
      const savedPalette = (localStorage.getItem(STORAGE_KEY_PALETTE) as Palette) ?? 'indigo'
      const savedMode = (localStorage.getItem(STORAGE_KEY_MODE) as Mode) ?? 'light'
      palette.value = savedPalette
      mode.value = savedMode
      applyTheme(savedPalette, savedMode)
    }
  }

  return { palette, mode, setPalette, setMode, toggleMode, initTheme }
}
