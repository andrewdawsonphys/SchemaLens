/**
 * Schema transformation utilities
 * Functions for converting API data to React Flow format
 */

import { LayoutHandler } from "../layout_handler.jsx";
import { build_recommendation_counts, index_recommendations_by_table } from "./recommendationHelpers.js";

/**
 * Schema color palette for grouping
 */
const SCHEMA_COLORS = [
  { bg: 'rgba(59, 130, 246, 0.08)', border: 'rgba(59, 130, 246, 0.2)', name: 'blue' },
  { bg: 'rgba(16, 185, 129, 0.08)', border: 'rgba(16, 185, 129, 0.2)', name: 'green' },
  { bg: 'rgba(245, 101, 101, 0.08)', border: 'rgba(245, 101, 101, 0.2)', name: 'red' },
  { bg: 'rgba(251, 191, 36, 0.08)', border: 'rgba(251, 191, 36, 0.2)', name: 'yellow' },
  { bg: 'rgba(139, 92, 246, 0.08)', border: 'rgba(139, 92, 246, 0.2)', name: 'purple' },
  { bg: 'rgba(236, 72, 153, 0.08)', border: 'rgba(236, 72, 153, 0.2)', name: 'pink' },
  { bg: 'rgba(6, 182, 212, 0.08)', border: 'rgba(6, 182, 212, 0.2)', name: 'cyan' },
  { bg: 'rgba(161, 161, 170, 0.08)', border: 'rgba(161, 161, 170, 0.2)', name: 'gray' },
];

/**
 * Get color for schema
 */
function getSchemaColor(schemaName, schemaNames) {
  const index = schemaNames.indexOf(schemaName);
  return SCHEMA_COLORS[index % SCHEMA_COLORS.length];
}

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
  // Get unique schema names for color assignment
  const schemaNames = [...new Set(tables.map(table => table.table_schema))].sort();
  
  return tables.map((table, i) => {
    const tableName = table.table_name;
    const schemaName = table.table_schema;
    const nodeId = `${schemaName}.${tableName}`;
    
    const tableRecommendations = indexedRecommendations[nodeId.toLowerCase()] || [];
    const counts = build_recommendation_counts(tableRecommendations);
    const schemaColor = getSchemaColor(schemaName, schemaNames);

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
        schemaName,
        schemaColor,
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

  // Group nodes by schema
  const schemaGroups = nodes.reduce((groups, node) => {
    const schemaName = node.data.schemaName;
    if (!groups[schemaName]) {
      groups[schemaName] = [];
    }
    groups[schemaName].push(node);
    return groups;
  }, {});

  const layoutHandler = new LayoutHandler();
  let layoutedNodes = [];
  let schemaGroupNodes = [];
  let currentXOffset = 0;
  const SCHEMA_SPACING = 100; // Space between schema groups

  // Layout each schema group separately
  Object.entries(schemaGroups).forEach(([schemaName, schemaNodes], schemaIndex) => {
    if (schemaNodes.length === 0) return;

    // Get edges that are internal to this schema
    const schemaEdges = edges.filter(edge => {
      const sourceSchema = nodes.find(n => n.id === edge.source)?.data?.schemaName;
      const targetSchema = nodes.find(n => n.id === edge.target)?.data?.schemaName;
      return sourceSchema === schemaName && targetSchema === schemaName;
    });

    // Apply layout to this schema group
    const layoutedSchemaNodes = layoutHandler.applyAutoLayout(schemaNodes, schemaEdges);
    
    // Calculate schema group bounds
    const positions = layoutedSchemaNodes.map(node => ({ x: node.position.x, y: node.position.y }));
    const minX = Math.min(...positions.map(p => p.x));
    const maxX = Math.max(...positions.map(p => p.x)) + 320; // Node width
    const minY = Math.min(...positions.map(p => p.y));
    const maxY = Math.max(...positions.map(p => p.y)) + 200; // Approximate node height
    
    const groupWidth = maxX - minX;
    const groupHeight = maxY - minY;
    
    // Offset nodes to prevent schema overlap
    const offsetNodes = layoutedSchemaNodes.map(node => ({
      ...node,
      position: {
        x: node.position.x + currentXOffset - minX + 30, // 30px padding
        y: node.position.y - minY + 30
      }
    }));
    
    // Create schema group background
    const schemaColor = schemaNodes[0]?.data?.schemaColor || SCHEMA_COLORS[0];
    const groupNode = {
      id: `schema-group-${schemaName}`,
      type: 'schemaGroup',
      position: { x: currentXOffset, y: 0 },
      data: {
        label: schemaName
      },
      style: {
        width: groupWidth + 60, // Add padding
        height: groupHeight + 60,
        backgroundColor: schemaColor.background,
        border: `2px solid ${schemaColor.border}`,
        borderRadius: '8px',
        zIndex: -1
      },
      draggable: false,
      selectable: false
    };

    layoutedNodes.push(...offsetNodes);
    schemaGroupNodes.push(groupNode);
    
    // Update offset for next schema group
    currentXOffset += groupWidth + 60 + SCHEMA_SPACING;
  });

  // Combine all nodes (groups first so they appear behind tables)
  const allNodes = [...schemaGroupNodes, ...layoutedNodes];

  return { 
    nodes: allNodes, 
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