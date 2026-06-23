<template>
  <div class="border-b px-6 py-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <slot name="left" />
      </div>
      <div class="flex items-center gap-2">
        <slot name="right" />
      </div>
    </div>
  </div>
</template>

<script setup></script>
