import { ref, computed, watch } from 'vue';
import { useApiModel, useMetadataStore, formatValidationErrors } from 'vue-fastedgy';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { toast } from 'vue-sonner';
import { usePageSize } from './usePageSize.js';
import { useSortable } from './useSortable.js';
import { useSelection } from './useSelection.js';

/**
 * Default configuration values for data iteration
 */
const DEFAULT_OPTIONS = {
  pageSize: 50,
  availablePageSizes: [25, 50, 100],
  prefix: '/{app}',
  headers: null,
  enableSelection: false,
  orderable: true,
};

/**
 * Core composable for data iteration with server-side pagination, filters, and sorting
 * Used as base for DataTable and DataGrid
 *
 * @param {string} modelName - Model name (e.g., 'retail_chains', 'tasks')
 * @param {Object} options - Configuration options
 * @param {Function|Array} options.fieldsResolver - Function that returns fields array or static array
 * @param {number} options.pageSize - Default items per page (overrides default: 50)
 * @param {Array} options.availablePageSizes - Available page sizes (overrides default: [25, 50, 100])
 * @param {Array<string>} options.defaultOrderBy - Default sort ['field:asc', 'field2:desc']
 * @param {Array<string>} options.exportFields - Fields to export
 * @param {Array|Function} options.filter - Restrictive filters to always apply
 * @param {string} options.prefix - Prefix for the API (default: "/{app}")
 * @param {Object} options.headers - Custom headers for API requests (default: null)
 * @param {boolean} options.sortable - Enable drag & drop sorting
 * @param {boolean} options.orderable - Enable column sorting (default: true)
 * @param {boolean} options.enableSelection - Enable row selection (default: false)
 * @returns {Record<string, any>} - DataIterator state and methods
 */
