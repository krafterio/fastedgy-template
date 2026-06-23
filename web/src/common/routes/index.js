import { bus } from 'vue-fastedgy';
import { useAuthStore } from 'vue-fastedgy';

export function useAuthRouterGuard(router) {
  router.beforeEach(async (to, _, next) => {
    const authStore = useAuthStore();
    let guard = undefined;

    await authStore.checkUser();

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      guard = { name: 'Login' };
    } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
      guard = { name: 'Home' };
    }

    next(guard);
  });

  bus.addEventListener('auth:logged', async () => {
    router.push({ name: 'Home' }).then();
  });

  bus.addEventListener('auth:logout', async () => {
    router.push({ name: 'Login' }).then();
  });
}
