/**
 * Get nested property value using dot notation
 * @param {Object} obj - Source object
 * @param {string} path - Dot notation path (e.g., 'user.profile.name')
 * @param {any} defaultValue - Default value if path not found
 * @returns {any}
 */
export function getNestedValue(obj, path, defaultValue) {
  if (!obj || !path) return defaultValue;

  return (
    path.split('.').reduce((acc, part) => {
      return acc?.[part];
    }, obj) ?? defaultValue
  );
}

/**
 * Format cell value based on column type
 * @param {any} value - Value to format
 * @param {Object} column - Column definition
 * @returns {string}
 */
export function formatCellValue(value, column) {
  if (value == null) return '-';

  switch (column.type) {
    case 'date':
      return new Date(value).toLocaleDateString('fr-FR');
    case 'datetime':
      return new Date(value).toLocaleString('fr-FR');
    case 'boolean':
      return value ? 'Oui' : 'Non';
    case 'number':
      return typeof value === 'number' ? value.toLocaleString('fr-FR') : value;
    case 'currency':
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: column.currency || 'EUR',
      }).format(value);
    default:
      return value;
  }
}

/**
 * Build order_by string from field and direction
 * @param {string} field - Field name (supports dot notation)
 * @param {string} direction - Sort direction ('asc' or 'desc')
 * @returns {string}
 */
export function buildOrderBy(field, direction) {
  return `${field}:${direction}`;
}

/**
 * Parse order_by string to field and direction
 * @param {string} orderBy - Order by string (e.g., 'name:asc')
 * @returns {{ field: string, direction: string } | null}
 */
export function parseOrderBy(orderBy) {
  if (!orderBy) return null;
  const [field, direction = 'asc'] = orderBy.split(':');
  return { field, direction };
}

/**
 * Trigger download of a blob as a file
 * @param {Blob} blob - The blob to download
 * @param {string} filename - The filename for the download
 */
export function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
