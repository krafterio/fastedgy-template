<template>
  <div class="flex items-center gap-2">
    <div class="relative flex-1 max-w-sm">
      <Search class="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input v-model="searchQuery" @input="handleInput" :placeholder="placeholder" class="pl-8" />
    </div>

    <Button v-if="searchQuery" variant="outline" size="sm" @click="reset">
      <X class="w-4 h-4 mr-2" />
      <span v-tc>Réinitialiser</span>
    </Button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Input } from '@/common/components/ui/input/index.js';
import { Button } from '@/common/components/ui/button/index.js';
import { Search, X } from 'lucide-vue-next';

const props = defineProps({
  updateFilter: {
    type: Function,
    required: true,
  },
  buildFilter: {
    type: Function,
    required: true,
  },
  placeholder: {
    type: String,
    default: 'Rechercher...',
  },
});

const searchQuery = ref('');

const handleInput = () => {
  if (!searchQuery.value || !searchQuery.value.trim()) {
    props.updateFilter(null);
    return;
  }

  const filter = props.buildFilter(searchQuery.value.trim());
  props.updateFilter(filter);
};

const reset = () => {
  searchQuery.value = '';
  props.updateFilter(null);
};
</script>
