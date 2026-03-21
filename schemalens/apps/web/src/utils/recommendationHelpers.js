/**
 * Recommendation utilities
 * Functions for processing, counting, and indexing recommendations
 */

/**
 * Count recommendations by type (error, warning, info)
 * @param {Array} items - Array of recommendation items
 * @returns {Object} Count object with error, warning, info properties
 */
export function buildRecommendationCounts(items = []) {
  return {
    error: items.filter((item) => item.type === "error").length,
    warning: items.filter((item) => item.type === "warning").length,
    info: items.filter((item) => item.type === "info").length,
  };
}

/**
 * Group recommendations by table identifier (schema.table_name)
 * @param {Array} items - Array of recommendation items
 * @param {string} fallbackSchema - Default schema if not specified in item
 * @returns {Object} Object indexed by table ID containing arrays of recommendations
 */
export function indexRecommendationsByTable(items = [], fallbackSchema = "public") {
  return items.reduce((acc, item) => {
    const schema = item.table_schema || fallbackSchema;
    const key = `${schema}.${item.table_name}`.toLowerCase();

    if (!acc[key]) {
      acc[key] = [];
    }

    acc[key].push(item);
    return acc;
  }, {});
}

/**
 * Filter recommendations by type
 * @param {Array} items - Array of recommendation items
 * @param {string} type - Type to filter by ('error', 'warning', 'info')
 * @returns {Array} Filtered recommendations
 */
export function filterRecommendationsByType(items = [], type) {
  if (!type) return items;
  return items.filter((item) => item.type === type);
}

/**
 * Get unique recommendation types from items
 * @param {Array} items - Array of recommendation items
 * @returns {Array} Array of unique types
 */
export function getRecommendationTypes(items = []) {
  return [...new Set(items.map(item => item.type))];
}

/**
 * Check if recommendations have any errors
 * @param {Array} items - Array of recommendation items
 * @returns {boolean} True if any errors exist
 */
export function hasErrors(items = []) {
  return items.some(item => item.type === 'error');
}

/**
 * Sort recommendations by priority (error > warning > info)
 * @param {Array} items - Array of recommendation items
 * @returns {Array} Sorted recommendations
 */
export function sortRecommendationsByPriority(items = []) {
  const typePriority = { error: 0, warning: 1, info: 2 };
  
  return [...items].sort((a, b) => {
    const priorityA = typePriority[a.type] ?? 3;
    const priorityB = typePriority[b.type] ?? 3;
    return priorityA - priorityB;
  });
}