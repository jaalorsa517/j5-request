/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import EnvironmentManagerModal from '@/renderer/components/EnvironmentManagerModal.vue';
import { useEnvironmentStore } from '@/renderer/stores/environment';

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
    beforeEach(() => {
        vi.clearAllMocks();
    });

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
        expect(wrapper.text()).toContain('Gestor de Entornos');

        // Switch to Active Env
        await wrapper.findAll('.envModal__scopeItem')[1].trigger('click');
        
        // Add a variable
        const keyInput = wrapper.find('input[placeholder="Nueva clave..."]');
        const valInput = wrapper.find('input[placeholder="Valor..."]');
        
        await keyInput.setValue('TEST_KEY');
        await valInput.setValue('TEST_VALUE');
        await wrapper.find('.envModal__row--new .envModal__rowBtn').trigger('click');

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

        const sidebarItems = wrapper.findAll('.envModal__scopeItem');
        
        // Switch to Globals (already default, but trigger anyway)
        await sidebarItems[0].trigger('click');
        expect(wrapper.text()).toContain('Variables Globales');

        // Switch to Active Env
        await sidebarItems[1].trigger('click');
        expect(wrapper.text()).toContain('Nombre:');
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
        const saveBtn = wrapper.findAll('button').find(b => b.text() === 'Guardar Cambios');

        // Switch to Active Env and save
        await wrapper.findAll('.envModal__scopeItem')[1].trigger('click');
        await saveBtn?.trigger('click');
        expect(store.saveActiveEnvironment).toHaveBeenCalled();

        // Switch to Globals and save
        await wrapper.findAll('.envModal__scopeItem')[0].trigger('click');
        await saveBtn?.trigger('click');
        expect(store.saveGlobals).toHaveBeenCalled();

        // Add variable to globals
        await wrapper.find('input[placeholder="Nueva clave..."]').setValue('G_KEY');
        await wrapper.find('.envModal__row--new .envModal__rowBtn').trigger('click');
        expect(store.globals.variables).toHaveLength(1);

        // Remove variable from globals
        await wrapper.find('.envModal__row .envModal__col--actions .envModal__rowBtn').trigger('click');
        expect(store.globals.variables).toHaveLength(0);
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

        // Switch to Active Env
        await wrapper.findAll('.envModal__scopeItem')[1].trigger('click');
        
        // Toggle enabled
        const checkbox = wrapper.find('.envModal__row input[type="checkbox"]');
        await checkbox.setValue(false);
        expect(store.activeEnvironment?.variables[0].enabled).toBe(false);

        // Change key
        const keyInput = wrapper.findAll('.envModal__row input').find(i => (i.element as any).value === 'K');
        await keyInput?.setValue('K2');
        expect(store.activeEnvironment?.variables[0].key).toBe('K2');

        // Change value
        const valInput = wrapper.find('.envModal__col--value input');
        await valInput.setValue('V2');
        expect(store.activeEnvironment?.variables[0].value).toBe('V2');

        // Change type
        const typeSelect = wrapper.find('.envModal__row select');
        await typeSelect.setValue('secret');
        expect(store.activeEnvironment?.variables[0].type).toBe('secret');

        // Remove
        await wrapper.find('.envModal__row .envModal__col--actions .envModal__rowBtn').trigger('click');
        expect(store.activeEnvironment?.variables).toHaveLength(0);
    });

    it('updates active environment name', async () => {
        const pinia = createTestingPinia({
            createSpy: vi.fn,
            initialState: {
                environment: { 
                    activeEnvironment: { id: 'a', name: 'Old', variables: [] },
                    showManager: true 
                }
            }
        });
        const wrapper = mount(EnvironmentManagerModal, { global: { plugins: [pinia] } });
        const store = useEnvironmentStore();
        
        // Switch to Active Env first because initial scope is globals
        await wrapper.findAll('.envModal__scopeItem')[1].trigger('click');
        
        const nameInput = wrapper.find('.envModal__info input');
        await nameInput.setValue('New');
        expect(store.activeEnvironment?.name).toBe('New');
    });

    it('handles new variable secret toggle', async () => {
        const pinia = createTestingPinia({
            createSpy: vi.fn,
            initialState: {
                environment: { 
                    activeEnvironment: { id: 'a', name: 'A', variables: [] }, 
                    showManager: true 
                }
            }
        });
        const wrapper = mount(EnvironmentManagerModal, { global: { plugins: [pinia] } });

        // Switch to Active Env
        await wrapper.findAll('.envModal__scopeItem')[1].trigger('click');
        
        const secretSelect = wrapper.find('.envModal__row--new select');
        await secretSelect.setValue('true'); 
        
        await wrapper.find('input[placeholder="Nueva clave..."]').setValue('SK');
        await wrapper.find('.envModal__row--new .envModal__rowBtn').trigger('click');
        
        const store = useEnvironmentStore();
        expect(store.activeEnvironment?.variables[0].type).toBe('secret');
    });

    it('handles close environment button', async () => {
        const pinia = createTestingPinia({
            createSpy: vi.fn,
            initialState: {
                environment: { 
                    activeEnvironment: { id: 'a', name: 'A', variables: [] }, 
                    showManager: true 
                }
            }
        });
        const wrapper = mount(EnvironmentManagerModal, { global: { plugins: [pinia] } });
        
        // Switch to Active Env
        await wrapper.findAll('.envModal__scopeItem')[1].trigger('click');
        
        const store = useEnvironmentStore();
        
        await wrapper.find('.envModal__footer button').trigger('click');
        expect(store.closeEnvironment).toHaveBeenCalled();
    });

    it('handles auto-add variable on save', async () => {
        const pinia = createTestingPinia({
            createSpy: vi.fn,
            initialState: {
                environment: {
                    activeEnvironment: { id: 'a', name: 'A', variables: [] },
                    showManager: true
                }
            }
        });

        const wrapper = mount(EnvironmentManagerModal, {
            global: { plugins: [pinia] }
        });

        // Switch to Active Env
        await wrapper.findAll('.envModal__scopeItem')[1].trigger('click');

        await wrapper.find('input[placeholder="Nueva clave..."]').setValue('AUTO_KEY');
        await wrapper.findAll('button').find(b => b.text() === 'Guardar Cambios')?.trigger('click');

        const store = useEnvironmentStore();
        expect(store.activeEnvironment?.variables).toHaveLength(1);
        expect(store.activeEnvironment?.variables[0].key).toBe('AUTO_KEY');
    });

    it('handles enter key on inputs', async () => {
        const pinia = createTestingPinia({
            createSpy: vi.fn,
            initialState: {
                environment: {
                    activeEnvironment: { id: 'a', name: 'A', variables: [] },
                    showManager: true
                }
            }
        });
        const wrapper = mount(EnvironmentManagerModal, { global: { plugins: [pinia] } });
        
        // Switch to Active Env
        await wrapper.findAll('.envModal__scopeItem')[1].trigger('click');

        const input = wrapper.find('input[placeholder="Nueva clave..."]');
        await input.setValue('KEY');
        await input.trigger('keyup.enter');
        
        const store = useEnvironmentStore();
        expect(store.activeEnvironment?.variables).toHaveLength(1);
    });

    it('handles close button', async () => {
        const pinia = createTestingPinia({ createSpy: vi.fn });
        const wrapper = mount(EnvironmentManagerModal, { global: { plugins: [pinia] } });
        const store = useEnvironmentStore();
        
        await wrapper.find('.envModal__close').trigger('click');
        expect(store.showManager).toBe(false);
    });

    it('handles error in addVariable', async () => {
        const pinia = createTestingPinia({
            createSpy: vi.fn,
            initialState: {
                environment: {
                    activeEnvironment: { id: 'a', name: 'A', variables: [] },
                    showManager: true
                }
            }
        });
        const wrapper = mount(EnvironmentManagerModal, { global: { plugins: [pinia] } });
        const store = useEnvironmentStore();

        // Switch to Active Env
        await wrapper.findAll('.envModal__scopeItem')[1].trigger('click');
        
        // Make variables.push throw
        Object.defineProperty(store.activeEnvironment, 'variables', {
            get: () => ({
                push: () => { throw new Error('push fail'); }
            })
        });

        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        await wrapper.find('input[placeholder="Nueva clave..."]').setValue('KEY');
        await wrapper.find('.envModal__row--new .envModal__rowBtn').trigger('click');

        expect(alertSpy).toHaveBeenCalledWith('Failed to add variable');
        
        alertSpy.mockRestore();
        consoleSpy.mockRestore();
    });

    it('handles error in save', async () => {
        const pinia = createTestingPinia({
            createSpy: vi.fn,
            initialState: {
                environment: {
                    globals: { id: 'g', variables: [] },
                    showManager: true
                }
            }
        });
        const wrapper = mount(EnvironmentManagerModal, { global: { plugins: [pinia] } });
        const store = useEnvironmentStore();
        
        (store.saveGlobals as any).mockRejectedValue(new Error('save fail'));
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

        // Switch to globals
        await wrapper.findAll('.envModal__scopeItem')[0].trigger('click');
        await wrapper.findAll('button').find(b => b.text() === 'Guardar Cambios')?.trigger('click');
        await flushPromises();

        expect(alertSpy).toHaveBeenCalledWith('Error saving: save fail');
        alertSpy.mockRestore();
    });

    it('returns early in save if no active env and scope is environment', async () => {
        const pinia = createTestingPinia({
            createSpy: vi.fn,
            initialState: {
                environment: { 
                    activeEnvironment: null, 
                    globals: { id: 'g', variables: [] },
                    showManager: true 
                }
            }
        });
        const wrapper = mount(EnvironmentManagerModal, { global: { plugins: [pinia] } });
        const store = useEnvironmentStore();
        
        // Call save directly to test early return logic without triggering JSDOM render crashes
        await (wrapper.vm as any).save();
        
        expect(store.saveActiveEnvironment).not.toHaveBeenCalled();
    });
});
