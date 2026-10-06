import { createFetcher, createI18nExtra } from 'vue-fastedgy';
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from '@/main/App.vue';
import router from '@/main/routes';
import '@/common/styles/main.css';

const app = createApp(App);
const pinia = createPinia();
const fetcher = createFetcher({ surface: 'app' });
const i18n = createI18nExtra({ availableLocales: ['fr'] });

app.use(pinia);
app.use(fetcher);
app.use(i18n);
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
