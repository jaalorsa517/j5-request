import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import MainLayout from './MainLayout.vue'
import { useThemeStore } from '../stores/theme'

// Mock child components
const FileTree = { template: '<div class="file-tree">FileTree</div>' }
const RequestPanel = { template: '<div class="request-panel">RequestPanel</div>' }
const ResponsePanel = { template: '<div class="response-panel">ResponsePanel</div>' }
const GitPanel = { template: '<div class="git-panel">GitPanel</div>' }
const DiffEditor = { template: '<div class="diff-editor">DiffEditor</div>' }
const EnvironmentSelector = { template: '<div class="env-selector">EnvironmentSelector</div>' }
const EnvironmentManagerModal = { template: '<div class="env-modal">EnvironmentManagerModal</div>' }

describe('MainLayout Theme Toggle', () => {
    beforeEach(() => {
        // Mock window.electron
        (window as any).electron = {
            fs: {
                selectFolder: vi.fn(),
                readFile: vi.fn(),
                createRequest: vi.fn(),
                selectFile: vi.fn(),
                getGlobalsPath: vi.fn().mockResolvedValue('/tmp/globals.json'),
                readGlobals: vi.fn().mockResolvedValue([]),
            },
            git: {
                getFileContent: vi.fn(),
            }
        }
    })

    it('renders theme toggle button', () => {
        const wrapper = mount(MainLayout, {
            global: {
                plugins: [createTestingPinia({ createSpy: vi.fn })],
                stubs: {
                    FileTree,
                    RequestPanel,
                    ResponsePanel,
                    GitPanel,
                    DiffEditor,
                    EnvironmentSelector,
                    EnvironmentManagerModal
                }
            }
        })

        const toggleBtn = wrapper.findAll('.activityBar__item').find(b => b.attributes('title') === 'Toggle Theme')
        expect(toggleBtn?.exists()).toBe(true)
    })

    it('calls toggleTheme when button is clicked', async () => {
        const wrapper = mount(MainLayout, {
            global: {
                plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })],
                stubs: {
                    FileTree,
                    RequestPanel,
                    ResponsePanel,
                    GitPanel,
                    DiffEditor,
                    EnvironmentSelector,
                    EnvironmentManagerModal
                }
            }
        })

        const themeStore = useThemeStore()

        const toggleBtn = wrapper.findAll('.activityBar__item').find(b => b.attributes('title') === 'Toggle Theme')
        await toggleBtn?.trigger('click')

        expect(themeStore.toggleTheme).toHaveBeenCalled()
    })

    it('displays moon icon when theme is light', () => {
        const wrapper = mount(MainLayout, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        theme: { theme: 'light' }
                    }
                })],
                stubs: {
                    FileTree,
                    RequestPanel,
                    ResponsePanel,
                    GitPanel,
                    DiffEditor,
                    EnvironmentSelector,
                    EnvironmentManagerModal
                }
            }
        })

        const toggleBtn = wrapper.findAll('.activityBar__item').find(b => b.attributes('title') === 'Toggle Theme')
        expect(toggleBtn?.text()).toBe('🌙')
    })

    it('displays sun icon when theme is dark', () => {
        const wrapper = mount(MainLayout, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        theme: { theme: 'dark' }
                    }
                })],
                stubs: {
                    FileTree,
                    RequestPanel,
                    ResponsePanel,
                    GitPanel,
                    DiffEditor,
                    EnvironmentSelector,
                    EnvironmentManagerModal
                }
            }
        })

        const toggleBtn = wrapper.findAll('.activityBar__item').find(b => b.attributes('title') === 'Toggle Theme')
        expect(toggleBtn?.text()).toBe('☀️')
    })
})
