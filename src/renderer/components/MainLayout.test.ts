/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import MainLayout from './MainLayout.vue';

// Mock all heavy child components
vi.mock('./FileTree.vue', () => ({ default: { template: '<div>FileTree</div>' } }));
vi.mock('./RequestPanel.vue', () => ({ default: { template: '<div>RequestPanel</div>' } }));
vi.mock('./ResponsePanel.vue', () => ({ default: { template: '<div>ResponsePanel</div>' } }));
vi.mock('./git/GitPanel.vue', () => ({ default: { template: '<div>GitPanel</div>' } }));
vi.mock('./git/DiffEditor.vue', () => ({ default: { template: '<div>DiffEditor</div>' } }));
vi.mock('./EnvironmentSelector.vue', () => ({ default: { template: '<div>EnvSelector</div>' } }));
vi.mock('./EnvironmentManagerModal.vue', () => ({ default: { template: '<div>EnvManager</div>' } }));
vi.mock('./RequestTabBar.vue', () => ({ default: { template: '<div>TabBar</div>' } }));

// Mock heavy dependencies
if (typeof window !== 'undefined') {
    (window as any).electron = {
        fs: {
            selectFolder: vi.fn(),
            getGlobalsPath: vi.fn().mockResolvedValue('/mock/globals.json'),
            readFile: vi.fn().mockResolvedValue({ variables: [] }),
            writeFile: vi.fn(),
        },
        git: {
            getFileContent: vi.fn(),
        }
    };
}

describe('MainLayout.vue', () => {
    it('renders sidebar and workspace', () => {
        const pinia = createTestingPinia({
            createSpy: vi.fn,
            initialState: {
                'file-system': { rootEntry: [], currentPath: null, selectedFile: null },
                request: { isDirty: false },
                environment: { showManager: false }
            }
        });

        const wrapper = mount(MainLayout, {
            global: { plugins: [pinia] }
        });

        expect(wrapper.find('.activityBar').exists()).toBe(true);
        expect(wrapper.find('.mainLayout__sidebar').exists()).toBe(true);
        expect(wrapper.find('.mainLayout__workspace').exists()).toBe(true);
    });

    it('switches between explorer and git activities', async () => {
        const pinia = createTestingPinia({ createSpy: vi.fn });
        const wrapper = mount(MainLayout, { global: { plugins: [pinia] } });

        const buttons = wrapper.findAll('.activityBar__item');
        
        // Switch to Git
        await buttons[1].trigger('click');
        expect(wrapper.text()).toContain('GitPanel');
        expect(wrapper.text()).not.toContain('Open'); // Header part of explorer

        // Switch back to Explorer
        await buttons[0].trigger('click');
        expect(wrapper.text()).toContain('FileTree');
        expect(wrapper.text()).toContain('Open');
    });
});
