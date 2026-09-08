<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button
        ref="triggerButton"
        variant="outline"
        role="combobox"
        :aria-expanded="open"
        class="w-full flex-1 justify-between"
        :class="triggerClass"
        :disabled="disabled"
      >
        <div v-if="displayItem" class="flex items-center gap-2 truncate">
          <slot name="selected-item" :item="displayItem">
            <Avatar v-if="imageField && displayItem[imageField]" class="h-4 w-4 rounded-md">
              <AvatarImage :src="getImageUrl(displayItem[imageField])" v-fetcher-src.lazy />
              <AvatarFallback class="text-xs rounded-md">
                {{ displayItem[displayField]?.charAt(0) || '?' }}
              </AvatarFallback>
            </Avatar>
            <span class="truncate">{{ displayItem[displayField] || 'Sans nom' }}</span>
          </slot>
        </div>
        <span v-else class="text-muted-foreground">
          {{ placeholder }}
        </span>
        <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent :style="{ width: finalPopoverWidth }" class="p-0" align="start" @keydown="handleKeydown">
      <div class="p-2">
        <Input :placeholder="searchPlaceholder" v-model="searchQuery" @input="onSearchChange" />
      </div>
      <div class="max-h-60 overflow-y-auto" ref="scrollContainer">
        <div
          v-if="clearable && displayItem"
          :class="[
            'flex items-center gap-2 w-full p-2 text-muted-foreground cursor-pointer',
            selectedIndex === 0 ? 'bg-accent' : 'hover:bg-accent',
          ]"
          @click="clearSelection"
        >
          <X class="h-4 w-4" />
          <span class="text-sm">Effacer la sélection</span>
        </div>
        <div
          v-for="(item, index) in items"
          :key="item.id"
          :class="[
            'flex items-center gap-2 w-full p-2 cursor-pointer',
            selectedIndex === (clearable && displayItem ? index + 1 : index) ? 'bg-accent' : 'hover:bg-accent',
          ]"
          @click="() => selectItem(item)"
        >
          <slot name="list-item" :item="item">
            <Avatar v-if="imageField && item[imageField]" class="h-6 w-6 rounded-md">
              <AvatarImage :src="getImageUrl(item[imageField])" v-fetcher-src.lazy />
              <AvatarFallback class="rounded-md text-xs">
                {{ item[displayField]?.charAt(0) || '?' }}
              </AvatarFallback>
            </Avatar>
            <div class="flex flex-col items-start min-w-0 flex-1">
              <span class="font-medium text-sm truncate">{{ item[displayField] || 'Sans nom' }}</span>
              <span v-if="subtitleField && item[subtitleField]" class="text-xs text-muted-foreground truncate">
                {{ item[subtitleField] }}
              </span>
            </div>
          </slot>
        </div>
        <div v-if="loading && items.length > 0" class="flex items-center justify-center p-2">
          <div class="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
        <div v-if="!loading && items.length === 0 && !searchQuery" class="p-2 text-center text-muted-foreground">
          {{ emptyMessage }}
        </div>
        <div v-if="!loading && items.length === 0 && searchQuery" class="p-2 text-center text-muted-foreground">
          Aucun résultat
        </div>
        <!-- Intersection Observer target for infinite scroll -->
        <div ref="loadMoreTrigger" class="h-4"></div>
      </div>
    </PopoverContent>
  </Popover>
</template>

<script setup>
import { ref, computed, watch, nextTick, onUnmounted } from 'vue';
import { debounce } from 'lodash';
import { useApiOptions, useStorage } from 'vue-fastedgy';
import { ChevronsUpDown, X } from '@lucide/vue';

import { Button } from '@/common/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/common/components/ui/popover';
import { Avatar, AvatarImage, AvatarFallback } from '@/common/components/ui/avatar';
import { Input } from '@/common/components/ui/input';

defineOptions({
  name: 'RelationSelect',
});

const props = defineProps({
  modelValue: {
    type: [String, Number, Object],
    default: null,
  },
  model: {
    type: String,
    required: true,
  },
  prefix: {
    type: String,
    default: '',
  },
  displayField: {
    type: String,
    default: 'name',
  },
  imageField: {
    type: String,
    default: null,
  },
  subtitleField: {
    type: String,
    default: null,
  },
  extraFields: {
    type: Array,
    default: () => [],
  },
  searchFilter: {
    type: Function,
    default: (props, search) => [props.displayField, 'icontains', search],
  },
  filter: {
    type: [Function, Array],
    default: () => null,
  },
  placeholder: {
    type: String,
    default: 'Sélectionner...',
  },
  searchPlaceholder: {
    type: String,
    default: 'Rechercher...',
  },
  emptyMessage: {
    type: String,
    default: 'Aucun résultat trouvé.',
  },
  triggerClass: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  queryParams: {
    type: Object,
    default: () => ({}),
  },
  minSearchLength: {
    type: Number,
    default: 1,
  },
  limit: {
    type: Number,
    default: 50,
  },
  clearable: {
    type: Boolean,
    default: false,
  },
  popoverWidth: {
    type: String,
    default: '300px',
  },
});

const emit = defineEmits(['update:modelValue', 'select']);

const open = ref(false);
const searchQuery = ref('');
const selectedItemData = ref(null); // Simplified: stores complete selected item when loaded
const selectedIndex = ref(-1); // -1 = not selected, 0 = clearable, 1+ = items
const triggerButton = ref(null);

// Intersection Observer for infinite scroll
let observer = null;
const scrollContainer = ref(null);
const loadMoreTrigger = ref(null);

