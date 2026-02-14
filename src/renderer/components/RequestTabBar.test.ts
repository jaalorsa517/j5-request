// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import RequestTabBar from './RequestTabBar.vue';
import { useRequestStore } from '../stores/request';

describe('RequestTabBar', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    it('should render tabs from store', () => {
        const store = useRequestStore();
        // Add some mock tabs
        store.tabs = [
            { id: '1', name: 'Tab 1', request: { method: 'GET' } as any, isDirty: false } as any,
            { id: '2', name: 'Tab 2', request: { method: 'POST' } as any, isDirty: true } as any
        ];
        store.activeTabId = '1';

        const wrapper = mount(RequestTabBar);

        const tabs = wrapper.findAll('.requestTabBar__tab');
        expect(tabs.length).toBe(2);
        expect(tabs[0].text()).toContain('Tab 1');
        expect(tabs[0].text()).toContain('GET');
        expect(tabs[0].find('.dirty-marker').exists()).toBe(false);
        expect(tabs[1].text()).toContain('Tab 2');
        expect(tabs[1].text()).toContain('POST');
        expect(tabs[1].find('.dirty-marker').exists()).toBe(true);
    });

    it('should highlight active tab', () => {
        const store = useRequestStore();
        store.tabs = [
            { id: '1', name: 'Tab 1', request: { method: 'GET' } as any } as any,
            { id: '2', name: 'Tab 2', request: { method: 'POST' } as any } as any
        ];
        store.activeTabId = '2';

        const wrapper = mount(RequestTabBar);

        const tabs = wrapper.findAll('.requestTabBar__tab');
        expect(tabs[1].classes()).toContain('requestTabBar__tab--active');
        expect(tabs[0].classes()).not.toContain('requestTabBar__tab--active');
    });

    it('should call setActiveTab on click', async () => {
        const store = useRequestStore();
        store.setActiveTab = vi.fn();
        store.tabs = [
            { id: '1', name: 'Tab 1', request: { method: 'GET' } as any } as any,
            { id: '2', name: 'Tab 2', request: { method: 'POST' } as any } as any
        ];

        const wrapper = mount(RequestTabBar);
        const tabs = wrapper.findAll('.requestTabBar__tab');

        await tabs[1].trigger('click');

        expect(store.setActiveTab).toHaveBeenCalledWith('2');
    });

    it('should call closeTab on close button click', async () => {
        const store = useRequestStore();
        store.closeTab = vi.fn();
        store.tabs = [
            { id: '1', name: 'Tab 1', request: { method: 'GET' } as any } as any
        ];

        const wrapper = mount(RequestTabBar);
        const closeBtn = wrapper.find('.requestTabBar__close');

        await closeBtn.trigger('click');

        expect(store.closeTab).toHaveBeenCalledWith('1');
    });

    it('should call addTab on new button click', async () => {
        const store = useRequestStore();
        store.addTab = vi.fn();

        const wrapper = mount(RequestTabBar);
        const newBtn = wrapper.find('.requestTabBar__new');

        await newBtn.trigger('click');

        expect(store.addTab).toHaveBeenCalled();
    });
});
