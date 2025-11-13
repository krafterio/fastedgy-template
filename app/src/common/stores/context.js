import { defineStore } from "pinia";
import { computed } from "vue";
import { useAuthStore } from "vue-fastedgy";

export const useContextStore = defineStore("context", () => {
    const authStore = useAuthStore();
    const user = computed(() => authStore.user);
    const userType = computed(() => user.value?.role || "user");
    const loading = computed(() => authStore.loading);

    return {
        user,
        userType,
        loading,
    };
});
