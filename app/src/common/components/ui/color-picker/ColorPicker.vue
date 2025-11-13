<template>
    <div class="color-picker-wrapper">
        <Popover v-model:open="showPicker">
            <PopoverTrigger as-child>
                <Button variant="outline" class="w-full justify-start gap-2 h-10">
                    <div class="w-4 h-4 rounded border" :style="{ backgroundColor: colorValue }"></div>
                    <span class="text-sm">{{ colorValue }}</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent class="w-auto p-0 border-0" side="bottom" align="start" :sideOffset="4" :alignOffset="0">
                <Vue3ColorPicker v-model="colorValue" mode="solid" type="HEX" :showColorList="false"
                    :showEyeDrop="false" :showAlpha="false" :showInputMenu="true" :showInputSet="true"
                    :showPickerMode="false" :showButtons="false" />
            </PopoverContent>
        </Popover>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Vue3ColorPicker } from '@cyhnkckali/vue3-color-picker'
import '@cyhnkckali/vue3-color-picker/dist/style.css'
import { Button } from '@/common/components/ui/button'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/common/components/ui/popover'

const props = defineProps({
    modelValue: {
        type: String,
        default: '#000000'
    }
})

const emit = defineEmits(['update:modelValue'])

const colorValue = ref(props.modelValue || '#000000')
const showPicker = ref(false)
const isInternalChange = ref(false)

watch(colorValue, (newColor) => {
    if (!isInternalChange.value) {
        emit('update:modelValue', newColor)
    }
    isInternalChange.value = false
})

watch(() => props.modelValue, (newValue) => {
    if (newValue && newValue !== colorValue.value) {
        isInternalChange.value = true
        colorValue.value = newValue
    }
}, { immediate: true })
</script>

<style>
.color-picker-wrapper {
    display: inline-block;
}

.color-picker-wrapper * {
    box-shadow: none !important;
}

.color-picker-wrapper [class*="vc-"],
.color-picker-wrapper [class*="color"],
.color-picker-wrapper [class*="picker"] {
    box-shadow: none !important;
    border-radius: 0 !important;
}
</style>
