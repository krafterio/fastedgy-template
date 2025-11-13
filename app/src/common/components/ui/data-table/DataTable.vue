<template>
    <div class="space-y-4">
        <!-- Toolbar -->
        <div v-if="$slots.filters || $slots.actions" class="flex items-center justify-between gap-4 pt-1">
            <!-- Filters slot -->
            <div class="flex items-center gap-2 flex-1">
                <Badge class="py-2 px-2" variant="outline">{{ total }}</Badge>
                <slot name="filters" :update-filter="updateFilter" :selection="selection" />
            </div>

            <!-- Actions slot -->
            <div class="flex items-center gap-2">
                <slot name="actions" :handle-export="handleExport" :handle-import="handleImport" :refresh="refresh" />
            </div>
        </div>

        <!-- Loading state -->
        <div v-if="loading && items.length === 0" class="rounded-md border p-8 text-center">
            <Loader2 class="w-8 h-8 animate-spin mx-auto mb-2 text-muted-foreground" />
            <p class="text-sm text-muted-foreground" v-tc>Chargement...</p>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="rounded-md border border-destructive/50 bg-destructive/10 p-4">
            <p class="text-sm text-destructive font-medium">
                <span v-tc>Erreur de chargement des données</span>: {{ error.message }}
            </p>
        </div>

        <!-- Empty state -->
        <div v-else-if="items.length === 0" class="rounded-md border-2 border-dashed p-10 text-center">
            <slot name="empty">
                <div class="text-muted-foreground">
                    <p class="text-lg font-medium mb-1" v-tc>Aucune donnée</p>
                    <p class="text-sm" v-tc>Aucun résultat trouvé</p>
                </div>
            </slot>
        </div>

        <!-- Table -->
        <div v-else class="rounded-md border overflow-auto min-h-0" :class="tableClass">
            <Table>
                <TableHeader>
                    <TableRow>
                        <!-- Drag handle column header -->
                        <TableHead v-if="isSortable" class="w-[40px]"></TableHead>

                        <!-- Selection column header -->
                        <TableHead v-if="isSelectionEnabled" class="w-[50px]">
                            <Checkbox :model-value="selection.isAllVisibleSelected"
                                @update:modelValue="() => selection.isAllVisibleSelected ? selection.clear() : selection.selectAllVisible()" />
                        </TableHead>

                        <TableHead v-for="column in columns" :key="column.key"
                            @click="isSortableColumn(column) && props.orderable !== false && toggleSort(getSortPath(column))"
                            :class="[
                                isSortableColumn(column) && props.orderable !== false && 'cursor-pointer hover:bg-muted/50 select-none group',
                                column.align === 'center' && 'text-center',
                                column.align === 'right' && 'text-right'
                            ]" :style="column.width && { width: column.width }">
                            <div class="flex items-center gap-2">
                                <span>{{ column.label }}</span>
                                <!-- Icon for sortable columns without active sort -->
                                <ArrowUpDown
                                    v-if="isSortableColumn(column) && props.orderable !== false && !getSortDirection(getSortPath(column))"
                                    :class="[
                                        'h-4 w-4 transition-opacity opacity-0 group-hover:opacity-50'
                                    ]" />
                                <!-- Icon for active sort -->
                                <ArrowUp
                                    v-if="isSortableColumn(column) && props.orderable !== false && getSortDirection(getSortPath(column)) === 'asc'"
                                    :class="[
                                        'h-4 w-4 transition-colors text-muted-foreground group-hover:text-primary'
                                    ]" />
                                <ArrowDown
                                    v-if="isSortableColumn(column) && props.orderable !== false && getSortDirection(getSortPath(column)) === 'desc'"
                                    :class="[
                                        'h-4 w-4 transition-colors text-muted-foreground group-hover:text-primary'
                                    ]" />
                            </div>
                        </TableHead>
                        <TableHead v-if="actions && actions.length > 0" class="w-[80px]">
                            <span v-tc>Actions</span>
                        </TableHead>
                    </TableRow>
                </TableHeader>

                <!-- Draggable or static tbody -->
                <component :is="isSortable ? VueDraggable : TableBody" v-bind="isSortable ? {
                    modelValue: items,
                    tag: 'tbody',
                    animation: 200,
                    handle: '.drag-handle',
                    ghostClass: 'opacity-50'
                } : {}" :class="isSortable && '[&_tr]:border-b'" @update:modelValue="items = $event"
                    @update="handleDragUpdate">
                    <TableRow v-for="row in items" :key="row.id"
                        :class="rowClickable && 'cursor-pointer hover:bg-muted/50'"
                        @click="!isSortable && rowClickable && $emit('row-click', row)">
                        <!-- Drag handle column (only for sortable) -->
                        <TableCell v-if="isSortable" class="drag-handle cursor-move">
                            <GripVertical class="w-4 h-4 text-muted-foreground" />
                        </TableCell>

                        <!-- Selection column -->
                        <TableCell v-if="isSelectionEnabled" @click.stop>
                            <Checkbox :model-value="selection.has(row.id)"
                                @update:modelValue="() => selection.toggle(row.id)" />
                        </TableCell>

                        <!-- Data columns -->
                        <TableCell v-for="column in columns" :key="column.key" :class="[
                            column.align === 'center' && 'text-center',
                            column.align === 'right' && 'text-right'
                        ]" @click="isSortable && rowClickable && $emit('row-click', row)">
                            <!-- Custom cell slot (use __ for nested: cell-user__name) -->
                            <slot :name="`cell-${column.key.replace(/\./g, '__')}`" :row="row"
                                :value="getNestedValue(row, column.key)" :column="column">
                                <!-- Default cell rendering -->
                                {{ formatCellValue(getNestedValue(row, column.key), column) }}
                            </slot>
                        </TableCell>

                        <!-- Actions column -->
                        <TableCell v-if="actions && actions.length > 0" @click.stop>
                            <DropdownMenu>
                                <DropdownMenuTrigger as-child>
                                    <Button variant="ghost" size="sm">
                                        <MoreHorizontal class="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <template v-for="(action, index) in actions" :key="index">
                                        <DropdownMenuSeparator v-if="action.separator" />
                                        <DropdownMenuItem v-else
                                            @click.stop="action.handler ? action.handler(row) : $emit('row-action', { action: action.action, row })"
                                            :class="action.variant === 'destructive' && 'text-destructive focus:text-destructive'">
                                            <component :is="action.icon" class="w-4 h-4" />
                                            {{ action.label }}
                                        </DropdownMenuItem>
                                    </template>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                </component>
            </Table>
        </div>

        <!-- Pagination -->
        <DataTablePagination v-if="items.length > 0" v-model:page="currentPage" v-model:page-size="pageSize"
            :total="total" :available-sizes="availablePageSizes" :selection="isSelectionEnabled ? selection : null" />

        <!-- Import Dialog -->
        <DataTableImportDialog ref="importDialogRef" :model-name="modelName" :on-import="importData" />
    </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/common/components/ui/table/index.js'
