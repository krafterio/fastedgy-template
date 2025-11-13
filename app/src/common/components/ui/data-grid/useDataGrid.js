import { useDataIterator } from "../data-iterator/index.js";

/**
 * Composable for DataGrid with server-side pagination, filters, and sorting
 *
 * @param {string} modelName - Model name (e.g., 'retail_chains', 'tasks')
 * @param {Object} options - Configuration options
 * @param {Array<string>} options.fields - Simple field names ['id', 'name', 'logo']
 * @param {Array} options.additionalFields - Additional fields to fetch (not displayed)
 * @param {number} options.pageSize - Default items per page (default: 24)
 * @param {Array} options.availablePageSizes - Available page sizes (default: [12, 24, 48, 96])
 * @param {Array<string>} options.defaultOrderBy - Default sort ['field:asc', 'field2:desc']
 * @param {Array<string>} options.exportFields - Fields to export (default: use fields)
 * @param {Array} options.filter - Restrictive filters to always apply (combined with custom filters)
 * @param {string} options.prefix - Prefix for the API (default: "/{app}")
 * @param {Object} options.headers - Custom headers for API requests (default: null)
 * @param {boolean} options.enableSelection - Enable item selection (default: false)
 * @returns {Object} - DataGrid state and methods
 */
export function useDataGrid(modelName, options = {}) {
    const fieldsResolver = () => {
        const baseFields = options.fields || [];
        const additionalFields = options.additionalFields || [];
        return [...baseFields, ...additionalFields];
    };

    return useDataIterator(modelName, {
        ...options,
        fieldsResolver,
        pageSize: options.pageSize || 24,
        availablePageSizes: options.availablePageSizes || [12, 24, 48, 96],
    });
}
