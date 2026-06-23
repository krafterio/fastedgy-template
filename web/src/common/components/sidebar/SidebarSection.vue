<template>
  <SidebarGroup :class="topBorder ? 'border-t' : ''">
    <SidebarGroupLabel>{{ title }}</SidebarGroupLabel>
    <SidebarGroupContent>
      <slot />
    </SidebarGroupContent>
  </SidebarGroup>
</template>

<script setup>
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from '@/common/components/ui/sidebar';

defineProps({
  title: {
    type: String,
    required: true,
  },
  topBorder: {
    type: Boolean,
    default: true,
  },
});
</script>