import { Button } from '@/common/components/ui/button/index.js'
import { Badge } from '@/common/components/ui/badge/index.js'
import { Checkbox } from '@/common/components/ui/checkbox/index.js'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/common/components/ui/dropdown-menu/index.js'
import {
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Loader2,
    MoreHorizontal,
    GripVertical
} from 'lucide-vue-next'
import { useDataTable } from './useDataTable.js'
import { getNestedValue, formatCellValue, downloadBlob } from './utils.js'
import DataTablePagination from './DataTablePagination.vue'
import DataTableImportDialog from './DataTableImportDialog.vue'

/**
 * Check if a column is sortable
 * @param {Object} column - Column definition
 * @returns {boolean}
 */
const isSortableColumn = (column) => {
    return !!column.sortable
}

/**
 * Get the sort path for a column
 * @param {Object} column - Column definition
 * @returns {string} - Path to use for sorting (custom path or column key)
 */
const getSortPath = (column) => {
    return typeof column.sortable === 'string' ? column.sortable : column.key
}

const props = defineProps({
    /** Model name for the API (e.g., 'user') */
    modelName: {
        type: String,
        required: true
    },
    /** Prefix for the API (e.g., '/admin') */
    prefix: {
        type: String,
        default: ''
    },
    /** Column definitions */
    columns: {
        type: Array,
        required: true
    },
    /** Additional fields to fetch but not display */
    additionalFields: {
        type: Array,
        default: () => []
    },
    /** Items per page */
    pageSize: {
        type: Number,
        default: 100
    },
    /** Available page sizes for selector */
    availablePageSizes: {
        type: Array,
        default: () => [25, 50, 100, 150, 200]
    },
    /** Default order by configuration ['field:asc', 'field2:desc'] */
    defaultOrderBy: {
        type: Array,
        default: null
    },
    /** Row actions configuration */
    actions: {
        type: Array,
        default: null
    },
    /** Make rows clickable */
    rowClickable: {
        type: Boolean,
        default: false
    },
    /** Enable drag & drop reordering (undefined = auto-detect from metadata) */
    sortable: {
        type: Boolean,
        default: undefined
    },
    /** Enable column sorting (default: true) */
    orderable: {
        type: Boolean,
        default: true
    },
    /** Export filename (without extension and timestamp) */
    exportFilename: {
        type: String,
        default: 'export'
    },
    /** Fields to export (if empty, uses table columns) */
    exportFields: {
        type: Array,
        default: null
    },
    /** Restrictive filter to always apply (combined with custom filter) */
    filter: {
        type: Array,
        default: null
    },
    /** Enable row selection */
    enableSelection: {
        type: Boolean,
        default: false
    },
    tableClass: {
        type: String,
        default: ''
    }
})

defineEmits(['row-click', 'row-action'])

// Use DataTable composable
const {
    items,
    total,
    loading,
    error,
    columns,
    currentPage,
    pageSize,
    availablePageSizes,
    filter,
    toggleSort,
    getSortDirection,
    refresh,
    exportData,
    importData,
    isSortable,
    resequence,
    isSelectionEnabled,
    selection
} = useDataTable(props.modelName, {
    prefix: props.prefix,
    columns: props.columns,
    additionalFields: props.additionalFields,
    pageSize: props.pageSize,
    availablePageSizes: props.availablePageSizes,
    defaultOrderBy: props.defaultOrderBy,
    exportFields: props.exportFields,
    sortable: props.sortable,
    orderable: props.orderable,
    filter: () => props.filter,
    enableSelection: props.enableSelection
})

// Import dialog ref
const importDialogRef = ref(null)

// Update filter function for slot
const updateFilter = (newFilter) => {
    filter.value = newFilter
}

// Simple export handler for slot
const handleExport = async (format = 'csv') => {
    const blob = await exportData(format)
    const timestamp = new Date().toISOString().slice(0, 10)
    downloadBlob(blob, `${props.exportFilename}-${timestamp}.${format}`)
}

// Simple import handler for slot
const handleImport = () => {
    importDialogRef.value?.open()
}

// Handle drag & drop reordering
const handleDragUpdate = () => {
    // items.value is already updated by v-model
    const ids = items.value.map(item => item.id)
    resequence(ids)
}

// Expose methods to parent
defineExpose({
    refresh,
    exportData,
    importData,
    total,
    selection
})
</script>