// Computed for final popover width
const finalPopoverWidth = computed(() => {
  if (open.value && triggerButton.value?.$el) {
    const buttonRect = triggerButton.value.$el.getBoundingClientRect();
    const buttonWidth = buttonRect.width;

    if (props.popoverWidth === 'auto') {
      return `${buttonWidth}px`;
    }

    if (props.popoverWidth.endsWith('%')) {
      const percentage = parseFloat(props.popoverWidth) / 100;
      return `${buttonWidth * percentage}px`;
    }
  }

  return props.popoverWidth;
});

// Computed to get display item (simplified logic)
const displayItem = computed(() => {
  if (!props.modelValue) return null;

  // If modelValue is a complete object, use it directly
  if (typeof props.modelValue === 'object' && Object.keys(props.modelValue).length > 1) {
    return props.modelValue;
  }

  // Check if we have loaded complete data
  if (selectedItemData.value) {
    const itemId = typeof props.modelValue === 'object' ? props.modelValue.id : props.modelValue;
    if (selectedItemData.value.id === itemId) {
      return selectedItemData.value;
    }
  }

  // Check in current items list
  if (typeof props.modelValue === 'number') {
    const found = items.value.find((item) => item.id === props.modelValue);
    if (found) return found;
  } else if (typeof props.modelValue === 'object' && props.modelValue.id) {
    const found = items.value.find((item) => item.id === props.modelValue.id);
    if (found) return found;
  }

  // Return partial object as fallback (will trigger loading)
  return typeof props.modelValue === 'object' ? props.modelValue : null;
});

// Computed for navigation bounds
const maxSelectableIndex = computed(() => {
  let count = items.value.length;
  if (props.clearable && displayItem.value) {
    count += 1; // +1 for clearable item
  }
  return count - 1;
});

// Keyboard navigation handler
const handleKeydown = (event) => {
  const { key } = event;

  switch (key) {
    case 'ArrowDown':
      event.preventDefault();
      if (selectedIndex.value < maxSelectableIndex.value) {
        selectedIndex.value += 1;
      } else {
        selectedIndex.value = 0; // Loop to first item
      }
      break;

    case 'ArrowUp':
      event.preventDefault();
      if (selectedIndex.value > 0) {
        selectedIndex.value -= 1;
      } else {
        selectedIndex.value = maxSelectableIndex.value; // Loop to last item
      }
      break;

    case 'Enter':
      event.preventDefault();
      if (selectedIndex.value === 0 && props.clearable && displayItem.value) {
        clearSelection();
      } else if (selectedIndex.value >= 0) {
        const itemIndex = props.clearable && displayItem.value ? selectedIndex.value - 1 : selectedIndex.value;
        if (items.value[itemIndex]) {
          selectItem(items.value[itemIndex]);
        }
      }
      break;

    case 'Escape':
      event.preventDefault();
      open.value = false;
      break;
  }
};

const { fileUrl } = useStorage();

const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;

  return fileUrl(imagePath);
};

const fields = [props.displayField, props.imageField, props.subtitleField, ...props.extraFields].filter(Boolean);

const {
  items,
  loading,
  hasMore,
  search: searchOptions,
  loadMore,
  refresh,
  resolve,
} = useApiOptions(props.model, {
  fields,
  filter: () => (typeof props.filter === 'function' ? props.filter() : props.filter),
  searchFilter: (text) => props.searchFilter(props, text),
  limit: props.limit,
  minSearchLength: props.minSearchLength,
  params: { prefix: props.prefix },
  query: () => props.queryParams,
});

// Load complete selected item when needed
const ensureSelectedItemLoaded = async () => {
  if (!props.modelValue) return;

  const needsLoading = (() => {
    if (typeof props.modelValue === 'number') return true;
    if (typeof props.modelValue === 'object') {
      return Object.keys(props.modelValue).length === 1 && props.modelValue.hasOwnProperty('id');
    }
    return false;
  })();

  if (!needsLoading) return;

  const itemId = typeof props.modelValue === 'object' ? props.modelValue.id : props.modelValue;

  // Check if already loaded
  if (selectedItemData.value && selectedItemData.value.id === itemId) return;

  selectedItemData.value = await resolve(itemId);
};

// Debounced search
const debouncedSearch = debounce((query) => {
  void searchOptions(query);
}, 300);

const onSearchChange = (event) => {
  const query = event.target.value;
  searchQuery.value = query;
  selectedIndex.value = -1; // Reset selection when typing
  debouncedSearch(query);
};

// Infinite scroll observer
const setupIntersectionObserver = () => {
  if (observer) observer.disconnect();

  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        void loadMore();
      }
    },
    { threshold: 0.1 }
  );

  if (loadMoreTrigger.value) {
    observer.observe(loadMoreTrigger.value);
  }
};

const selectItem = (item) => {
  emit('update:modelValue', item);
  emit('select', item);
  selectedIndex.value = -1;
  open.value = false;
};

const clearSelection = () => {
  emit('update:modelValue', null);
  emit('select', null);
  selectedItemData.value = null;
  selectedIndex.value = -1;
  open.value = false;
};

// Watchers
watch(
  () => props.queryParams,
  () => {
    void refresh();
  },
  { deep: true }
);

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      ensureSelectedItemLoaded();
    } else {
      selectedItemData.value = null;
    }
  },
  { immediate: true }
);

watch(open, (newOpen) => {
  if (newOpen) {
    selectedIndex.value = -1; // Reset selection
    if (items.value.length === 0) {
      void searchOptions(searchQuery.value);
    }
    nextTick(() => setupIntersectionObserver());
  } else {
    selectedIndex.value = -1; // Reset selection
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }
});

// Cleanup observer on unmount
onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
});
</script>