export function useDataIterator(modelName, options = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options };
  const service = useApiModel(modelName, {
    prefix: options.prefix || DEFAULT_OPTIONS.prefix,
    headers: options.headers || DEFAULT_OPTIONS.headers,
  });
  const metadataStore = useMetadataStore();
  const { t } = useI18n();
  const route = useRoute();
  const router = useRouter();

  const items = ref([]);
  const total = ref(0);
  const loading = ref(false);
  const error = ref(null);

  const initialPage = route.query.p ? parseInt(route.query.p, 10) : 1;
  const currentPage = ref(initialPage > 0 ? initialPage : 1);

  const pageSize = usePageSize(route.query.s, config.availablePageSizes, config.pageSize);

  const customFilter = ref(null);

  const filter = computed(() => {
    const restrictiveFilters = typeof config.filter === 'function' ? config.filter() || [] : config.filter || [];
    const custom = customFilter.value;

    if (!custom) {
      return restrictiveFilters.length > 0 ? restrictiveFilters : null;
    }

    return [...restrictiveFilters, custom];
  });

  const metadata = metadataStore.getMetadata(modelName);
  const { isSortable, sortableField, resequence } = useSortable(modelName, metadata, config.sortable);

  const fields = computed(() => {
    let baseFields = [];

    if (typeof config.fieldsResolver === 'function') {
      baseFields = config.fieldsResolver();
    } else if (Array.isArray(config.fieldsResolver)) {
      baseFields = config.fieldsResolver;
    }

    const allFields = ['id', ...baseFields];

    if (isSortable.value && sortableField.value && !allFields.includes(sortableField.value)) {
      allFields.push(sortableField.value);
    }

    return [...new Set(allFields)];
  });

  /**
   * Parse order_by string from URL to array
   * @param {string} orderByString - "field1:asc,field2:desc"
   * @returns {Array<string>|null}
   */
  const parseOrderByString = (orderByString) => {
    if (!orderByString) return null;
    return orderByString.split(',');
  };

  /**
   * Convert orderBy array to string for URL
   * @param {Array<string>} orderByArray - ['field:asc', 'field2:desc']
   * @returns {string|null}
   */
  const orderByArrayToString = (orderByArray) => {
    if (!orderByArray || orderByArray.length === 0) return null;
    return orderByArray.join(',');
  };

  const initialOrderBy = route.query.order_by
    ? parseOrderByString(route.query.order_by)
    : config.defaultOrderBy || null;
  const orderBy = ref(initialOrderBy);

  /**
   * Fetch items from API with current filters, pagination, and sorting
   */
  const fetchItems = async () => {
    try {
      loading.value = true;
      error.value = null;

      const result = await service.list({
        page: currentPage.value,
        size: pageSize.value,
        fields: fields.value,
        filter: filter.value,
        orderBy: orderBy.value,
      });

      items.value = result.data.items;
      total.value = result.data.total;
    } catch (err) {
      error.value = err;
      console.error('DataIterator fetch error:', err);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Toggle sort direction for a field
   * @param {string} field - Field to sort by
   */
  const toggleSort = (field) => {
    if (!field) return;

    if (config.orderable === false) return;

    const currentSort = orderBy.value?.[0];

    if (currentSort) {
      const [currentField, currentDirection = 'asc'] = currentSort.split(':');

      if (currentField === field) {
        if (currentDirection === 'asc') {
          orderBy.value = [`${field}:desc`];
        } else {
          orderBy.value = null;
        }
      } else {
        orderBy.value = [`${field}:asc`];
      }
    } else {
      orderBy.value = [`${field}:asc`];
    }
  };

  /**
   * Get current sort state for a field
   * @param {string} field - Field name
   * @returns {'asc' | 'desc' | null}
   */
  const getSortDirection = (field) => {
    if (!orderBy.value) return null;
    const sortItem = orderBy.value.find((item) => item.startsWith(`${field}:`));
    if (!sortItem) return null;
    const [, direction = 'asc'] = sortItem.split(':');
    return direction;
  };

  /**
   * Refresh data from server
   */
  const refresh = () => {
    return fetchItems();
  };

  /**
   * Reset pagination to first page
   */
  const resetPagination = () => {
    currentPage.value = 1;
  };

  /**
   * Export data with current filters and sorting
   * @param {string} format - Export format: 'csv', 'xlsx', 'json'
   * @returns {Promise<Blob>}
   */
  const exportData = async (format = 'csv') => {
    try {
      const response = await service.export({
        fields: config.exportFields || fields.value,
        filter: filter.value,
        orderBy: orderBy.value,
        format,
      });

      return await response.blob();
    } catch (err) {
      toast.error(formatValidationErrors(err, t('Export failed')));
      throw err;
    }
  };

  /**
   * Import data from a file
   * @param {File} file - File to import (CSV, XLSX, ODS)
   * @returns {Promise<Object>} - Import result with statistics
   */
  const importData = async (file) => {
    try {
      const response = await service.import(file);
      const result = response.data;

      if (result.success > 0) {
        await refresh();
      }

      return result;
    } catch (err) {
      if (err?.data?.detail?.error_details) {
        return err.data.detail;
      }

      toast.error(formatValidationErrors(err, t('Import failed')));
      throw err;
    }
  };

  /**
   * Resequence items with loading state and notifications
   * Wrapper around useSortable's resequence
   * @param {Array<number>} ids - New order of item IDs
   * @returns {Promise<void>}
   */
  const resequenceWithState = async (ids) => {
    try {
      loading.value = true;
      await resequence(ids);
      toast.success(t('Ordre mis à jour avec succès'));
      await refresh();
    } catch (err) {
      toast.error(formatValidationErrors(err, t("Échec de la mise à jour de l'ordre")));
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Selection
  const { isSelectionEnabled, selection } = useSelection({
    enabled: config.enableSelection,
    items,
    total,
  });

  // Watch filter changes - reset to first page and fetch
  watch(
    filter,
    () => {
      if (currentPage.value !== 1) {
        resetPagination();
      } else {
        void fetchItems();
      }
    },
    { deep: true }
  );

  // Watch custom filter changes - reset to first page and fetch
  watch(
    customFilter,
    () => {
      if (currentPage.value !== 1) {
        resetPagination();
      } else {
        void fetchItems();
      }
    },
    { deep: true }
  );

  // Watch sorting changes - update URL and fetch
  watch(
    orderBy,
    (newOrderBy) => {
      const query = { ...route.query };
      const orderByString = orderByArrayToString(newOrderBy);
      if (orderByString) {
        query.order_by = orderByString;
      } else {
        delete query.order_by;
      }
      void router.replace({ query });

      if (currentPage.value !== 1) {
        resetPagination();
      } else {
        void fetchItems();
      }
    },
    { deep: true }
  );

  // Watch page size changes - reset to first page and update URL
  watch(pageSize, (newSize) => {
    resetPagination();

    const query = { ...route.query };
    query.s = newSize.toString();
    void router.replace({ query });
  });

  // Watch page changes - update URL and fetch
  watch(currentPage, (newPage) => {
    const query = { ...route.query };
    if (newPage > 1) {
      query.p = newPage.toString();
    } else {
      delete query.p;
    }
    void router.replace({ query });

    void fetchItems();
  });

  // Initial fetch
  void fetchItems();

  return {
    // Data
    items,
    total,
    loading,
    error,

    // Pagination
    currentPage,
    pageSize,
    availablePageSizes: config.availablePageSizes,
    totalPages: computed(() => Math.ceil(total.value / pageSize.value)),

    // Filter
    filter: customFilter,

    // Order by
    orderBy,
    toggleSort,
    getSortDirection,

    // Sortable
    isSortable,
    resequence: resequenceWithState,

    // Selection
    isSelectionEnabled,
    selection,

    // Methods
    refresh,
    resetPagination,
    exportData,
    importData,
  };
}
