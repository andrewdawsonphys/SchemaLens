/**
 * API service layer for SchemaLens - DEMO VERSION
 * Returns static mock data showcasing multi-schema database structure
 */

// Mock data showcasing multi-schema database structure
const MOCK_SCHEMA_DATA = [
  // USER MANAGEMENT SCHEMA
  {
    table_name: "users",
    table_schema: "user_management",
    columns: [
      { column_name: "user_id", formatted_type: "integer", is_nullable: "NO", is_primary_key: true, is_foreign_key: false, ordinal_position: 1 },
      { column_name: "email", formatted_type: "character varying(255)", is_nullable: "NO", is_primary_key: false, is_foreign_key: false, ordinal_position: 2 },
      { column_name: "password_hash", formatted_type: "character varying(255)", is_nullable: "NO", is_primary_key: false, is_foreign_key: false, ordinal_position: 3 },
      { column_name: "first_name", formatted_type: "character varying(100)", is_nullable: "YES", is_primary_key: false, is_foreign_key: false, ordinal_position: 4 },
      { column_name: "last_name", formatted_type: "character varying(100)", is_nullable: "YES", is_primary_key: false, is_foreign_key: false, ordinal_position: 5 },
      { column_name: "created_at", formatted_type: "timestamp without time zone", is_nullable: "YES", is_primary_key: false, is_foreign_key: false, ordinal_position: 6 },
      { column_name: "is_active", formatted_type: "boolean", is_nullable: "YES", is_primary_key: false, is_foreign_key: false, ordinal_position: 7 }
    ]
  },
  {
    table_name: "user_roles", 
    table_schema: "user_management",
    columns: [
      { column_name: "role_id", formatted_type: "integer", is_nullable: "NO", is_primary_key: true, is_foreign_key: false, ordinal_position: 1 },
      { column_name: "role_name", formatted_type: "character varying(50)", is_nullable: "NO", is_primary_key: false, is_foreign_key: false, ordinal_position: 2 },
      { column_name: "description", formatted_type: "text", is_nullable: "YES", is_primary_key: false, is_foreign_key: false, ordinal_position: 3 },
      { column_name: "created_at", formatted_type: "timestamp without time zone", is_nullable: "YES", is_primary_key: false, is_foreign_key: false, ordinal_position: 4 }
    ]
  },
  {
    table_name: "user_sessions",
    table_schema: "user_management",
    columns: [
      { column_name: "session_id", formatted_type: "character varying(255)", is_nullable: "NO", is_primary_key: true, is_foreign_key: false, ordinal_position: 1 },
      { column_name: "user_id", formatted_type: "integer", is_nullable: "NO", is_primary_key: false, is_foreign_key: true, ordinal_position: 2 },
      { column_name: "created_at", formatted_type: "timestamp without time zone", is_nullable: "YES", is_primary_key: false, is_foreign_key: false, ordinal_position: 3 },
      { column_name: "expires_at", formatted_type: "timestamp without time zone", is_nullable: "NO", is_primary_key: false, is_foreign_key: false, ordinal_position: 4 },
      { column_name: "ip_address", formatted_type: "inet", is_nullable: "YES", is_primary_key: false, is_foreign_key: false, ordinal_position: 5 }
    ]
  },

  // ECOMMERCE SCHEMA
  {
    table_name: "products",
    table_schema: "ecommerce", 
    columns: [
      { column_name: "product_id", formatted_type: "integer", is_nullable: "NO", is_primary_key: true, is_foreign_key: false, ordinal_position: 1 },
      { column_name: "product_name", formatted_type: "character varying(255)", is_nullable: "NO", is_primary_key: false, is_foreign_key: false, ordinal_position: 2 },
      { column_name: "category_id", formatted_type: "integer", is_nullable: "YES", is_primary_key: false, is_foreign_key: true, ordinal_position: 3 },
      { column_name: "description", formatted_type: "text", is_nullable: "YES", is_primary_key: false, is_foreign_key: false, ordinal_position: 4 },
      { column_name: "price", formatted_type: "numeric(10,2)", is_nullable: "NO", is_primary_key: false, is_foreign_key: false, ordinal_position: 5 },
      { column_name: "stock_quantity", formatted_type: "integer", is_nullable: "YES", is_primary_key: false, is_foreign_key: false, ordinal_position: 6 },
      { column_name: "created_by", formatted_type: "integer", is_nullable: "YES", is_primary_key: false, is_foreign_key: true, ordinal_position: 7 }
    ]
  },
  {
    table_name: "categories",
    table_schema: "ecommerce",
    columns: [
      { column_name: "category_id", formatted_type: "integer", is_nullable: "NO", is_primary_key: true, is_foreign_key: false, ordinal_position: 1 },
      { column_name: "category_name", formatted_type: "character varying(100)", is_nullable: "NO", is_primary_key: false, is_foreign_key: false, ordinal_position: 2 },
      { column_name: "parent_category_id", formatted_type: "integer", is_nullable: "YES", is_primary_key: false, is_foreign_key: true, ordinal_position: 3 },
      { column_name: "description", formatted_type: "text", is_nullable: "YES", is_primary_key: false, is_foreign_key: false, ordinal_position: 4 }
    ]
  },
  {
    table_name: "orders",
    table_schema: "ecommerce",
    columns: [
      { column_name: "order_id", formatted_type: "integer", is_nullable: "NO", is_primary_key: true, is_foreign_key: false, ordinal_position: 1 },
      { column_name: "customer_id", formatted_type: "integer", is_nullable: "YES", is_primary_key: false, is_foreign_key: true, ordinal_position: 2 },
      { column_name: "order_status", formatted_type: "character varying(20)", is_nullable: "YES", is_primary_key: false, is_foreign_key: false, ordinal_position: 3 },
      { column_name: "total_amount", formatted_type: "numeric(10,2)", is_nullable: "NO", is_primary_key: false, is_foreign_key: false, ordinal_position: 4 },
      { column_name: "created_at", formatted_type: "timestamp without time zone", is_nullable: "YES", is_primary_key: false, is_foreign_key: false, ordinal_position: 5 }
    ]
  },
  {
    table_name: "order_items",
    table_schema: "ecommerce", 
    columns: [
      { column_name: "order_item_id", formatted_type: "integer", is_nullable: "NO", is_primary_key: true, is_foreign_key: false, ordinal_position: 1 },
      { column_name: "order_id", formatted_type: "integer", is_nullable: "NO", is_primary_key: false, is_foreign_key: true, ordinal_position: 2 },
      { column_name: "product_id", formatted_type: "integer", is_nullable: "YES", is_primary_key: false, is_foreign_key: true, ordinal_position: 3 },
      { column_name: "quantity", formatted_type: "integer", is_nullable: "NO", is_primary_key: false, is_foreign_key: false, ordinal_position: 4 },
      { column_name: "unit_price", formatted_type: "numeric(10,2)", is_nullable: "NO", is_primary_key: false, is_foreign_key: false, ordinal_position: 5 }
    ]
  },

  // ANALYTICS SCHEMA
  {
    table_name: "user_activity_summary",
    table_schema: "analytics",
    columns: [
      { column_name: "summary_id", formatted_type: "integer", is_nullable: "NO", is_primary_key: true, is_foreign_key: false, ordinal_position: 1 },
      { column_name: "user_id", formatted_type: "integer", is_nullable: "YES", is_primary_key: false, is_foreign_key: true, ordinal_position: 2 },
      { column_name: "date", formatted_type: "date", is_nullable: "NO", is_primary_key: false, is_foreign_key: false, ordinal_position: 3 },
      { column_name: "login_count", formatted_type: "integer", is_nullable: "YES", is_primary_key: false, is_foreign_key: false, ordinal_position: 4 },
      { column_name: "pages_viewed", formatted_type: "integer", is_nullable: "YES", is_primary_key: false, is_foreign_key: false, ordinal_position: 5 },
      { column_name: "time_spent_minutes", formatted_type: "integer", is_nullable: "YES", is_primary_key: false, is_foreign_key: false, ordinal_position: 6 }
    ]
  },
  {
    table_name: "product_performance",
    table_schema: "analytics",
    columns: [
      { column_name: "performance_id", formatted_type: "integer", is_nullable: "NO", is_primary_key: true, is_foreign_key: false, ordinal_position: 1 },
      { column_name: "product_id", formatted_type: "integer", is_nullable: "YES", is_primary_key: false, is_foreign_key: true, ordinal_position: 2 },
      { column_name: "date", formatted_type: "date", is_nullable: "NO", is_primary_key: false, is_foreign_key: false, ordinal_position: 3 },
      { column_name: "views", formatted_type: "integer", is_nullable: "YES", is_primary_key: false, is_foreign_key: false, ordinal_position: 4 },
      { column_name: "orders", formatted_type: "integer", is_nullable: "YES", is_primary_key: false, is_foreign_key: false, ordinal_position: 5 },
      { column_name: "revenue", formatted_type: "numeric(10,2)", is_nullable: "YES", is_primary_key: false, is_foreign_key: false, ordinal_position: 6 }
    ]
  },

  // SYSTEM LOGS SCHEMA  
  {
    table_name: "application_logs",
    table_schema: "system_logs",
    columns: [
      { column_name: "log_id", formatted_type: "bigint", is_nullable: "NO", is_primary_key: true, is_foreign_key: false, ordinal_position: 1 },
      { column_name: "log_level", formatted_type: "character varying(20)", is_nullable: "NO", is_primary_key: false, is_foreign_key: false, ordinal_position: 2 },
      { column_name: "message", formatted_type: "text", is_nullable: "NO", is_primary_key: false, is_foreign_key: false, ordinal_position: 3 },
      { column_name: "user_id", formatted_type: "integer", is_nullable: "YES", is_primary_key: false, is_foreign_key: true, ordinal_position: 4 },
      { column_name: "created_at", formatted_type: "timestamp without time zone", is_nullable: "YES", is_primary_key: false, is_foreign_key: false, ordinal_position: 5 }
    ]
  },
  {
    table_name: "error_logs", 
    table_schema: "system_logs",
    columns: [
      { column_name: "error_id", formatted_type: "bigint", is_nullable: "NO", is_primary_key: true, is_foreign_key: false, ordinal_position: 1 },
      { column_name: "error_code", formatted_type: "character varying(50)", is_nullable: "YES", is_primary_key: false, is_foreign_key: false, ordinal_position: 2 },
      { column_name: "error_message", formatted_type: "text", is_nullable: "NO", is_primary_key: false, is_foreign_key: false, ordinal_position: 3 },
      { column_name: "user_id", formatted_type: "integer", is_nullable: "YES", is_primary_key: false, is_foreign_key: true, ordinal_position: 4 },
      { column_name: "created_at", formatted_type: "timestamp without time zone", is_nullable: "YES", is_primary_key: false, is_foreign_key: false, ordinal_position: 5 }
    ]
  }
];

