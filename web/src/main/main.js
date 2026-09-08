import { createFetcher } from 'vue-fastedgy';
import { createI18nExtra } from 'vue-fastedgy';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import { createApp } from 'vue';
import App from '@/main/App.vue';
import router from '@/main/routes';
import '@/common/styles/main.css';

const app = createApp(App);
const pinia = createPinia();
const fetcher = createFetcher({ surface: 'app' });
const i18n = createI18n({
  legacy: false,
  locale: 'fr',
  fallbackLocale: 'fr',
  availableLocales: ['fr'],
  fallbackFormat: true,
});
const i18nExtra = createI18nExtra(i18n);

app.use(pinia);
app.use(fetcher);
app.use(i18n);
app.use(i18nExtra);
app.use(router);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(() => console.log('ServiceWorker registered'))
      .catch(() => console.log('Error Service Worker'));
  });
}

app.mount('#app');
