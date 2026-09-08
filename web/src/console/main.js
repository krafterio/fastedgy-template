import { createFetcher, createI18nExtra } from 'vue-fastedgy';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import { createApp } from 'vue';
import App from '@/console/App.vue';
import router from '@/console/routes';
import '@/common/styles/main.css';

const app = createApp(App);
const pinia = createPinia();
const fetcher = createFetcher({ surface: 'console' });
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

app.mount('#app');
