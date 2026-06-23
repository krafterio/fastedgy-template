<template>
  <Breadcrumb>
    <BreadcrumbList>
      <template v-for="(item, index) in items" :key="item.name">
        <BreadcrumbItem>
          <template v-if="!item.isCurrent">
            <BreadcrumbLink>
              <RouterLink :to="item.to" class="hover:text-secondary">{{ item.label }}</RouterLink>
            </BreadcrumbLink>
          </template>
          <template v-else>
            <BreadcrumbPage class="hover:text-secondary">{{ item.label }} </BreadcrumbPage>
          </template>
        </BreadcrumbItem>
        <BreadcrumbSeparator v-if="index < items.length - 1" class="text-secondary" />
      </template>
    </BreadcrumbList>
  </Breadcrumb>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { bus, useBus } from 'vue-fastedgy';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/common/components/ui/breadcrumb';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const dynamicEntityTitle = ref(null);
const dynamicParent = ref(null);

watch(
  () => route.path,
  () => {
    dynamicEntityTitle.value = null;
    dynamicParent.value = null;
  }
);

useBus(bus, 'breadcrumb:update', (event) => {
  const data = event.detail;
  if (typeof data === 'string') {
    dynamicEntityTitle.value = data;
    dynamicParent.value = null;
  } else if (typeof data === 'object') {
    dynamicEntityTitle.value = data.label;
    dynamicParent.value = data.parent;
  }
});

const routesByName = computed(() => {
  const map = new Map();
  for (const r of router.getRoutes()) {
    if (r.name) map.set(r.name, r);
  }
  return map;
});

const resolveLabel = (record) => {
  const meta = record.meta || {};
  if (typeof meta.breadcrumb === 'function') return meta.breadcrumb(route);
  if (typeof meta.title === 'string') return t(meta.title);
  if (typeof record.name === 'string') return String(record.name);
  return '';
};

const buildChain = () => {
  const list = [];
  let currentRouteName = route.name;

  if (dynamicParent.value) {
    currentRouteName = dynamicParent.value.name;
  }

  let current = routesByName.value.get(currentRouteName);
  const guard = new Set();
  while (current && !guard.has(current.name)) {
    guard.add(current.name);
    list.push(current);
    const parentName = current.meta && current.meta.parent;
    if (!parentName) break;
    current = routesByName.value.get(parentName);
  }
  return list.reverse();
};

const items = computed(() => {
  const chain = buildChain();
  const result = chain.map((rec, idx) => {
    const isCurrent = false;
    let label = resolveLabel(rec);
    let to = { name: rec.name };

    if (dynamicParent.value && rec.name === dynamicParent.value.name) {
      to = { name: rec.name, params: dynamicParent.value.params };
      if (dynamicParent.value.label) {
        label = dynamicParent.value.label;
      }
    }

    return { name: rec.name, label, to, isCurrent };
  });

  if (dynamicEntityTitle.value) {
    result.push({
      name: route.name,
      label: dynamicEntityTitle.value,
      to: undefined,
      isCurrent: true,
    });
  } else {
    const currentRoute = routesByName.value.get(route.name);
    if (currentRoute) {
      result.push({
        name: route.name,
        label: resolveLabel(currentRoute),
        to: undefined,
        isCurrent: true,
      });
    }
  }

  return result;
});
</script>
