<script setup>
import { computed, useSlots } from 'vue';
import { Button } from '@/common/components/ui/button/index.js';
import { Badge } from '@/common/components/ui/badge/index.js';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/common/components/ui/dropdown-menu/index.js';
import { ChevronDown, X } from 'lucide-vue-next';

const props = defineProps({
  /**
   * Selection object from useSelection
   */
  selection: {
    type: Object,
    required: true,
  },

  /**
   * Title for the dropdown button
   */
  title: {
    type: String,
    default: 'Actions',
  },

  /**
   * Display selection count badge
   */
  displayCount: {
    type: Boolean,
    default: true,
  },

  /**
   * Array of action configurations
   * Each action: { name, icon?, disabled?, handle, separator? }
   */
  actions: {
    type: Array,
    default: () => [],
  },
});

const slots = useSlots();

/**
 * Collect actions from slots (SelectionAction and SelectionSeparator)
 */
const slotActions = computed(() => {
  if (!slots.default) return [];

  const vnodes = slots.default();
  const actions = [];

  vnodes.forEach((vnode) => {
    if (vnode.type?.name === 'SelectionAction') {
      actions.push({
        name: vnode.props.name,
        icon: vnode.props.icon,
        disabled: vnode.props.disabled || false,
        handle: vnode.props.onClick,
        separator: false,
      });
    } else if (vnode.type?.name === 'SelectionSeparator') {
      actions.push({
        separator: true,
      });
    }
  });

  return actions;
});

/**
 * Final actions list (from props or slots)
 */
const finalActions = computed(() => {
  return slotActions.value.length > 0 ? slotActions.value : props.actions;
});

/**
 * Filter out separators to get actual actions
 */
const actualActions = computed(() => {
  return finalActions.value.filter((action) => !action.separator);
});

/**
 * Check if single action mode
 */
const isSingleAction = computed(() => {
  return actualActions.value.length === 1;
});

/**
 * Handle action click
 */
const handleAction = (action) => {
  if (action.disabled) return;
  if (action.handle) {
    action.handle(props.selection);
  }
};
</script>

<template>
  <div v-if="actualActions.length > 0">
    <!-- Single action mode: simple button -->
    <Button
      v-if="isSingleAction"
      @click="handleAction(actualActions[0])"
      :disabled="actualActions[0].disabled"
      variant="outline"
      size="sm"
      class="gap-2"
    >
      <component v-if="actualActions[0].icon" :is="actualActions[0].icon" class="w-4 h-4" />
      <span>{{ actualActions[0].name }}</span>
      <Badge v-if="displayCount" variant="default" class="rounded-full bg-secondary/10 text-secondary">
        {{ selection.count }}
      </Badge>
      <X class="w-4 h-4 cursor-pointer hover:text-destructive" @click.stop="selection.clear()" />
    </Button>

    <!-- Multiple actions mode: dropdown with separate clear button -->
    <div v-else class="inline-flex items-center border rounded-md">
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="ghost" size="sm" class="gap-2 rounded-r-none border-0">
            <slot name="icon">
              <ChevronDown class="w-4 h-4" />
            </slot>
            <span>{{ title }}</span>
            <Badge v-if="displayCount" variant="default" class="rounded-full bg-secondary/10 text-secondary">
              {{ selection.count }}
            </Badge>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start">
          <template v-for="(action, index) in finalActions" :key="index">
            <DropdownMenuSeparator v-if="action.separator" />
            <DropdownMenuItem v-else @click="handleAction(action)" :disabled="action.disabled">
              <component v-if="action.icon" :is="action.icon" class="w-4 h-4 mr-2" />
              <span>{{ action.name }}</span>
            </DropdownMenuItem>
          </template>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button variant="ghost" size="sm" @click="selection.clear()" class="h-8 w-8 p-0 rounded-l-none border-l">
        <X class="w-4 h-4 hover:text-destructive" />
      </Button>
    </div>
  </div>
</template>