// Mock relationship data showcasing cross-schema connections
const MOCK_RELATIONSHIPS_DATA = [
  // User Management internal relationships
  {
    constraint_name: "user_sessions_user_id_fkey",
    referencing_table_name: "user_sessions",
    referencing_table_schema: "user_management", 
    referencing_column_name: "user_id",
    referenced_table_name: "users",
    referenced_table_schema: "user_management",
    referenced_column_name: "user_id",
    relationship_type: "ONE_TO_MANY"
  },
  
  // Ecommerce internal relationships
  {
    constraint_name: "products_category_id_fkey",
    referencing_table_name: "products",
    referencing_table_schema: "ecommerce",
    referencing_column_name: "category_id", 
    referenced_table_name: "categories",
    referenced_table_schema: "ecommerce",
    referenced_column_name: "category_id",
    relationship_type: "ONE_TO_MANY"
  },
  {
    constraint_name: "categories_parent_category_id_fkey",
    referencing_table_name: "categories",
    referencing_table_schema: "ecommerce",
    referencing_column_name: "parent_category_id",
    referenced_table_name: "categories", 
    referenced_table_schema: "ecommerce",
    referenced_column_name: "category_id",
    relationship_type: "ONE_TO_MANY"
  },
  {
    constraint_name: "order_items_order_id_fkey",
    referencing_table_name: "order_items",
    referencing_table_schema: "ecommerce",
    referencing_column_name: "order_id",
    referenced_table_name: "orders",
    referenced_table_schema: "ecommerce", 
    referenced_column_name: "order_id",
    relationship_type: "ONE_TO_MANY"
  },
  {
    constraint_name: "order_items_product_id_fkey",
    referencing_table_name: "order_items",
    referencing_table_schema: "ecommerce",
    referencing_column_name: "product_id",
    referenced_table_name: "products",
    referenced_table_schema: "ecommerce",
    referenced_column_name: "product_id",
    relationship_type: "ONE_TO_MANY"
  },
  
  // Cross-schema relationships (ecommerce -> user_management)  
  {
    constraint_name: "products_created_by_fkey",
    referencing_table_name: "products",
    referencing_table_schema: "ecommerce",
    referencing_column_name: "created_by",
    referenced_table_name: "users",
    referenced_table_schema: "user_management",
    referenced_column_name: "user_id", 
    relationship_type: "ONE_TO_MANY"
  },
  {
    constraint_name: "orders_customer_id_fkey",
    referencing_table_name: "orders",
    referencing_table_schema: "ecommerce",
    referencing_column_name: "customer_id",
    referenced_table_name: "users",
    referenced_table_schema: "user_management",
    referenced_column_name: "user_id",
    relationship_type: "ONE_TO_MANY" 
  },
  
  // Cross-schema relationships (analytics -> user_management and ecommerce)
  {
    constraint_name: "user_activity_summary_user_id_fkey",
    referencing_table_name: "user_activity_summary", 
    referencing_table_schema: "analytics",
    referencing_column_name: "user_id",
    referenced_table_name: "users",
    referenced_table_schema: "user_management",
    referenced_column_name: "user_id",
    relationship_type: "ONE_TO_MANY"
  },
  {
    constraint_name: "product_performance_product_id_fkey",
    referencing_table_name: "product_performance",
    referencing_table_schema: "analytics",
    referencing_column_name: "product_id",
    referenced_table_name: "products", 
    referenced_table_schema: "ecommerce",
    referenced_column_name: "product_id",
    relationship_type: "ONE_TO_MANY"
  },
  
  // Cross-schema relationships (system_logs -> user_management)
  {
    constraint_name: "application_logs_user_id_fkey",
    referencing_table_name: "application_logs",
    referencing_table_schema: "system_logs",
    referencing_column_name: "user_id",
    referenced_table_name: "users",
    referenced_table_schema: "user_management", 
    referenced_column_name: "user_id",
    relationship_type: "ONE_TO_MANY"
  },
  {
    constraint_name: "error_logs_user_id_fkey", 
    referencing_table_name: "error_logs",
    referencing_table_schema: "system_logs",
    referencing_column_name: "user_id",
    referenced_table_name: "users",
    referenced_table_schema: "user_management",
    referenced_column_name: "user_id",
    relationship_type: "ONE_TO_MANY"
  }
];

