<template>
    <div class="space-y-4">
        <div v-if="$slots.filters || $slots.actions || sortOptions.length > 0"
            class="flex items-center justify-between gap-4">
            <div class="flex items-center gap-2 flex-1">
                <Badge class="py-2 px-2" variant="outline">{{ total }}</Badge>
                <slot name="filters" :update-filter="updateFilter" />
            </div>

            <div class="flex items-center gap-2">
                <DropdownMenu v-if="uniqueSortFields.length > 0">
                    <DropdownMenuTrigger as-child>
                        <Button variant="outline">
                            <component :is="currentSortIcon" class="w-4 h-4" />
                            {{ currentSortLabel }}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem v-for="field in uniqueSortFields" :key="field.field"
                            @click="toggleSort(field.field)">
                            <component :is="getSortIconForField(field.field)" class="w-4 h-4" />
                            {{ field.label }}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <slot name="actions" :handle-export="handleExport" :refresh="refresh" />
            </div>
        </div>

        <div v-if="loading && items.length === 0" class="rounded-md border p-8 text-center">
            <Loader2 class="w-8 h-8 animate-spin mx-auto mb-2 text-muted-foreground" />
            <p class="text-sm text-muted-foreground" v-tc>Chargement...</p>
        </div>

        <div v-else-if="error" class="rounded-md border border-destructive/50 bg-destructive/10 p-4">
            <p class="text-sm text-destructive font-medium">
                <span v-tc>Erreur de chargement des données</span>: {{ error.message }}
            </p>
        </div>

        <div v-else-if="items.length === 0" class="rounded-md border-2 border-dashed p-10 text-center">
            <slot name="empty">
                <div class="text-muted-foreground">
                    <p class="text-lg font-medium mb-1" v-tc>Aucune donnée</p>
                    <p class="text-sm" v-tc>Aucun résultat trouvé</p>
                </div>
            </slot>
        </div>

        <component v-else :is="isSortable ? VueDraggable : 'div'" v-bind="isSortable ? {
            modelValue: items,
            animation: 200,
            handle: '.drag-handle',
            ghostClass: 'opacity-50',
            class: gridClass
        } : {
            class: gridClass
        }" @update:modelValue="items = $event" @update="handleDragUpdate">
            <div v-for="item in items" :key="item.id" class="relative group">
                <Card class="overflow-hidden cursor-pointer pt-4 h-full" @click="$emit('item-click', item)">
                    <slot name="item-content" :item="item" />

                    <DropdownMenu v-if="$slots['item-actions']">
                        <DropdownMenuTrigger as-child @click.stop>
                            <Button variant="ghost" size="icon"
                                class="absolute top-3 right-3 bg-background shadow-sm h-8 w-8">
                                <MoreVertical class="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" @click.stop>
                            <slot name="item-actions" :item="item" />
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div v-if="isSortable"
                        class="drag-handle absolute top-2 left-2 z-10 cursor-move opacity-0 group-hover:opacity-100 bg-background/80 backdrop-blur-sm rounded-md p-1">
                        <GripVertical class="w-4 h-4 text-muted-foreground" />
                    </div>
                </Card>
            </div>
        </component>

        <DataGridPagination v-if="items.length > 0" v-model:page="currentPage" v-model:page-size="pageSize"
            :total="total" :available-sizes="availablePageSizes" />
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import { Button } from '@/common/components/ui/button/index.js'
import { Badge } from '@/common/components/ui/badge/index.js'
import { Card } from '@/common/components/ui/card/index.js'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/common/components/ui/dropdown-menu/index.js'
import {
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Loader2,
    GripVertical,
    MoreVertical
} from 'lucide-vue-next'
import { useDataGrid } from './useDataGrid.js'
import { downloadBlob } from './utils.js'
import DataGridPagination from './DataGridPagination.vue'

