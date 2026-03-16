import { LayoutHandler } from "./layout_handler";

const API_BASE_URL = "http://localhost:8000/api/v1";

export function build_column_handle_id(columnName) {
  const value = String(columnName ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");

  return `col-${value || "unknown"}`;
}

export async function load_schema(setFlow) {
    try {
    const schemaResponse = await fetch(`${API_BASE_URL}/schema`);
    if (!schemaResponse.ok) throw new Error(`API Error: ${schemaResponse.status}`);

    const schemaData = await schemaResponse.json();

    let relationshipsData = [];

    try {
        const relationshipsResponse = await fetch(`${API_BASE_URL}/relationships`);
        if (relationshipsResponse.ok) {
        const parsed = await relationshipsResponse.json();

        if (!parsed?.message) {
            relationshipsData = parsed;
        }
        }
    } catch (error) {
        console.warn("Relationships endpoint unavailable, continuing without edges", error);
    }

    const mapped = _map_schema_to_flow(schemaData, relationshipsData);
    console.log("Loaded relationships:", relationshipsData);
    console.log("Mapped flow:", mapped);
    setFlow(mapped);
    } catch (error) {
    console.error("Failed to load schema", error);
    }

}

function _map_schema_to_flow(schema, relationships = []) {

  const tables = Array.isArray(schema) ? schema : schema.tables;

  const nodes = tables.map((table, i) => {
    const tableName = table.table_name
    const schemaName = table.table_schema
    const nodeId = `${schemaName}.${tableName}`;

    return {
      id: nodeId,
      type: 'erdNode',
      position: { x: 80 + (i % 3) * 360, y: 40 + Math.floor(i / 3) * 220 },
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
      },
    };
  });

  const relationshipRows = Array.isArray(relationships)
    ? relationships
    : (relationships?.relationships ?? relationships?.data?.relationships ?? []);

  const edges = relationshipRows
    .map((row) => {

      const referencing_id = `${row.referencing_table_schema}.${row.referencing_table_name}`.toLowerCase();
      const referenced_id = `${row.referenced_table_schema}.${row.referenced_table_name}`.toLowerCase();

      const constraint_name = row.constraint_name;
      const referencing_column_name = build_column_handle_id(row.referencing_column_name);
      const referenced_column_name = build_column_handle_id(row.referenced_column_name);
      const relationship_type = row.relationship_type;

      const id = `edge-${row.referencing_table_schema}.${row.referenced_table_schema}.${row.referencing_table_name}.${row.referenced_table_name}`

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

  return { nodes: new LayoutHandler().applyAutoLayout(nodes, edges), edges };
}