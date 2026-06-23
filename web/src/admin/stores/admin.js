import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { useAuthStore } from 'vue-fastedgy';
import { useFetcherService } from 'vue-fastedgy';

export const useAdminStore = defineStore('admin', () => {
  const loading = ref(false);
  const error = ref(null);
  const authStore = useAuthStore();
  const fetcher = useFetcherService();
  const info = ref(null);

  async function fetchAdmin() {
    if (!authStore.isAuthenticated || loading.value) {
      return;
    }

    loading.value = true;
    error.value = null;
    const baseUrl = window.location.origin;

    try {
      const res = await fetcher.get(`/admin/info`);
      info.value = res.data;

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
