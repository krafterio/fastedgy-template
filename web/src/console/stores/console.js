import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { useAuthStore } from 'vue-fastedgy';
import { useConsoleInfoApi } from '@/console/composables/api/console_info';

export const useConsoleStore = defineStore('console', () => {
  const loading = ref(false);
  const error = ref(null);
  const authStore = useAuthStore();
  const consoleInfoApi = useConsoleInfoApi();
  const info = ref(null);

  async function fetchAdmin() {
    if (!authStore.isAuthenticated || loading.value) {
      return;
    }

    loading.value = true;
    error.value = null;
    const baseUrl = window.location.origin;

    try {
      info.value = await consoleInfoApi.read();

      if (info.value.type === 'user') {
        window.location.href = baseUrl;
      }
    } catch (err) {
      if (err.response.status === 403) {
        window.location.href = baseUrl;
      }

      error.value = err;
    } finally {
      loading.value = false;
    }
  }

  watch(
    () => authStore.user,
    async (user) => {
      if (user) {
        await fetchAdmin();
      }
    }
  );

  return {
    loading,
    error,
    fetchAdmin,
  };
});
