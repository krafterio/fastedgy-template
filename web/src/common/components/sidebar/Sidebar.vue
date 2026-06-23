<template>
  <Sidebar collapsible="icon">
    <SidebarHeader class="h-12 flex justify-center p-4 group-data-[collapsible=icon]:p-0 relative">
      <div class="flex items-center gap-2">
        <img src="@/common/assets/img/favicon.png" alt="Logo" class="h-8 group-data-[collapsible=icon]:hidden" />

        <span class="text-lg font-bold group-data-[collapsible=icon]:hidden">FastEdgy</span>

        <img
          src="@/common/assets/img/favicon.png"
          alt="Logo"
          class="w-8 mx-2 min-w-8 hidden group-data-[collapsible=icon]:flex"
        />
      </div>
    </SidebarHeader>

    <SidebarContent>
      <slot name="top" />
      <slot name="default" />
    </SidebarContent>

    <SidebarFooter class="border-t p-0">
      <slot name="footer" />
    </SidebarFooter>

    <SidebarRail />
  </Sidebar>
</template>

<script setup>
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/common/components/ui/sidebar';
</script>
