import { createFetcher, createI18nExtra } from 'vue-fastedgy';
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from '@/console/App.vue';
import router from '@/console/routes';
import '@/common/styles/main.css';

const app = createApp(App);
const pinia = createPinia();
const fetcher = createFetcher({ surface: 'console' });
const i18n = createI18nExtra({ availableLocales: ['fr'] });

app.use(pinia);
app.use(fetcher);
app.use(i18n);
app.use(router);

app.mount('#app');