// Mock recommendations data
const MOCK_RECOMMENDATIONS_DATA = [
  {
    table_name: "users",
    table_schema: "user_management",
    rule: "MissingIndexRule", 
    type: "info",
    message: "Consider adding an index on email column for faster lookups",
    details: "The email column is frequently used in WHERE clauses but lacks an index.",
    suggestion: "CREATE INDEX idx_users_email ON user_management.users(email);"
  },
  {
    table_name: "products",
    table_schema: "ecommerce",
    rule: "MissingIndexRule",
    type: "warning", 
    message: "Consider adding an index on category_id column",
    details: "Foreign key columns should typically have indexes for optimal join performance.",
    suggestion: "CREATE INDEX idx_products_category ON ecommerce.products(category_id);"
  },
  {
    table_name: "orders",
    table_schema: "ecommerce",
    rule: "MissingIndexRule",
    type: "warning",
    message: "Consider adding an index on customer_id column",
    details: "Customer lookups are common and would benefit from an index.", 
    suggestion: "CREATE INDEX idx_orders_customer ON ecommerce.orders(customer_id);"
  },
  {
    table_name: "application_logs",
    table_schema: "system_logs",
    rule: "PerformanceRule",
    type: "info",
    message: "Consider partitioning this table by date for better performance",
    details: "Large log tables benefit from time-based partitioning.",
    suggestion: "Implement monthly partitioning on the created_at column."
  },
  {
    table_name: "error_logs", 
    table_schema: "system_logs",
    rule: "DataRetentionRule",
    type: "info",
    message: "Consider implementing a data retention policy",
    details: "Log tables should have automated cleanup to prevent unlimited growth.",
    suggestion: "DELETE FROM system_logs.error_logs WHERE created_at < NOW() - INTERVAL '90 days';"
  },
  {
    table_name: "user_activity_summary",
    table_schema: "analytics", 
    rule: "MissingIndexRule",
    type: "info",
    message: "Consider adding a composite index on user_id and date",
    details: "Analytics queries often filter by both user and date range.",
    suggestion: "CREATE INDEX idx_user_activity_user_date ON analytics.user_activity_summary(user_id, date);"
  }
];

