-- SQL Script for Multi-Schema Testing
-- This script creates multiple schemas with interconnected tables to test SchemaLens grouping features

-- Drop existing schemas if they exist (for clean testing)
DROP SCHEMA IF EXISTS user_management CASCADE;
DROP SCHEMA IF EXISTS ecommerce CASCADE;
DROP SCHEMA IF EXISTS analytics CASCADE;
DROP SCHEMA IF EXISTS system_logs CASCADE;

-- Create schemas
CREATE SCHEMA user_management;
CREATE SCHEMA ecommerce;
CREATE SCHEMA analytics;
CREATE SCHEMA system_logs;

-- USER MANAGEMENT SCHEMA
-- Users and authentication related tables
CREATE TABLE user_management.users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE user_management.user_roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_management.user_role_assignments (
    assignment_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES user_management.users(user_id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES user_management.user_roles(role_id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by INTEGER REFERENCES user_management.users(user_id),
    UNIQUE(user_id, role_id)
);

CREATE TABLE user_management.user_sessions (
    session_id VARCHAR(255) PRIMARY KEY,
    user_id INTEGER REFERENCES user_management.users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    ip_address INET,
    user_agent TEXT
);

-- ECOMMERCE SCHEMA
-- Products, orders, and inventory related tables
CREATE TABLE ecommerce.categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    parent_category_id INTEGER REFERENCES ecommerce.categories(category_id),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ecommerce.products (
    product_id SERIAL PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    category_id INTEGER REFERENCES ecommerce.categories(category_id),
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    created_by INTEGER REFERENCES user_management.users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ecommerce.orders (
    order_id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES user_management.users(user_id),
    order_status VARCHAR(20) DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    shipping_address TEXT,
    billing_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ecommerce.order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES ecommerce.orders(order_id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES ecommerce.products(product_id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

CREATE TABLE ecommerce.inventory_movements (
    movement_id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES ecommerce.products(product_id),
    movement_type VARCHAR(20) NOT NULL, -- 'in', 'out', 'adjustment'
    quantity INTEGER NOT NULL,
    reference_id INTEGER, -- can reference order_id or other sources
    notes TEXT,
    created_by INTEGER REFERENCES user_management.users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ANALYTICS SCHEMA
-- Reporting and analytics tables
CREATE TABLE analytics.user_activity_summary (
    summary_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES user_management.users(user_id),
    date DATE NOT NULL,
    login_count INTEGER DEFAULT 0,
    pages_viewed INTEGER DEFAULT 0,
    time_spent_minutes INTEGER DEFAULT 0,
    last_activity TIMESTAMP,
    UNIQUE(user_id, date)
);

CREATE TABLE analytics.product_performance (
    performance_id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES ecommerce.products(product_id),
    date DATE NOT NULL,
    views INTEGER DEFAULT 0,
    orders INTEGER DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0,
    conversion_rate DECIMAL(5,4),
    UNIQUE(product_id, date)
);

CREATE TABLE analytics.sales_reports (
    report_id SERIAL PRIMARY KEY,
    report_date DATE NOT NULL,
    total_orders INTEGER DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    new_customers INTEGER DEFAULT 0,
    returning_customers INTEGER DEFAULT 0,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    generated_by INTEGER REFERENCES user_management.users(user_id)
);

-- SYSTEM LOGS SCHEMA
-- Application logging and monitoring tables
CREATE TABLE system_logs.application_logs (
    log_id BIGSERIAL PRIMARY KEY,
    log_level VARCHAR(20) NOT NULL, -- 'DEBUG', 'INFO', 'WARN', 'ERROR'
    message TEXT NOT NULL,
    user_id INTEGER REFERENCES user_management.users(user_id),
    module VARCHAR(100),
    function_name VARCHAR(100),
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE system_logs.error_logs (
    error_id BIGSERIAL PRIMARY KEY,
    error_code VARCHAR(50),
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    user_id INTEGER REFERENCES user_management.users(user_id),
    request_url VARCHAR(500),
    http_method VARCHAR(10),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE system_logs.audit_trail (
    audit_id BIGSERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    record_id INTEGER NOT NULL,
    action VARCHAR(20) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    old_values JSONB,
    new_values JSONB,
    changed_by INTEGER REFERENCES user_management.users(user_id),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data to make the schemas more interesting

-- Insert sample user roles
INSERT INTO user_management.user_roles (role_name, description) VALUES
    ('admin', 'System administrator with full access'),
    ('manager', 'Store manager with operational access'),
    ('customer', 'Regular customer account'),
    ('analyst', 'Data analyst with read access to analytics');

-- Insert sample users
INSERT INTO user_management.users (email, password_hash, first_name, last_name) VALUES
    ('admin@schemalens.com', 'hashed_password_1', 'Admin', 'User'),
    ('manager@schemalens.com', 'hashed_password_2', 'Store', 'Manager'),
    ('analyst@schemalens.com', 'hashed_password_3', 'Data', 'Analyst'),
    ('customer1@email.com', 'hashed_password_4', 'John', 'Doe'),
    ('customer2@email.com', 'hashed_password_5', 'Jane', 'Smith');

-- Insert sample categories
INSERT INTO ecommerce.categories (category_name, description) VALUES
    ('Electronics', 'Electronic devices and accessories'),
    ('Clothing', 'Apparel and fashion items'),
    ('Smartphones', 'Mobile phones and accessories'),
    ('Laptops', 'Portable computers');

-- Update categories with parent relationships
UPDATE ecommerce.categories SET parent_category_id = 1 WHERE category_name IN ('Smartphones', 'Laptops');

-- Insert sample products
INSERT INTO ecommerce.products (product_name, category_id, description, price, stock_quantity, created_by) VALUES
    ('iPhone 15', 3, 'Latest Apple smartphone', 999.99, 50, 1),
    ('MacBook Pro', 4, 'Professional laptop for developers', 2499.99, 20, 1),
    ('Cotton T-Shirt', 2, 'Comfortable cotton t-shirt', 29.99, 100, 2),
    ('Wireless Headphones', 1, 'Bluetooth wireless headphones', 199.99, 75, 2);

-- Create some indexes for better performance (and to test index recommendations)
CREATE INDEX idx_users_email ON user_management.users(email);
CREATE INDEX idx_products_category ON ecommerce.products(category_id);
CREATE INDEX idx_orders_customer ON ecommerce.orders(customer_id);
CREATE INDEX idx_order_items_order ON ecommerce.order_items(order_id);
CREATE INDEX idx_logs_created_at ON system_logs.application_logs(created_at);
CREATE INDEX idx_audit_table_record ON system_logs.audit_trail(table_name, record_id);

-- Add some comments to tables for documentation
COMMENT ON SCHEMA user_management IS 'User authentication and authorization system';
COMMENT ON SCHEMA ecommerce IS 'E-commerce product catalog and order management';
COMMENT ON SCHEMA analytics IS 'Business intelligence and reporting data';
COMMENT ON SCHEMA system_logs IS 'Application logging and audit trail system';

COMMENT ON TABLE user_management.users IS 'Main user account information';
COMMENT ON TABLE ecommerce.products IS 'Product catalog with pricing and inventory';
COMMENT ON TABLE analytics.sales_reports IS 'Daily sales performance summaries';
COMMENT ON TABLE system_logs.audit_trail IS 'Complete audit log of all database changes';