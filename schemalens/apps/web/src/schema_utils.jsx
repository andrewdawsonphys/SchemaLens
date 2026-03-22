/**
 * DEPRECATED: This file is being phased out.
 * 
 * Import functions from their new locations:
 * - API functions: './services/api.js'
 * - Schema transformation: './utils/schemaTransform.js' 
 * - Recommendation helpers: './utils/recommendationHelpers.js'
 */

// Re-exports for backward compatibility during refactoring
export { 
  fetchRecommendations, 
  fetchAllSchemaData 
} from './services/api.js';

export { 
  buildColumnHandleId as build_column_handle_id,
  mapSchemaToFlow as _map_schema_to_flow 
} from './utils/schemaTransform.js';

export { 
  build_recommendation_counts,
  index_recommendations_by_table 
} from './utils/recommendationHelpers.js';

// Backward compatibility wrapper for load_schema
export async function load_schema(setFlow) {
  const { fetchAllSchemaData } = await import('./services/api.js');
  const { mapSchemaToFlow } = await import('./utils/schemaTransform.js');
  
  try {
    const { schema, relationships, recommendations } = await fetchAllSchemaData();
    
    if (!schema) {
      throw new Error('Failed to load schema data');
    }

    const flowData = mapSchemaToFlow(schema, relationships, recommendations);
    setFlow(flowData);
  } catch (error) {
    console.error('Failed to load schema:', error);
    setFlow({ nodes: [], edges: [] });
  }
}