/**
 * Generic API error handler - kept for compatibility
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
 * Fetch database schema information - DEMO VERSION
 */
export async function fetchSchema() {
  // Simulate network delay for realism
  await new Promise(resolve => setTimeout(resolve, 300));
  return MOCK_SCHEMA_DATA;
}

/**
 * Fetch table relationships - DEMO VERSION  
 */
export async function fetchRelationships() {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200));
  return MOCK_RELATIONSHIPS_DATA;
}

/**
 * Fetch recommendations with optional filtering - DEMO VERSION
 */
export async function fetchRecommendations({ table_name, table_schema } = {}) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 250));
  
  let recommendations = MOCK_RECOMMENDATIONS_DATA;
  
  // Filter by table_name if provided
  if (table_name) {
    recommendations = recommendations.filter(r => r.table_name === table_name);
  }
  
  // Filter by table_schema if provided  
  if (table_schema && table_schema !== "public") {
    recommendations = recommendations.filter(r => r.table_schema === table_schema);
  }
  
  return recommendations;
}

/**
 * Load all schema data (schema + relationships + recommendations) in parallel - DEMO VERSION
 */
export async function fetchAllSchemaData() {
  try {
    const [schema, relationships, recommendations] = await Promise.allSettled([
      fetchSchema(),
      fetchRelationships(),
      fetchRecommendations()
    ]);

    return {
      schema: schema.status === 'fulfilled' ? schema.value : null,
      relationships: relationships.status === 'fulfilled' ? relationships.value : [],
      recommendations: recommendations.status === 'fulfilled' ? recommendations.value : [],
      errors: []
    };
  } catch (error) {
    throw new ApiError(`Failed to load schema data: ${error.message}`, 0, '/all-schema-data');
  }
}