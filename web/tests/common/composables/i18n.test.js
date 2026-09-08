/**
 * The setup file itself, under test.
 *
 * A component using `$t()` or `v-tc` mounts only if `vitest.setup.js` installed
 * both plugins. Without this, the day the setup breaks, every component test
 * fails at once with a directive error and nothing says why.
 */

import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

describe('i18n test setup', () => {
  it('renders a `$t()` call, falling back to the key', () => {
    const wrapper = mount({ template: '<span>{{ $t(`Save`) }}</span>' });

    expect(wrapper.text()).toBe('Save');
  });

  it('renders free text carried by the `v-tc` directive', () => {
    const wrapper = mount({ template: '<p v-tc>Welcome to our platform</p>' });

    expect(wrapper.text()).toBe('Welcome to our platform');
  });
});
