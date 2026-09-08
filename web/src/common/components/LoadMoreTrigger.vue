<template>
  <div ref="trigger" class="h-4"></div>
</template>

<script setup>
import { useTemplateRef } from 'vue';
import { useIntersectionObserver } from '@vueuse/core';

const emit = defineEmits(['visible']);

const trigger = useTemplateRef('trigger');

useIntersectionObserver(trigger, ([entry]) => {
  if (entry.isIntersecting) {
    emit('visible');
  }
});
</script>
