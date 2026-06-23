import { createFetcher, createI18nExtra } from 'vue-fastedgy';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import { createApp } from 'vue';
import App from '@/admin/App.vue';
import router from '@/admin/routes';
import { useAppContextFetch } from '@/common/composables/fetcher';
import '@/common/styles/main.css';

const app = createApp(App);
const pinia = createPinia();
const fetcher = createFetcher();
const i18n = createI18n({
  legacy: false,
  locale: 'fr',
  fallbackLocale: 'fr',
  availableLocales: ['fr'],
  fallbackFormat: true,
});
const i18nExtra = createI18nExtra(i18n);

useAppContextFetch();

app.use(pinia);
app.use(fetcher);
app.use(i18n);
app.use(i18nExtra);
app.use(router);

app.mount('#app');
