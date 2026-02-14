/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import EnvironmentManagerModal from './EnvironmentManagerModal.vue';
import { useEnvironmentStore } from '../stores/environment';

// Mock electron
if (typeof window !== 'undefined') {
    (window as any).electron = {
        fs: {
            getGlobalsPath: vi.fn().mockResolvedValue('/mock/globals.json'),
            readFile: vi.fn().mockResolvedValue({ variables: [] }),
            writeFile: vi.fn().mockResolvedValue(undefined),
            saveFileDialog: vi.fn()
        }
    };
}

describe('EnvironmentManagerModal.vue', () => {
    it('renders and allows adding variables', async () => {
        const pinia = createTestingPinia({
            createSpy: vi.fn,
            initialState: {
                environment: {
                    globals: { id: 'g', name: 'Globals', variables: [] },
                    activeEnvironment: { id: 'a', name: 'Active', variables: [] },
                    showManager: true
                }
            }
        });

        const wrapper = mount(EnvironmentManagerModal, {
            global: { plugins: [pinia] }
        });

        const store = useEnvironmentStore();

        // Check initial state
        expect(wrapper.text()).toContain('Environment Manager');
        
        // Add a variable
        const keyInput = wrapper.find('input[placeholder="New Key"]');
        const valInput = wrapper.find('input[placeholder="Value"]');
        
        await keyInput.setValue('TEST_KEY');
        await valInput.setValue('TEST_VALUE');
        await wrapper.find('.new-row button').trigger('click');

        expect(store.activeEnvironment?.variables).toHaveLength(1);
        expect(store.activeEnvironment?.variables[0].key).toBe('TEST_KEY');
    });

    it('switches between globals and environment', async () => {
        const pinia = createTestingPinia({
            createSpy: vi.fn,
            initialState: {
                environment: {
                    globals: { id: 'g', name: 'Globals', variables: [] },
                    activeEnvironment: { id: 'a', name: 'Active', variables: [] },
                    showManager: true
                }
            }
        });

        const wrapper = mount(EnvironmentManagerModal, {
            global: { plugins: [pinia] }
        });

        const sidebarItems = wrapper.findAll('.scope-item');
        
        // Switch to Globals
        await sidebarItems[0].trigger('click');
        expect(wrapper.text()).toContain('Global Variables');

        // Switch to Active Env
        await sidebarItems[1].trigger('click');
        expect(wrapper.text()).toContain('Name:');
    });

    it('calls save on both scopes', async () => {
        const pinia = createTestingPinia({
            createSpy: vi.fn,
            initialState: {
                environment: {
                    globals: { id: 'g', name: 'Globals', variables: [] },
                    activeEnvironment: { id: 'a', name: 'Active', variables: [] },
                    showManager: true
                }
            }
        });

        const wrapper = mount(EnvironmentManagerModal, {
            global: { plugins: [pinia] }
        });

        const store = useEnvironmentStore();
        const saveBtn = wrapper.findAll('button').find(b => b.text() === 'Save');

        // Save Active Env
        await saveBtn?.trigger('click');
        expect(store.saveActiveEnvironment).toHaveBeenCalled();

        // Switch to Globals and save
        await wrapper.findAll('.scope-item')[0].trigger('click');
        await saveBtn?.trigger('click');
        expect(store.saveGlobals).toHaveBeenCalled();
    });

    it('removes variables', async () => {
        const pinia = createTestingPinia({
            createSpy: vi.fn,
            initialState: {
                environment: {
                    activeEnvironment: { 
                        id: 'a', 
                        name: 'Active', 
                        variables: [{ key: 'K', value: 'V', enabled: true, type: 'default' }] 
                    },
                    showManager: true
                }
            }
        });

        const wrapper = mount(EnvironmentManagerModal, {
            global: { plugins: [pinia] }
        });

        const store = useEnvironmentStore();
        await wrapper.find('.vars-row .col-actions button').trigger('click');

        expect(store.activeEnvironment?.variables).toHaveLength(0);
    });
});
