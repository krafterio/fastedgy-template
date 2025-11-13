<template>
    <div
        class="bg-popover text-popover-foreground isolate flex h-full w-80 flex-col overflow-hidden rounded-md border shadow-md"
        :class="className"
    >
        <div class="flex h-9 items-center gap-2 border-b px-3">
            <Search class="w-4 h-4 shrink-0 opacity-50"/>
            <input
                v-model="searchQuery"
                class="outline-none placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Rechercher une icône..."
            />
        </div>

        <div class="flex-1 relative">
            <div v-if="loading" class="absolute inset-0 flex items-center justify-center text-muted-foreground">
                <Loader class="w-4 h-4 animate-spin"/>
            </div>

            <div v-else-if="searchQuery && filteredIcons.length === 0"
                 class="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
                Aucune icône trouvée.
            </div>

            <ScrollArea v-else class="h-80">
                <div class="p-2">
                    <div v-if="searchQuery">
                        <div class="grid grid-cols-8 gap-1">
                            <button
                                v-for="icon in filteredIcons"
                                :key="icon.name"
                                type="button"
                                @click="selectIcon(icon)"
                                @mouseenter="setActiveIcon(icon)"
                                @mouseleave="setActiveIcon(null)"
                                class="flex w-8 h-8 items-center justify-center rounded-sm hover:bg-accent transition-colors border border-transparent"
                                :class="{ 'bg-accent border-border': activeIcon?.name === icon.name }"
                                :title="icon.label"
                            >
                                <LazyIcon :name="icon.name" :size="16"/>
                            </button>
                        </div>
                    </div>

                    <div v-else class="space-y-4">
                        <div
                            v-for="(category, categoryIndex) in iconCategories"
                            :key="category.name"
                            :ref="el => setCategoryRef(el, categoryIndex)"
                            class="category-section"
                        >
                            <div
                                class="sticky top-0 bg-popover/95 backdrop-blur-sm border-b border-border/50 py-2 mb-2 z-10">
                                <div class="flex items-center justify-between">
                                    <h3 class="text-xs font-semibold text-foreground">
                                        {{ category.label }}
                                    </h3>
                                    <span class="text-xs text-muted-foreground">
                    {{ category.icons.length }}
                  </span>
                                </div>
                            </div>

                            <div class="grid grid-cols-8 gap-1">
                                <button
                                    v-for="icon in category.icons"
                                    :key="`${category.name}-${icon.name}`"
                                    type="button"
                                    @click="selectIcon(icon)"
                                    @mouseenter="setActiveIcon(icon)"
                                    @mouseleave="setActiveIcon(null)"
                                    class="flex w-8 h-8 items-center justify-center rounded-sm hover:bg-accent transition-colors border border-transparent"
                                    :class="{ 'bg-accent border-border': activeIcon?.name === icon.name }"
                                    :title="icon.label"
                                >
                                    <LazyIcon :name="icon.name" :size="16"/>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </ScrollArea>
        </div>

        <div class="border-t">
            <div v-if="!searchQuery" class="flex h-9 items-center border-b bg-muted/30">
                <div class="flex overflow-x-auto scrollbar-hide px-1">
                    <button
                        v-for="(category, index) in iconCategories"
                        :key="category.name"
                        @click="scrollToCategory(index)"
                        class="flex-shrink-0 px-2 py-1 mx-1 text-xs font-medium transition-colors rounded hover:bg-accent whitespace-nowrap"
                        :class="{
              'bg-accent text-accent-foreground': activeCategoryIndex === index,
              'text-muted-foreground': activeCategoryIndex !== index 
            }"
                    >
                        {{ category.label }}
                    </button>
                </div>
            </div>

            <div class="flex w-full min-w-0 items-center gap-1 p-2">
                <div v-if="activeIcon" class="flex items-center gap-2">
                    <div class="flex w-7 h-7 flex-none items-center justify-center">
                        <IconViewer :name="activeIcon.name" :size="18"/>
                    </div>
                    <div class="min-w-0 flex-1">
                        <div class="text-secondary-foreground truncate text-xs font-medium">
                            {{ activeIcon.label }}
                        </div>
                        <div class="text-muted-foreground truncate text-xs">
                            {{ activeIcon.name }}
                        </div>
                    </div>
                </div>
                <span v-else class="text-muted-foreground ml-1.5 flex h-7 items-center truncate text-xs">
          {{ searchQuery ? `${filteredIcons.length} icônes trouvées` : `${totalIconCount} icônes disponibles` }}
        </span>
            </div>
        </div>
    </div>
</template>

<script setup>
import {ref, computed, onMounted, onUnmounted, nextTick} from 'vue'
import {Search, Loader} from 'lucide-vue-next'
import {ScrollArea} from '@/common/components/ui/scroll-area'
import {IconViewer, LazyIcon} from './index.js'
import {iconCategories, searchIcons, getTotalIconCount} from '@/common/config/icons'

const props = defineProps({
    className: {
        type: String,
        default: ''
    }
})

const emit = defineEmits(['select'])

const searchQuery = ref('')
const activeIcon = ref(null)
const activeCategoryIndex = ref(0)
const loading = ref(false)
const categoryRefs = ref([])

const totalIconCount = getTotalIconCount()

const filteredIcons = computed(() => {
    if (!searchQuery.value) return []
    return searchIcons(searchQuery.value)
})

const setActiveIcon = (icon) => {
    activeIcon.value = icon
}

const selectIcon = (icon) => {
    emit('select', icon.name)
}

const setCategoryRef = (el, index) => {
    if (el) {
        categoryRefs.value[index] = el
    }
}

const scrollToCategory = async (categoryIndex) => {
    const categoryEl = categoryRefs.value[categoryIndex]
    if (categoryEl) {
        categoryEl.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        })
        activeCategoryIndex.value = categoryIndex
    }
}

let scrollObserver = null

const setupScrollObserver = () => {
    if (scrollObserver) return

    scrollObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const categoryIndex = categoryRefs.value.findIndex(ref => ref === entry.target)
                    if (categoryIndex !== -1) {
                        activeCategoryIndex.value = categoryIndex
                    }
                }
            })
        },
        {
            threshold: 0.3,
            rootMargin: '-20% 0px -70% 0px'
        }
    )

    nextTick(() => {
        categoryRefs.value.forEach((ref) => {
            if (ref) {
                scrollObserver.observe(ref)
            }
        })
    })
}

onMounted(() => {
    loading.value = false
    setupScrollObserver()
})

onUnmounted(() => {
    if (scrollObserver) {
        scrollObserver.disconnect()
    }
})
</script>

<style scoped>
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
    display: none;
}

.category-section {
    scroll-margin-top: 40px;
}
</style> 
