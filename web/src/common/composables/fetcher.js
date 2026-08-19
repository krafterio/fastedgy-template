import { absoluteUrl, fetchBus } from 'vue-fastedgy';
import { useContextStore } from '@/common/stores/context';

export const useAppContextFetch = () => {
  fetchBus.addEventListener('fetch:request', async (e) => {
    e.detail.url = absoluteUrl(e.detail.url);

    if (e.detail.url.includes('/{app}/')) {
      const contextStore = useContextStore();

      if (contextStore.loading) {
        await new Promise((resolve) => {
          const unwatch = contextStore.$subscribe((mutation, state) => {
            if (!state.loading) {
              unwatch();
              resolve();
            }
          });
        });
      }

      // URL surface derived from the user role: `user` -> business app, `admin` -> console.
      const surfaceByRole = { user: '/app/', admin: '/console/' };
      const valPath = surfaceByRole[contextStore.userType] ?? `/${contextStore.userType}/`;

      e.detail.url = e.detail.url.replace('/{app}/', valPath);
    }
  });
};
