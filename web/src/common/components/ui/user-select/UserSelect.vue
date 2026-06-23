<template>
  <RelationSelect
    v-model="selectedUser"
    :endpoint="endpoint"
    display-field="name"
    image-field="avatar"
    :filter="filter"
    subtitle-field="email"
    :extra-fields="['name', 'email', 'avatar']"
    placeholder="Sélectionner un utilisateur..."
    search-placeholder="Rechercher un utilisateur..."
    empty-message="Aucun utilisateur trouvé."
    :clearable="clearable"
    :disabled="disabled"
    :class="triggerClass"
  >
    <template #selected-item="{ item }">
      <slot name="selected-item" :item="item">
        <Avatar class="h-4 w-4 rounded-md">
          <AvatarImage v-if="item.avatar" :src="`/storage/download/${item.avatar}`" v-fetcher-src.lazy />
          <AvatarFallback class="text-xs rounded-md">
            {{ (item.name || item.email)?.charAt(0) || 'U' }}
          </AvatarFallback>
        </Avatar>
        <span class="truncate">{{ item.name || item.email }}</span>
      </slot>
    </template>

    <template #list-item="{ item }">
      <slot name="list-item" :item="item">
        <div class="flex items-center gap-2 w-full">
          <Avatar class="h-6 w-6 rounded-md">
            <AvatarImage v-if="item.avatar" :src="`/storage/download/${item.avatar}`" v-fetcher-src.lazy />
            <AvatarFallback class="rounded-md text-xs">
              {{ (item.name || item.email)?.charAt(0) || 'U' }}
            </AvatarFallback>
          </Avatar>
          <div class="flex flex-col items-start min-w-0 flex-1">
            <span class="font-medium text-sm truncate">{{ item.name || item.email }}</span>
            <span v-if="item.email && item.name" class="text-xs text-muted-foreground truncate">
              {{ item.email }}
            </span>
          </div>
        </div>
      </slot>
    </template>
  </RelationSelect>
</template>

<script setup>
import { computed } from 'vue';
import { RelationSelect } from '@/common/components/ui/relation-select';
import { Avatar, AvatarImage, AvatarFallback } from '@/common/components/ui/avatar';

defineOptions({
  name: 'UserSelect',
});

const props = defineProps({
  modelValue: {
    type: [String, Number, Object],
    default: null,
  },
  endpoint: {
    type: String,
    default: '/{app}/users',
  },
  clearable: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  triggerClass: {
    type: String,
    default: '',
  },
  filter: {
    type: Function,
    default: () => null,
  },
});

const emit = defineEmits(['update:modelValue', 'select']);

const selectedUser = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value);
    emit('select', value);
  },
});
</script>
