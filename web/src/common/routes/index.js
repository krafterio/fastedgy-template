import { bus } from 'vue-fastedgy';
import { useAuthStore } from 'vue-fastedgy';

export function useAuthRouterGuard(router) {
  router.beforeEach(async (to) => {
    const authStore = useAuthStore();

    await authStore.checkUser();

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      return { name: 'Login' };
    }

    if (to.meta.requiresGuest && authStore.isAuthenticated) {
      return { name: 'Home' };
    }

    return true;
  });

  bus.addEventListener('auth:logged', async () => {
    router.push({ name: 'Home' }).then();
  });

  bus.addEventListener('auth:logout', async () => {
    router.push({ name: 'Login' }).then();
  });
}
