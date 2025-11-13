<template>
  <Sidebar>
    <template #top>
      <SidebarSection :title="('Navigation')" :top-border="false">
        <SidebarMenu>
          <SidebarMenuItem v-for="item in mainItems" :key="item.title">
            <SidebarMenuButton asChild :class="isActive(item.routeName) ? 'bg-primary/10' : ''">
              <RouterLink :to="item.url">
                <component :is="item.icon" class="text-primary" />
                <span>{{ item.title }}</span>
                <Badge v-if="false" variant="default" class="ml-auto rounded-full w-6 bg-secondary/10 text-secondary">1
                </Badge>
              </RouterLink>
            </SidebarMenuButton>
          </SidebarMenuItem>

        </SidebarMenu>
      </SidebarSection>
    </template>

    <template #default>
    </template>

    <template #footer>
      <SidebarUserInfo />
    </template>
  </Sidebar>
</template>

<script setup>
import { useRoute, RouterLink } from 'vue-router'
import {
  Home,
} from "lucide-vue-next"

import Sidebar from "@/common/components/sidebar/Sidebar.vue"
import SidebarUserInfo from "@/common/components/sidebar/SidebarUserInfo.vue"
import SidebarSection from "@/common/components/sidebar/SidebarSection.vue"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/common/components/ui/sidebar"

import { Badge } from "@/common/components/ui/badge"

const route = useRoute()

const isActive = (routeName) => {
  return route.name === routeName
}

const mainItems = [
  {
    title: "Tableau de bord",
    url: "/",
    routeName: "Home",
    icon: Home,
  },
]
</script>
