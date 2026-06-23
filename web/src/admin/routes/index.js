import { createRouter, createWebHistory } from 'vue-router';
import { useAuthRouterGuard } from '@/common/routes';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL + 'admin'),
  routes: [
    {
      path: '/',
      name: 'Root',
      redirect: '/home',
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/common/views/auth/LoginView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/password/forgot',
      name: 'PasswordForgot',
      component: () => import('@/common/views/auth/ForgotPasswordView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/home',
      name: 'Home',
      component: () => import('@/admin/views/HomeView.vue'),
      meta: { requiresAuth: true, title: 'Accueil' },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/common/views/404.vue'),
      meta: { requiresAuth: true },
    },
  ],
});

useAuthRouterGuard(router);

export default router;
