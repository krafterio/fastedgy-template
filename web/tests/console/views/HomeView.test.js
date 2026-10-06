import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import HomeView from '@/console/views/HomeView.vue';

describe('HomeView', () => {
  it('gives its title printable ASCII class names only', () => {
    const classes = mount(HomeView).get('h1').classes();

    expect(classes.filter((name) => !/^[\x21-\x7e]+$/.test(name))).toEqual([]);
  });
});
