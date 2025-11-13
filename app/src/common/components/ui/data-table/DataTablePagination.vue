<template>
    <div class="flex items-center justify-between">
        <!-- Left side: Info -->
        <div class="flex items-center gap-3">
            <div class="text-sm text-muted-foreground">
                <span>{{ $t('Enregistrements ') }}</span>
                {{ startItem }}
                <span>-</span>
                {{ endItem }}
                <span class="px-1">/</span>
                {{ total }}
                <span v-if="selection && selection.count > 0" class="ml-2">
                    ({{ selection.count }} {{ $t('sélectionnés') }})
                </span>
            </div>

            <!-- "Select All" button -->
            <Button v-if="selection && selection.shouldShowSelectAllButton" variant="outline" size="sm"
                @click="selection.toggleAll()">
                {{ $t('Tout') }}
            </Button>
        </div>

        <!-- Right side: Page size selector + Navigation -->
        <div class="flex items-center gap-2">
            <!-- Page size selector -->
            <Select :model-value="pageSize.toString()" @update:model-value="$emit('update:pageSize', parseInt($event))">
                <SelectTrigger class="w-[80px] h-8">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem v-for="size in availableSizes" :key="size" :value="size.toString()">
                        {{ size }}
                    </SelectItem>
                </SelectContent>
            </Select>

            <!-- Previous button -->
            <Button variant="outline" size="sm" :disabled="page === 1" @click="$emit('update:page', page - 1)">
                <ChevronLeft class="w-4 h-4 mr-1" />
                <span v-tc>Précédent</span>
            </Button>

            <!-- Page numbers -->
            <div class="flex items-center gap-1">
                <Button v-for="pageNum in visiblePages" :key="pageNum"
                    :variant="pageNum === page ? 'default' : 'outline'" size="sm"
                    @click="$emit('update:page', pageNum)">
                    {{ pageNum }}
                </Button>
            </div>

            <!-- Next button -->
            <Button variant="outline" size="sm" :disabled="page === totalPages" @click="$emit('update:page', page + 1)">
                <span v-tc>Suivant</span>
                <ChevronRight class="w-4 h-4 ml-1" />
            </Button>
        </div>
    </div>
</template>

<script setup>
import { computed } from "vue";
import { Button } from "@/common/components/ui/button/index.js";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/common/components/ui/select/index.js";
import { ChevronLeft, ChevronRight } from "lucide-vue-next";

const props = defineProps({
    page: {
        type: Number,
        required: true,
    },
    pageSize: {
        type: Number,
        required: true,
    },
    total: {
        type: Number,
        required: true,
    },
    availableSizes: {
        type: Array,
        default: () => [25, 50, 100, 150, 200],
    },
    selection: {
        type: Object,
        default: null,
    },
});

defineEmits(["update:page", "update:pageSize"]);

const totalPages = computed(() => {
    return Math.ceil(props.total / props.pageSize);
});

const startItem = computed(() => {
    if (props.total === 0) return 0;
    return (props.page - 1) * props.pageSize + 1;
});

const endItem = computed(() => {
    return Math.min(props.page * props.pageSize, props.total);
});

const visiblePages = computed(() => {
    const pages = [];
    const start = Math.max(1, props.page - 2);
    const end = Math.min(totalPages.value, props.page + 2);

    for (let i = start; i <= end; i++) {
        pages.push(i);
    }

    return pages;
});
</script>
