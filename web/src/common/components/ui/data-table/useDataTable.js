import { computed } from 'vue';
import { useMetadataStore } from 'vue-fastedgy';
import { useDataIterator } from '../data-iterator/index.js';

/**
 * Composable for DataTable with server-side pagination, filters, and sorting
 *
 * @param {string} modelName - Model name (e.g., 'retail_chains', 'tasks')
 * @param {Object} options - Configuration options
 * @param {Array} options.columns - Column definitions [{key, label, width, sortable, type}, ...]
 * @param {Array} options.additionalFields - Additional fields to fetch (not displayed)
 * @param {number} options.pageSize - Default items per page (default: 100, persisted in localStorage)
 * @param {Array} options.availablePageSizes - Available page sizes (default: [25, 50, 100, 150, 200])
 * @param {Array<string>} options.defaultOrderBy - Default sort ['field:asc', 'field2:desc']
 * @param {Array<string>} options.exportFields - Fields to export (default: use table columns)
 * @param {Array} options.filter - Restrictive filters to always apply (combined with custom filters)
 * @param {string} options.prefix - Prefix for the API (default: "/{app}")
 * @param {Object} options.headers - Custom headers for API requests (default: null)
 * @param {boolean} options.orderable - Enable column sorting (default: true)
 * @param {boolean} options.enableSelection - Enable row selection (default: false)
 * @returns {Object} - DataTable state and methods
 */
export function useDataTable(modelName, options = {}) {
  // Metadata store
  const metadataStore = useMetadataStore();

  /**
   * Enrich column with metadata information
   * Adds type, sortable, and meta information from model metadata
   */
  const enrichColumnWithMetadata = (column, metadata) => {
    if (!metadata?.fields) return column;

    const fieldPath = column.key.split('.');
    let fieldMetadata = metadata.fields[fieldPath[0]];

    for (let i = 1; i < fieldPath.length && fieldMetadata; i++) {
      if (fieldMetadata.target) {
        const targetMetadata = metadataStore.getMetadata(fieldMetadata.target);
        fieldMetadata = targetMetadata?.fields?.[fieldPath[i]];
      } else {
        fieldMetadata = null;
      }
    }

    if (!fieldMetadata) return column;

    return {
      ...column,
      sortable: column.sortable !== undefined ? column.sortable : fieldMetadata.sortable !== false,
      type: column.type || fieldMetadata.type || 'string',
      meta: fieldMetadata,
    };
  };

  const enrichedColumns = computed(() => {
    if (!options.columns) return [];

    const metadata = metadataStore.getMetadata(modelName);
    if (!metadata) return options.columns;

    return options.columns.map((col) => enrichColumnWithMetadata(col, metadata));
  });

  const fieldsResolver = () => {
    const columnFields = enrichedColumns.value?.map((col) => col.key) || [];
    const additionalFields = options.additionalFields || [];
    return [...columnFields, ...additionalFields];
  };

  const isSortableFromMetadata = (() => {
    const metadata = metadataStore.getMetadata(modelName);
    if (options.sortable === undefined && metadata?.sortable) {
      return true;
    }
    return options.sortable === true;
  })();

  const iterator = useDataIterator(modelName, {
    ...options,
    fieldsResolver,
    pageSize: options.pageSize || 100,
    availablePageSizes: options.availablePageSizes || [25, 50, 100, 150, 200],
    sortable: isSortableFromMetadata,
  });

  return {
    ...iterator,
    columns: enrichedColumns,
  };
}
