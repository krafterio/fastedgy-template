<template>
    <Popover v-model:open="open">
        <PopoverTrigger as-child>
            <Button variant="outline" role="combobox" :aria-expanded="open" class="w-full flex-1 justify-between"
                :class="triggerClass" :disabled="disabled">
                <div v-if="selectedItem" class="flex items-center gap-2 truncate">
                    <slot name="selected-item" :item="selectedItem">
                        <span class="truncate">{{ selectedItem[displayField] || 'Sans nom' }}</span>
                    </slot>
                </div>
                <span v-else class="text-muted-foreground">
                    {{ placeholder }}
                </span>
                <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
        </PopoverTrigger>
        <PopoverContent :style="{ width: popoverWidth }" class="p-0" align="start" @keydown="handleKeydown">
            <div class="p-2">
                <Input :placeholder="searchPlaceholder" v-model="searchQuery" @input="onSearchChange" />
            </div>
            <div class="max-h-60 overflow-y-auto">
                <div v-if="clearable && selectedItem" @click="clearSelection"
                    class="flex items-center gap-2 w-full p-2 text-muted-foreground hover:bg-accent cursor-pointer">
                    <X class="h-4 w-4" />
                    <span class="text-sm">Effacer la sélection</span>
                </div>
                <div v-for="(item, index) in filteredItems" :key="item[valueField]" :class="[
                    'flex items-center gap-2 w-full p-2 cursor-pointer',
                    selectedIndex === index ? 'bg-accent' : 'hover:bg-accent'
                ]" @click="() => selectItem(item)">
                    <slot name="list-item" :item="item">
                        <span class="font-medium text-sm truncate">{{ item[displayField] || 'Sans nom' }}</span>
                        <span v-if="subtitleField && item[subtitleField]"
                            class="text-xs text-muted-foreground truncate ml-2">
                            {{ item[subtitleField] }}
                        </span>
                    </slot>
                </div>
                <div v-if="filteredItems.length === 0" class="p-2 text-center text-muted-foreground">
                    {{ searchQuery ? 'Aucun résultat pour la recherche' : emptyMessage }}
                </div>
            </div>
        </PopoverContent>
    </Popover>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { debounce } from 'lodash'
import { ChevronsUpDown, X } from 'lucide-vue-next'

import { Button } from '@/common/components/ui/button'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/common/components/ui/popover'
import { Input } from '@/common/components/ui/input'

defineOptions({
    name: 'ChoiceSelect'
})

const props = defineProps({
    modelValue: {
        type: [String, Number, Object],
        default: null
    },
    items: {
        type: Array,
        required: true
    },
    displayField: {
        type: String,
        default: 'label'
    },
    valueField: {
        type: String,
        default: 'value'
    },
    subtitleField: {
        type: String,
        default: null
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
        default: 'Aucun résultat trouvé.'
    },
    triggerClass: {
        type: String,
        default: ''
    },
    disabled: {
        type: Boolean,
        default: false
    },
    popoverWidth: {
        type: String,
        default: '300px'
    },
    clearable: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['update:modelValue', 'select'])

const open = ref(false)
const searchQuery = ref('')
const selectedIndex = ref(-1)

// Computed for selected item
const selectedItem = computed(() => {
    if (!props.modelValue) return null
    return props.items.find(item => item[props.valueField] === props.modelValue) || null
})

// Computed for filtered items
const filteredItems = computed(() => {
    if (!searchQuery.value) return props.items

    const query = searchQuery.value.toLowerCase()
    return props.items.filter(item =>
        item[props.displayField]?.toLowerCase().includes(query) ||
        item[props.subtitleField]?.toLowerCase().includes(query)
    )
})

// Keyboard navigation handler
const handleKeydown = (event) => {
    const { key } = event

    switch (key) {
        case 'ArrowDown':
            event.preventDefault()
            if (selectedIndex.value < filteredItems.value.length - 1) {
                selectedIndex.value += 1
            } else {
                selectedIndex.value = 0
            }
            break

        case 'ArrowUp':
            event.preventDefault()
            if (selectedIndex.value > 0) {
                selectedIndex.value -= 1
            } else {
                selectedIndex.value = filteredItems.value.length - 1
            }
            break

        case 'Enter':
            event.preventDefault()
            if (selectedIndex.value >= 0 && filteredItems.value[selectedIndex.value]) {
                selectItem(filteredItems.value[selectedIndex.value])
            }
            break

        case 'Escape':
            event.preventDefault()
            open.value = false
            break
    }
}

// Debounced search
const debouncedSearch = debounce(() => {
    selectedIndex.value = -1 // Reset selection when searching
}, 300)

const onSearchChange = (event) => {
    searchQuery.value = event.target.value
    selectedIndex.value = -1
    debouncedSearch()
}

const selectItem = (item) => {
    emit('update:modelValue', item[props.valueField])
    emit('select', item)
    selectedIndex.value = -1
    open.value = false
}

const clearSelection = () => {
    emit('update:modelValue', null)
    emit('select', null)
    selectedIndex.value = -1
    open.value = false
}

// Reset on open
watch(open, (newOpen) => {
    if (newOpen) {
        searchQuery.value = ''
        selectedIndex.value = -1
    }
})
</script>
