<script setup>
import { cn } from '@/common/lib/utils';

const props = defineProps({
  class: { type: null, required: false },
});
</script>

<template>
  <ul data-slot="sidebar-menu" data-sidebar="menu" :class="cn('flex w-full min-w-0 flex-col', props.class)">
    <slot />
  </ul>
</template>
