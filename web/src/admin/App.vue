<template>
  <div id="app" class="h-screen overflow-hidden bg-background text-foreground flex flex-col">
    <template v-if="authStore.isAuthenticated">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset class="flex flex-col min-h-0">
          <header class="flex h-12 shrink-0 items-center justify-between gap-2 px-4 sticky top-0 z-10">
            <div class="flex items-center gap-2">
              <SidebarTrigger class="-ml-1" />
              <div class="h-4 w-px bg-border mr-2"></div>
              <AppBreadcrumb />
            </div>

            <div class="flex items-center gap-2">
              <!-- Right side of header -->
            </div>
          </header>
          <main class="flex-1 overflow-y-auto" :class="route.meta?.containerHeight === 'full' ? '' : 'p-4 pt-10 px-8'">
            <router-view />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </template>

    <template v-else>
      <main class="bg-background">
        <router-view />
      </main>
    </template>

    <Toaster />
  </div>
</template>

<script setup>
import 'vue-sonner/style.css';

import { onMounted } from 'vue';
import { Toaster } from '@/common/components/ui/sonner';
import { useAuthStore, initializeLogger } from 'vue-fastedgy';
import { useAdminStore } from '@/admin/stores/admin';
import { useRoute } from 'vue-router';
import AppSidebar from '@/admin/components/sidebar/AppSidebar.vue';
import AppBreadcrumb from '@/common/components/AppBreadcrumb.vue';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/common/components/ui/sidebar';

const route = useRoute();
const authStore = useAuthStore();

useAdminStore();
initializeLogger(import.meta.env.VITE_LOG_LEVEL);

onMounted(async () => {
  await authStore.checkUser();
});
</script>
