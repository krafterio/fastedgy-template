<template>
    <div class="bar-chart-container">
        <VisXYContainer :data="data" :height="height" :width="width" :margin="margin">
            <VisStackedBar :x="x" :y="y" :color="barColor" />
            <VisAxis type="x" :tick-format="xTickFormat" />
            <VisAxis type="y" :tick-format="yTickFormat" />
            <VisTooltip v-if="showTooltip" :triggers="tooltipTriggers" :show-delay="0" :hide-delay="0" />
        </VisXYContainer>
    </div>
</template>

<script setup>
import { VisXYContainer, VisStackedBar, VisAxis, VisTooltip } from '@unovis/vue'
import { StackedBar } from '@unovis/ts'

const props = defineProps({
    data: {
        type: Array,
        required: true
    },
    height: {
        type: Number,
        default: 300
    },
    width: {
        type: Number,
        default: undefined
    },
    margin: {
        type: Object,
        default: () => ({ top: 0, right: 0, bottom: 0, left: 0 })
    },
    barColor: {
        type: String,
        default: 'var(--primary)'
    },
    xAccessor: {
        type: [String, Function],
        default: 'x'
    },
    yAccessor: {
        type: [String, Function],
        default: 'y'
    },
    xTickFormat: {
        type: Function,
        default: undefined
    },
    yTickFormat: {
        type: Function,
        default: undefined
    },
    showTooltip: {
        type: Boolean,
        default: true
    }
})

const x = typeof props.xAccessor === 'string'
    ? (d) => d[props.xAccessor]
    : props.xAccessor

const y = typeof props.yAccessor === 'string'
    ? (d) => d[props.yAccessor]
    : props.yAccessor

const tooltipTriggers = {
    [StackedBar.selectors.bar]: (d) => {
        const dayLabel = d.label || d.day || x(d)
        const yv = y(d)
        return `${dayLabel}: ${yv}`
    }
}
</script>

<style scoped>
.bar-chart-container {
    width: 100%;
    height: 100%;
}

.bar-chart-container :deep(.vis-xy-container) {
    font-family: inherit;
}

.bar-chart-container :deep(.vis-axis) {
    color: #6b7280;
    font-size: 12px;
}

.bar-chart-container :deep(.vis-axis-tick) {
    stroke: #e5e7eb;
}

.bar-chart-container :deep(.vis-axis-domain) {
    stroke: #e5e7eb;
}

.bar-chart-container :deep(.vis-tooltip) {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    padding: 8px 12px;
    font-size: 12px;
    color: #111827;
}
</style>
