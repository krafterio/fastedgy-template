import { ref, watch } from 'vue';

const STORAGE_KEY = 'datagrid-page-size';
const DEFAULT_PAGE_SIZE = 24;

function getValidatedPageSize(queryParam, availableSizes, defaultSize) {
  if (queryParam != null) {
    const size = parseInt(queryParam, 10);
    if (availableSizes.includes(size)) {
      return size;
    }
  }

  const storedSize = localStorage.getItem(STORAGE_KEY);
  if (storedSize) {
    const size = parseInt(storedSize, 10);
    if (availableSizes.includes(size)) {
      return size;
    }
  }

  return availableSizes.includes(defaultSize) ? defaultSize : DEFAULT_PAGE_SIZE;
}

export function usePageSize(queryParam, availableSizes, defaultSize) {
  const initialSize = getValidatedPageSize(queryParam, availableSizes, defaultSize);
  const pageSize = ref(initialSize);

  watch(pageSize, (newSize) => {
    localStorage.setItem(STORAGE_KEY, newSize.toString());
  });

  return pageSize;
}
