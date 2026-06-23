/**
 * Converts a DatePicker object or date string to ISO date format (YYYY-MM-DD)
 * @param {Object|string|null} dateValue - Date value from DatePicker component or string
 * @returns {string|null} ISO date string or null
 */
export function formatDateForApi(dateValue) {
  if (!dateValue) return null;

  // If it's already a string, return it
  if (typeof dateValue === 'string') return dateValue;

  // If it's a DatePicker object with year/month/day
  if (dateValue.year && dateValue.month && dateValue.day) {
    const year = dateValue.year;
    const month = String(dateValue.month).padStart(2, '0');
    const day = String(dateValue.day).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // If it's a Date object
  if (dateValue instanceof Date) {
    return dateValue.toISOString().split('T')[0];
  }

  return null;
}

/**
 * Converts empty strings to null (useful for optional URL fields)
 * @param {string} value - String value
 * @returns {string|null} String or null
 */
export function emptyToNull(value) {
  return value && value.trim() !== '' ? value : null;
}

/**
 * Cleans form data before sending to API
 * - Converts DatePicker objects to ISO date strings
 * - Converts empty strings to null for specified fields
 * - Converts string IDs to integers for specified fields
 * @param {Record<string, any>} data - Form data object
 * @param {Object} options - Cleaning options
 * @param {string[]} [options.dateFields] - Array of date field names
 * @param {string[]} [options.urlFields] - Array of URL field names (empty strings become null)
 * @param {string[]} [options.nullableFields] - Array of field names where empty strings become null
 * @param {string[]} [options.intFields] - Array of field names to convert to integers
 * @param {string[]} [options.intArrayFields] - Array of field names containing arrays of IDs to convert to integers
 * @returns {Object} Cleaned data object
 */
export function cleanFormDataForApi(data, options = {}) {
  const { dateFields = [], urlFields = [], nullableFields = [], intFields = [], intArrayFields = [] } = options;

  const cleaned = { ...data };

  // Convert date fields
  dateFields.forEach((field) => {
    if (field in cleaned) {
      cleaned[field] = formatDateForApi(cleaned[field]);
    }
  });

  // Convert URL fields (empty strings to null)
  urlFields.forEach((field) => {
    if (field in cleaned) {
      cleaned[field] = emptyToNull(cleaned[field]);
    }
  });

  // Convert nullable fields (empty strings to null)
  nullableFields.forEach((field) => {
    if (field in cleaned) {
      cleaned[field] = emptyToNull(cleaned[field]);
    }
  });

  // Convert int fields
  intFields.forEach((field) => {
    if (field in cleaned && cleaned[field] !== null && cleaned[field] !== '') {
      cleaned[field] = parseInt(cleaned[field]);
    } else if (field in cleaned) {
      cleaned[field] = null;
    }
  });

  // Convert int array fields
  intArrayFields.forEach((field) => {
    if (field in cleaned && Array.isArray(cleaned[field])) {
      cleaned[field] = cleaned[field].map((id) => parseInt(id));
    }
  });

  return cleaned;
}