const props = defineProps({
    modelName: {
        type: String,
        required: true
    },
    prefix: {
        type: String,
        default: ''
    },
    fields: {
        type: Array,
        required: true
    },
    sortOptions: {
        type: Array,
        default: () => []
    },
    defaultSort: {
        type: String,
        default: null
    },
    pageSize: {
        type: Number,
        default: 24
    },
    availablePageSizes: {
        type: Array,
        default: () => [12, 24, 48, 96]
    },
    sortable: {
        type: Boolean,
        default: undefined
    },
    exportFilename: {
        type: String,
        default: 'export'
    },
    exportFields: {
        type: Array,
        default: null
    },
    filter: {
        type: Array,
        default: null
    },
    gridCols: {
        type: Number,
        default: 4
    }
})

defineEmits(['item-click'])

const {
    items,
    total,
    loading,
    error,
    currentPage,
    pageSize,
    availablePageSizes,
    filter,
    orderBy,
    refresh,
    exportData,
    isSortable,
    resequence
} = useDataGrid(props.modelName, {
    prefix: props.prefix,
    fields: props.fields,
    pageSize: props.pageSize,
    availablePageSizes: props.availablePageSizes,
    defaultOrderBy: props.defaultSort ? [props.defaultSort] : null,
    exportFields: props.exportFields,
    sortable: props.sortable,
    filter: () => props.filter
})

const gridClass = computed(() => {
    const cols = props.gridCols

    if (cols === 6) {
        return 'grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'
    }
    if (cols === 5) {
        return 'grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
    }
    if (cols === 4) {
        return 'grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
    }
    if (cols === 3) {
        return 'grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
    }
    if (cols === 2) {
        return 'grid gap-4 grid-cols-1 sm:grid-cols-2'
    }

    return 'grid gap-4 grid-cols-1'
})

const uniqueSortFields = computed(() => {
    const fieldsMap = new Map()

    props.sortOptions.forEach(option => {
        const [field] = option.value.split(':')
        if (!fieldsMap.has(field)) {
            fieldsMap.set(field, {
                field,
                label: option.label.replace(/\s*\(.*?\)\s*$/g, '').trim()
            })
        }
    })

    return Array.from(fieldsMap.values())
})

const currentSortField = computed(() => {
    if (!orderBy.value || orderBy.value.length === 0) return null
    const [field] = orderBy.value[0].split(':')
    return field
})

const currentSortDirection = computed(() => {
    if (!orderBy.value || orderBy.value.length === 0) return null
    const [, direction] = orderBy.value[0].split(':')
    return direction || 'asc'
})

const currentSortLabel = computed(() => {
    if (!currentSortField.value) return 'Trier par...'
    const field = uniqueSortFields.value.find(f => f.field === currentSortField.value)
    return field?.label || 'Trier par...'
})

const currentSortIcon = computed(() => {
    if (!currentSortField.value) return ArrowUpDown
    return currentSortDirection.value === 'asc' ? ArrowUp : ArrowDown
})

const getSortIconForField = (field) => {
    if (currentSortField.value === field) {
        return currentSortDirection.value === 'asc' ? ArrowUp : ArrowDown
    }
    return ArrowUpDown
}

const toggleSort = (field) => {
    if (currentSortField.value === field) {
        const newDirection = currentSortDirection.value === 'asc' ? 'desc' : 'asc'
        orderBy.value = [`${field}:${newDirection}`]
    } else {
        orderBy.value = [`${field}:asc`]
    }
}

const updateFilter = (newFilter) => {
    filter.value = newFilter
}

const handleExport = async (format = 'csv') => {
    const blob = await exportData(format)
    const timestamp = new Date().toISOString().slice(0, 10)
    downloadBlob(blob, `${props.exportFilename}-${timestamp}.${format}`)
}

const handleDragUpdate = () => {
    const ids = items.value.map(item => item.id)
    resequence(ids)
}

defineExpose({
    refresh,
    exportData,
    total
})
</script>
