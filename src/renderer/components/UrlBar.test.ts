/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import UrlBar from './UrlBar.vue';
import { useRequestStore } from '../stores/request';

describe('UrlBar.vue', () => {
    let pinia: any;

    beforeEach(() => {
        pinia = createTestingPinia({
            createSpy: vi.fn,
            initialState: {
                request: {
                    method: 'GET',
                    url: '',
                    isLoading: false,
                },
            },
        });
    });

    it('renders correctly', () => {
        const wrapper = mount(UrlBar, {
            global: {
                plugins: [pinia],
            },
        });
        expect(wrapper.find('select').exists()).toBe(true);
        expect(wrapper.find('input').exists()).toBe(true);
        expect(wrapper.find('button').exists()).toBe(true);
    });

    it('updates method in store when changed', async () => {
        const wrapper = mount(UrlBar, {
            global: {
                plugins: [pinia],
            },
        });
        const store = useRequestStore();

        const select = wrapper.find('select');
        await select.setValue('POST');

        expect(store.method).toBe('POST');
    });

    it('updates url in store when input', async () => {
        const wrapper = mount(UrlBar, {
            global: {
                plugins: [pinia],
            },
        });
        const store = useRequestStore();

        const input = wrapper.find('input');
        await input.setValue('https://api.test');

        expect(store.url).toBe('https://api.test');
    });

    it('disables button when no url', () => {
        const wrapper = mount(UrlBar, {
            global: {
                plugins: [pinia],
            },
        });
        const button = wrapper.find('button');
        expect(button.element.disabled).toBe(true);
    });

    it('enables button when url exists', async () => {
        const wrapper = mount(UrlBar, {
            global: {
                plugins: [pinia],
            },
        });
        const store = useRequestStore();
        store.url = 'http://test.com';
        store.isLoading = false;
        await wrapper.vm.$nextTick();

        const button = wrapper.find('button');
        expect(button.element.disabled).toBe(false);
    });

    it('disabled button when loading', async () => {
        const wrapper = mount(UrlBar, {
            global: {
                plugins: [pinia],
            },
        });
        const store = useRequestStore();
        store.url = 'http://test.com';
        store.isLoading = true;
        await wrapper.vm.$nextTick();

        const button = wrapper.find('button');
        expect(button.element.disabled).toBe(true);
        expect(button.text()).toBe('Enviando...');
    });

    it('calls store.execute on send', async () => {
        const wrapper = mount(UrlBar, {
            global: {
                plugins: [pinia],
            },
        });
        const store = useRequestStore();
        store.url = 'http://test.com';
        store.isLoading = false;
        await wrapper.vm.$nextTick();

        await wrapper.find('button').trigger('click');
        expect(store.execute).toHaveBeenCalled();
    });
});
