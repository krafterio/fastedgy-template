<script setup>
import { cn } from "@/common/utils/tailwind";

const props = defineProps({
  class: { type: null, required: false },
});
</script>

<template>
  <div data-slot="card" :class="cn(
    'bg-card text-card-foreground flex flex-col gap-4 rounded-md border py-6',
    props.class,
  )
    ">
    <slot />
  </div>
</template>
