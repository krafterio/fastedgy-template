import { ref, watch } from 'vue';

const STORAGE_KEY = 'datatable-page-size';
const DEFAULT_PAGE_SIZE = 100;

/**
 * Validate and get page size with priority: queryParam > localStorage > default
 * @param {number|string|null} queryParam - Size from URL query param
 * @param {Array<number>} availableSizes - Valid page sizes
 * @param {number} defaultSize - Default size
 * @returns {number} - Validated page size
 */
function getValidatedPageSize(queryParam, availableSizes, defaultSize) {
  // Priority 1: Query param
  if (queryParam != null) {
    const size = parseInt(queryParam, 10);
    if (availableSizes.includes(size)) {
      return size;
    }
  }

  // Priority 2: LocalStorage
  const storedSize = localStorage.getItem(STORAGE_KEY);
  if (storedSize) {
    const size = parseInt(storedSize, 10);
    if (availableSizes.includes(size)) {
      return size;
    }
  }

  // Priority 3: Default (already validated or use DEFAULT_PAGE_SIZE)
  return availableSizes.includes(defaultSize) ? defaultSize : DEFAULT_PAGE_SIZE;
}

/**
 * Composable to manage page size with query params + localStorage persistence
 * @param {number|string|null} queryParam - Size from URL query param
 * @param {Array<number>} availableSizes - Valid page sizes
 * @param {number} defaultSize - Default page size
 * @returns {Ref<number>} - Reactive page size ref
 */
export function usePageSize(queryParam, availableSizes, defaultSize) {
  const initialSize = getValidatedPageSize(queryParam, availableSizes, defaultSize);
  const pageSize = ref(initialSize);

  // Watch and persist changes
  watch(pageSize, (newSize) => {
    localStorage.setItem(STORAGE_KEY, newSize.toString());
  });

  return pageSize;
}
