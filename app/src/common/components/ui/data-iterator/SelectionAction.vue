<script setup>
/**
 * SelectionAction component
 * Used as child of SelectionActions to define actions via slots
 */
defineProps({
    /**
     * Action name/label
     */
    name: {
        type: String,
        required: true,
    },

    /**
     * Icon component (from lucide-vue-next)
     */
    icon: {
        type: Object,
        default: null,
    },

    /**
     * Whether the action is disabled
     */
    disabled: {
        type: Boolean,
        default: false,
    },
});

defineEmits(["click"]);
</script>

<script>
export default {
    name: "SelectionAction",
};
</script>

<template>
    <!-- This component doesn't render anything, it's used for slot-based configuration -->
</template>
