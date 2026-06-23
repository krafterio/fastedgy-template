import { useAuthRouterGuard } from '@/common/routes';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Root',
      redirect: '/home',
      meta: { requiresAuth: true },
    },
    {
      path: '/home',
      name: 'Home',
      component: () => import('@/main/views/HomeView.vue'),
      meta: { requiresAuth: true, title: 'Accueil' },
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/common/views/auth/LoginView.vue'),
      meta: { requiresGuest: true, title: 'Connexion' },
    },
    {
      path: '/password/forgot',
      name: 'PasswordForgot',
      component: () => import('@/common/views/auth/ForgotPasswordView.vue'),
      meta: { requiresGuest: true, title: 'Mot de passe oublié' },
    },
    {
      path: '/password/reset',
      name: 'PasswordReset',
      component: () => import('@/common/views/auth/ResetPasswordView.vue'),
      meta: {
        requiresGuest: true,
        title: 'Réinitialiser le mot de passe',
      },
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
