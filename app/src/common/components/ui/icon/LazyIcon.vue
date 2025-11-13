<template>
    <div
        ref="iconContainer"
        class="flex w-8 h-8 items-center justify-center"
    >
        <IconViewer
            v-if="isVisible"
            :name="name"
            :size="size"
        />
        <div
            v-else
            class="w-4 h-4 bg-muted animate-pulse rounded"
        />
    </div>
</template>

<script setup>
import {ref, onMounted, onUnmounted} from 'vue'
import {IconViewer} from './index.js'

const props = defineProps({
    name: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        default: 16
    }
})

const iconContainer = ref(null)
const isVisible = ref(false)
let observer = null

onMounted(() => {
    if (!iconContainer.value) return

    observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && !isVisible.value) {
                    isVisible.value = true
                    observer?.unobserve(entry.target)
                }
            })
        },
        {
            rootMargin: '50px',
            threshold: 0.1
        }
    )

    observer.observe(iconContainer.value)
})

onUnmounted(() => {
    if (observer && iconContainer.value) {
        observer.unobserve(iconContainer.value)
        observer.disconnect()
    }
})
</script> 
