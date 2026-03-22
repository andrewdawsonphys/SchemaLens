/**
 * Schema transformation utilities
 * Functions for converting API data to React Flow format
 */

import { LayoutHandler } from "../layout_handler.jsx";
import { build_recommendation_counts, index_recommendations_by_table } from "./recommendationHelpers.js";

/**
 * Normalize column names for React Flow handles
 * @param {string} columnName - Column name to normalize
 * @returns {string} Normalized handle ID
 */
export function buildColumnHandleId(columnName) {
  const value = String(columnName ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");

  return `col-${value || "unknown"}`;
}

export function transformTablesToNodes(tables, indexedRecommendations = {}) {
  return tables.map((table, i) => {
    const tableName = table.table_name;
    const schemaName = table.table_schema;
    const nodeId = `${schemaName}.${tableName}`;
    
    const tableRecommendations = indexedRecommendations[nodeId.toLowerCase()] || [];
    const counts = build_recommendation_counts(tableRecommendations);

    return {
      id: nodeId,
      type: 'erdNode',
      position: { 
        x: 80 + (i % 3) * 360, 
        y: 40 + Math.floor(i / 3) * 220 
      },
      data: {
        nodeId,
        title: tableName,
        columns: (table.columns ?? []).map((col) => ({
          name: col.column_name,
          type: col.formatted_type,
          ordinalPosition: col.ordinal_position,
          is_primary_key: col.is_primary_key,
          is_foreign_key: col.is_foreign_key
        })),
        recommendations: {
          items: tableRecommendations,
          counts,
        }
      }
    };
  });
}

/**
 * Convert API relationship data to React Flow edge format
 * @param {Array} relationships - Array of relationship objects from API
 * @returns {Array} Array of React Flow edge objects
 */
export function transformRelationshipsToEdges(relationships) {
  const relationshipRows = Array.isArray(relationships)
    ? relationships
    : (relationships?.relationships ?? relationships?.data?.relationships ?? []);

  return relationshipRows
    .map((row) => {
      const referencing_id = `${row.referencing_table_schema}.${row.referencing_table_name}`.toLowerCase();
      const referenced_id = `${row.referenced_table_schema}.${row.referenced_table_name}`.toLowerCase();

      const constraint_name = row.constraint_name;
      const referencing_column_name = buildColumnHandleId(row.referencing_column_name);
      const referenced_column_name = buildColumnHandleId(row.referenced_column_name);
      const relationship_type = row.relationship_type;

      const id = `edge-${row.referencing_table_schema}.${row.referenced_table_schema}.${row.referencing_table_name}.${row.referenced_table_name}`;

      return {
        id: id,
        source: referencing_id,
        target: referenced_id,
        sourceHandle: referencing_column_name,
        targetHandle: referenced_column_name,
        type: "erdEdge",
        data: {
          constraintName: constraint_name,
          relationshipType: relationship_type,
        },
      };
    })
    .filter(Boolean);
}

/**
 * Transform API schema data to React Flow compatible format
 * @param {Object|Array} schema - Schema data from API
 * @param {Array} relationships - Relationship data from API
 * @param {Array} recommendations - Recommendation data from API
 * @returns {Object} Object with nodes and edges arrays for React Flow
 */
export function mapSchemaToFlow(schema, relationships = [], recommendations = []) {
  const tables = Array.isArray(schema) ? schema : (schema?.tables ?? []);
  
  if (!tables.length) {
    console.warn('No tables found in schema data');
    return { nodes: [], edges: [] };
  }

  const indexedRecommendations = index_recommendations_by_table(recommendations, "public");
  const nodes = transformTablesToNodes(tables, indexedRecommendations);
  const edges = transformRelationshipsToEdges(relationships);

  // Apply automatic layout
  const layoutHandler = new LayoutHandler();
  const layoutedNodes = layoutHandler.applyAutoLayout(nodes, edges);

  return { 
    nodes: layoutedNodes, 
    edges 
  };
}

/**
 * Parse table ID into schema and table name components
 * @param {string} tableId - Table identifier in format "schema.table_name"
 * @returns {Object} Object with tableSchema and tableName properties
 */
export function parseTableId(tableId) {
  const [tableSchema = "public", tableName = ""] = String(tableId || "").split(".");
  return { tableSchema, tableName };
}

/**
 * Format table ID from schema and table name
 * @param {string} schema - Table schema
 * @param {string} tableName - Table name
 * @returns {string} Formatted table ID
 */
export function formatTableId(schema, tableName) {
  return `${schema || 'public'}.${tableName}`;
}