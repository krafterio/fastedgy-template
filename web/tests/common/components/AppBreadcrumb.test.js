import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { createMemoryHistory, createRouter } from 'vue-router';
import AppBreadcrumb from '@/common/components/AppBreadcrumb.vue';

const Page = { template: '<div />' };

async function mountAt(path) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'Home', component: Page, meta: { title: 'Accueil' } },
      { path: '/users', name: 'Users', component: Page, meta: { title: 'Utilisateurs', parent: 'Home' } },
      { path: '/users/:id', name: 'User', component: Page, meta: { title: 'Utilisateur', parent: 'Users' } },
    ],
  });

  await router.push(path);

  return mount(AppBreadcrumb, { global: { plugins: [router] } });
}

describe('AppBreadcrumb', () => {
  it('names the current page once, after its parents', async () => {
    const wrapper = await mountAt('/users/1');

    expect(wrapper.findAll('[data-slot="breadcrumb-item"]').map((item) => item.text())).toEqual([
      'Accueil',
      'Utilisateurs',
      'Utilisateur',
    ]);
  });

  it('links each parent through a single anchor', async () => {
    const wrapper = await mountAt('/users/1');

    expect(wrapper.findAll('a').map((link) => link.text())).toEqual(['Accueil', 'Utilisateurs']);
    expect(wrapper.findAll('a a')).toHaveLength(0);
  });
});
