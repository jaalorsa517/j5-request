import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type Theme = 'dark' | 'light'

export const useThemeStore = defineStore('theme', () => {
    // Check local storage or system preference
    const storedTheme = localStorage.getItem('theme') as Theme | null
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    const theme = ref<Theme>(storedTheme || (systemPrefersDark ? 'dark' : 'light'))

    function toggleTheme() {
        theme.value = theme.value === 'dark' ? 'light' : 'dark'
    }

    function setTheme(newTheme: Theme) {
        theme.value = newTheme
    }

    // Apply theme to document
    watch(theme, (newTheme) => {
        document.documentElement.setAttribute('data-theme', newTheme)
        localStorage.setItem('theme', newTheme)
    }, { immediate: true })

    return { theme, toggleTheme, setTheme }
})
