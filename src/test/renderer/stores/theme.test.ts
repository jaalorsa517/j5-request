/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useThemeStore } from '@/renderer/stores/theme'
import { nextTick } from 'vue'

describe('Theme Store', () => {
    beforeEach(() => {
        setActivePinia(createPinia())

        // Clear localStorage
        localStorage.clear()

        // Reset matchMedia to default (light)
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            configurable: true,
            value: vi.fn().mockImplementation(query => ({
                matches: false,
                media: query,
                onchange: null,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            }))
        })
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('initializes with light theme when no preference and system is light', () => {
        const store = useThemeStore()
        expect(store.theme).toBe('light')
    })

    it('initializes with dark theme when system preference is dark', () => {
        // Mock matchMedia to return true for dark mode
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: vi.fn().mockImplementation(query => ({
                matches: query === '(prefers-color-scheme: dark)',
                media: query,
                onchange: null,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            }))
        })

        const store = useThemeStore()
        expect(store.theme).toBe('dark')
    })

    it('initializes with stored theme if present', () => {
        localStorage.setItem('theme', 'dark')
        const store = useThemeStore()
        expect(store.theme).toBe('dark')
    })

    it('toggles theme correctly', () => {
        const store = useThemeStore()
        expect(store.theme).toBe('light')
        store.toggleTheme()
        expect(store.theme).toBe('dark')
        store.toggleTheme()
        expect(store.theme).toBe('light')
    })

    it('persists theme to localStorage on toggle', async () => {
        const store = useThemeStore()
        store.toggleTheme()
        await nextTick()
        expect(localStorage.getItem('theme')).toBe('dark')
    })

    it('applies theme to document on toggle', async () => {
        const store = useThemeStore()
        store.toggleTheme()
        await nextTick()
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    })

    it('sets theme explicitly', () => {
        const store = useThemeStore()
        store.setTheme('dark')
        expect(store.theme).toBe('dark')
        store.setTheme('light')
        expect(store.theme).toBe('light')
    })
})
