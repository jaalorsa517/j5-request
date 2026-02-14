/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import HelloWorld from '@/renderer/components/HelloWorld.vue';

describe('HelloWorld.vue', () => {
    it('renders props.msg when passed', () => {
        const msg = 'new message';
        const wrapper = mount(HelloWorld, {
            props: { msg }
        });
        expect(wrapper.text()).toMatch(msg);
    });

    it('increments count when button is clicked', async () => {
        const wrapper = mount(HelloWorld, {
            props: { msg: 'Test' }
        });

        const button = wrapper.find('button');
        expect(button.text()).toContain('count is 0');

        await button.trigger('click');
        expect(button.text()).toContain('count is 1');
    });
});
