/**
 * Recommendation utilities
 * Functions for processing, counting, and indexing recommendations
 */

export function build_recommendation_counts(items = []) {
  return {
    error: items.filter((item) => item.type === "error").length,
    warning: items.filter((item) => item.type === "warning").length,
    info: items.filter((item) => item.type === "info").length,
  };
}

export function index_recommendations_by_table(items = [], fallbackSchema = "public") {
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


export function filter_recommendations_by_type(items = [], type) {
  if (!type) return items;
  return items.filter((item) => item.type === type);
}

export function get_recommendation_types(items = []) {
  return [...new Set(items.map(item => item.type))];
}

export function has_errors(items = []) {
  return items.some(item => item.type === 'error');
}

export function sort_recommendations_by_priority(items = []) {
  const typePriority = { error: 0, warning: 1, info: 2 };
  
  return [...items].sort((a, b) => {
    const priorityA = typePriority[a.type] ?? 3;
    const priorityB = typePriority[b.type] ?? 3;
    return priorityA - priorityB;
  });
}

export function calculate_schema_score(counts, total_issues) {
  if (total_issues === 0) return 100;
  const penalty = (counts.error * 10) + (counts.warning * 5) + (counts.info * 2);
  return Math.max(0, 100-penalty);
};

export function get_score_color(score) {
  if (score >= 80) return 'text-green-600 dark:text-green-400';
  if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
}

export function get_score_status(score) {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Needs Work';
}