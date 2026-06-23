<template>
  <div class="line-chart-container">
    <VisXYContainer :data="data" :height="height" :width="width" :margin="margin" :y-domain="yDomain">
      <VisLine :x="x" :y="y" :color="lineColor" :stroke-width="strokeWidth" :curve-type="curveType" />
      <VisScatter :x="x" :y="y" :size="6" :color="lineColor" />
      <VisAxis type="x" :tick-format="xTickFormat" />
      <VisAxis type="y" :tick-format="yTickFormat" />
      <VisCrosshair v-if="showCrosshair" />
      <VisTooltip v-if="showTooltip" :triggers="tooltipTriggers" :show-delay="0" :hide-delay="0" />
    </VisXYContainer>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { VisXYContainer, VisLine, VisAxis, VisTooltip, VisCrosshair, VisScatter } from '@unovis/vue';
import { Line, Scatter } from '@unovis/ts';

const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
  height: {
    type: Number,
    default: 300,
  },
  width: {
    type: Number,
    default: undefined,
  },
  margin: {
    type: Object,
    default: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  },
  lineColor: {
    type: String,
    default: 'var(--primary)',
  },
  strokeWidth: {
    type: Number,
    default: 2,
  },
  curveType: {
    type: String,
    default: 'linear',
  },
  xAccessor: {
    type: [String, Function],
    default: 'x',
  },
  yAccessor: {
    type: [String, Function],
    default: 'y',
  },
  xTickFormat: {
    type: Function,
    default: undefined,
  },
  yTickFormat: {
    type: Function,
    default: undefined,
  },
  showCrosshair: {
    type: Boolean,
    default: false,
  },
  showTooltip: {
    type: Boolean,
    default: true,
  },
});

const x = typeof props.xAccessor === 'string' ? (d) => d[props.xAccessor] : props.xAccessor;

const y = typeof props.yAccessor === 'string' ? (d) => d[props.yAccessor] : props.yAccessor;

const yDomain = computed(() => {
  const values = props.data.map((d) => y(d)).filter((v) => v !== null && v !== undefined);
  if (values.length === 0) return undefined;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  const padding = range > 0 ? range * 0.15 : Math.max(1, max * 0.15);

  return [min - padding, max + padding];
});

const tooltipTriggers = {
  [Scatter.selectors.point]: (d) => {
    const dayLabel = d.day || x(d);
    const yv = y(d);
    return `${dayLabel}: ${yv}`;
  },
};
</script>

<style scoped>
.line-chart-container {
  width: 100%;
  height: 100%;
}

.line-chart-container :deep(.vis-xy-container) {
  font-family: inherit;
}

.line-chart-container :deep(.vis-axis) {
  color: #6b7280;
  font-size: 12px;
}

.line-chart-container :deep(.vis-axis-tick) {
  stroke: #e5e7eb;
}

.line-chart-container :deep(.vis-axis-domain) {
  stroke: #e5e7eb;
}

.line-chart-container :deep(.vis-tooltip) {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  padding: 8px 12px;
  font-size: 12px;
  color: #111827;
}
</style>
