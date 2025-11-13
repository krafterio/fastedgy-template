<template>
    <component
        v-if="iconComponent"
        :is="iconComponent"
        :size="size"
        :color="color"
        :stroke-width="strokeWidth"
        v-bind="$attrs"
    />
    <div
        v-else
        :style="{ width: `${size}px`, height: `${size}px`, lineHeight: `${size/1.1}px`, fontSize: `${size/1.5}px` }"
        class="d-flex align-center justify-center text-center rounded-full border-1"
        v-bind="$attrs"
    >
        ?
    </div>
</template>

<script setup>
import {ref, watch, onMounted} from 'vue';

const props = defineProps({
    name: {
        type: String,
        required: true,
    },
    size: {
        type: [Number, String],
        default: 24,
    },
    color: {
        type: String,
        default: undefined,
    },
    strokeWidth: {
        type: [Number, String],
        default: 2,
    },
    defaultIcon: {
        type: String,
        default: 'CircleQuestionMark',
    }
})

const iconComponent = ref(null);

const loadIcon = async (name) => {
    try {
        const module = await import('lucide-vue-next');
        iconComponent.value = module[name] || module[props.defaultIcon] || null;
    } catch (error) {
        iconComponent.value = null;
    }
}

watch(
    () => props.name,
    (newName) => {
        loadIcon(newName).then();
    }
)

onMounted(() => {
    loadIcon(props.name).then();
});
</script> 
