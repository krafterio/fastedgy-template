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
import { useFetcher } from 'vue-fastedgy';
import { ChevronsUpDown, X } from 'lucide-vue-next';

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
  endpoint: {
    type: String,
    required: true,
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

const fetcher = useFetcher();
const open = ref(false);
const searchQuery = ref('');
const items = ref([]);
const loading = ref(false);
const selectedItemData = ref(null); // Simplified: stores complete selected item when loaded
const selectedIndex = ref(-1); // -1 = not selected, 0 = clearable, 1+ = items
const triggerButton = ref(null);

// Pagination state for infinite scroll
const pagination = ref({
  offset: 0,
  hasMore: true,
  total: 0,
});

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

const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  return `/storage/download/${imagePath}`;
};

// Build fields for API requests
const buildFields = () => {
  const fields = ['id', props.displayField];

  if (props.imageField) {
    fields.push(props.imageField);
  }

  if (props.subtitleField) {
    fields.push(props.subtitleField);
  }

  if (props.extraFields.length > 0) {
    fields.push(...props.extraFields);
  }

  return fields;
};

const buildFilter = () => {
  let filter = null;

  if (typeof props.filter === 'function') {
    filter = props.filter();
  } else if (Array.isArray(props.filter)) {
    filter = props.filter;
  }

  return filter;
};

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

  try {
    const { data } = await fetcher.get(`${props.endpoint}/${itemId}`, {
      headers: {
        'X-Fields': buildFields().join(','),
      },
    });
    selectedItemData.value = data;
  } catch (error) {
    console.error("Erreur lors du chargement de l'item sélectionné:", error);
    selectedItemData.value = null;
  }
};

// Load items with pagination for infinite scroll
const fetchItems = async (search = '', append = false) => {
  if (search && search.length < props.minSearchLength) {
    return;
  }

  try {
    loading.value = true;
    let filter = buildFilter();
    const params = { ...props.queryParams };
    const headers = {
      'X-Fields': buildFields().join(','),
    };

    if (search) {
      // Reset pagination on search
      pagination.value.offset = 0;
      pagination.value.hasMore = true;
      params.limit = props.limit.toString();
      filter = filter ? ['&', [filter, props.searchFilter(props, search)]] : props.searchFilter(props, search);
    } else {
      params.limit = props.limit.toString();
      params.offset = pagination.value.offset.toString();
    }

    if (filter) {
      headers['X-Filter'] = JSON.stringify(filter);
    }

    const { data } = await fetcher.get(props.endpoint, {
      headers,
      params,
    });

    const newItems = data.items || data.results || data || [];
    const total = data.total || 0;

    if (append && search === searchQuery.value) {
      // Append for infinite scroll
      items.value = [...items.value, ...newItems];
    } else {
      // Replace for initial load or search
      items.value = newItems;
    }

    // Update pagination
    pagination.value.total = total;
    pagination.value.hasMore = newItems.length === parseInt(params.limit) && items.value.length < total;
    if (!search) {
      pagination.value.offset += newItems.length;
    }
  } catch (error) {
    console.error('Erreur lors du chargement:', error);
    items.value = [];
    pagination.value.hasMore = false;
  } finally {
    loading.value = false;
  }
};

// Debounced search
const debouncedFetchItems = debounce((query) => {
  fetchItems(query, false).then();
}, 300);

const onSearchChange = (event) => {
  const query = event.target.value;
  searchQuery.value = query;
  selectedIndex.value = -1; // Reset selection when typing
  debouncedFetchItems(query);
};

// Infinite scroll observer
const setupIntersectionObserver = () => {
  if (observer) observer.disconnect();

  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && pagination.value.hasMore && !loading.value) {
        fetchItems(searchQuery.value, true);
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
    items.value = [];
    pagination.value = { offset: 0, hasMore: true, total: 0 };
    fetchItems(searchQuery.value, false).then();
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
      fetchItems();
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
