import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import { Badge } from '@/common/components/ui/badge';

describe('Badge', () => {
  it('renders its default slot content', () => {
    const wrapper = mount(Badge, { slots: { default: 'New' } });

    expect(wrapper.text()).toBe('New');
    expect(wrapper.attributes('data-slot')).toBe('badge');
  });

  it('applies the default variant classes', () => {
    const wrapper = mount(Badge, { slots: { default: 'x' } });

    expect(wrapper.classes()).toContain('bg-primary');
  });

  it('applies the requested variant classes', () => {
    const wrapper = mount(Badge, {
      props: { variant: 'destructive' },
      slots: { default: 'x' },
    });

    expect(wrapper.classes()).toContain('bg-destructive');
  });

  it('merges a custom class', () => {
    const wrapper = mount(Badge, {
      props: { class: 'custom-class' },
      slots: { default: 'x' },
    });

    expect(wrapper.classes()).toContain('custom-class');
  });
});
