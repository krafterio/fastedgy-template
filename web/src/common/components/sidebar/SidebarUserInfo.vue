<template>
  <SidebarMenu v-if="authStore.user">
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger as-child :class="[state === 'collapsed' ? 'ms-2 me-2 mt-2 mb-2' : '']">
          <SidebarMenuButton
            size="lg"
            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <Avatar class="h-8 w-8 rounded-lg">
              <AvatarImage :src="getAvatarUrl(authStore.user.avatar)" :alt="authStore.user.name" v-fetcher-src.lazy />
              <AvatarFallback class="rounded-lg bg-secondary/20">
                {{ authStore.user.name?.charAt(0)?.toUpperCase() || 'U' }}
              </AvatarFallback>
            </Avatar>
            <div class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate font-semibold">{{ authStore.user.name || $t('Utilisateur') }}</span>
              <span class="truncate text-xs">{{ authStore.user.email || '' }}</span>
            </div>
            <ChevronsUpDown class="ml-auto size-4" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          class="w-[--reka-dropdown-menu-trigger-width] min-w-56 rounded-lg"
          :side="isMobile ? 'bottom' : 'right'"
          align="end"
          :side-offset="4"
        >
          <DropdownMenuLabel class="p-0 font-normal">
            <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar class="h-8 w-8 rounded-lg">
                <AvatarImage :src="getAvatarUrl(authStore.user.avatar)" :alt="authStore.user.name" v-fetcher-src.lazy />
                <AvatarFallback class="rounded-lg">
                  {{ authStore.user.name?.charAt(0)?.toUpperCase() || 'U' }}
                </AvatarFallback>
              </Avatar>
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-semibold">{{ authStore.user.name || $t('Utilisateur') }}</span>
                <span class="truncate text-xs">{{ authStore.user.email || '' }}</span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem @click="openUserDialog">
              <Settings />
              {{ $t('Paramètres') }}
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem @click="authStore.logout">
            <LogOut />
            {{ $t('Se déconnecter') }}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>

  <!-- User Dialog -->
  <UserDialog v-model:open="isUserDialogOpen" />
</template>

<script setup>
import { ref } from 'vue';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/common/components/ui/sidebar';
import { ChevronsUpDown, LogOut, User, Settings } from 'lucide-vue-next';
import { Avatar, AvatarFallback, AvatarImage } from '@/common/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/common/components/ui/dropdown-menu';
import { useAuthStore } from 'vue-fastedgy';
import { useSidebar } from '@/common/components/ui/sidebar';
import UserDialog from './UserDialog.vue';

const { isMobile, state } = useSidebar();
const authStore = useAuthStore();
const isUserDialogOpen = ref(false);

function openUserDialog() {
  isUserDialogOpen.value = true;
}

function getAvatarUrl(avatarPath) {
  if (!avatarPath) return null;
  return `/storage/download/${avatarPath}`;
}
</script>
