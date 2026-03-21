/**
 * API service layer for SchemaLens
 * Centralizes all API calls and data fetching logic
 */

const API_BASE_URL = "http://localhost:8000/api/v1";

/**
 * Generic API error handler
 */
class ApiError extends Error {
  constructor(message, status, endpoint) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.endpoint = endpoint;
  }
}

/**
 * Generic fetch wrapper with consistent error handling
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new ApiError(
        `API request failed: ${response.statusText}`,
        response.status,
        endpoint
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(`Network error: ${error.message}`, 0, endpoint);
  }
}

/**
 * Fetch database schema information
 */
export async function fetchSchema() {
  return apiRequest('/schema');
}

/**
 * Fetch table relationships
 */
export async function fetchRelationships() {
  try {
    const data = await apiRequest('/relationships');
    return data?.message ? [] : data;
  } catch (error) {
    console.warn('Relationships endpoint unavailable:', error.message);
    return [];
  }
}

/**
 * Fetch recommendations with optional filtering
 * @param {Object} params - Filter parameters
 * @param {string} [params.table_name] - Filter by table name
 * @param {string} [params.table_schema] - Filter by schema (default: 'public')
 */
export async function fetchRecommendations({ table_name, table_schema = "public" } = {}) {
  const params = new URLSearchParams();

  if (table_name) {
    params.set("table_name", table_name);
  }

  if (table_schema) {
    params.set("table_schema", table_schema);
  }

  const query = params.toString();
  const endpoint = query ? `/recommendations?${query}` : `/recommendations`;

  try {
    const data = await apiRequest(endpoint);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn('Recommendations endpoint unavailable:', error.message);
    return [];
  }
}

/**
 * Load all schema data (schema + relationships + recommendations) in parallel
 */
export async function fetchAllSchemaData() {
  try {
    const [schema, relationships, recommendations] = await Promise.allSettled([
      fetchSchema(),
      fetchRelationships(),
      fetchRecommendations({ table_schema: "public" })
    ]);

    return {
      schema: schema.status === 'fulfilled' ? schema.value : null,
      relationships: relationships.status === 'fulfilled' ? relationships.value : [],
      recommendations: recommendations.status === 'fulfilled' ? recommendations.value : [],
      errors: [
        schema.status === 'rejected' ? schema.reason : null,
        relationships.status === 'rejected' ? relationships.reason : null,
        recommendations.status === 'rejected' ? recommendations.reason : null,
      ].filter(Boolean)
    };
  } catch (error) {
    throw new ApiError(`Failed to load schema data: ${error.message}`, 0, '/all-schema-data');
  }
}