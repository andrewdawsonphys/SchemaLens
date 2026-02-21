import os
from dataclasses import asdict
from typing import Any

import psycopg

from psycopg.rows import dict_row
from .models import DbSchemaColumn, DbSchemaTable, DbConstraint


def get_db_connection():
    """
    Build the DSN (Data Source Name) for connecting to the PostgreSQL database using environment variables.
    """
    dsn = (
        f"postgresql://{os.getenv('POSTGRES_USER', 'postgres')}"
        f":{os.getenv('POSTGRES_PASSWORD', 'postgres')}"
        f"@{os.getenv('POSTGRES_HOST', 'postgres')}"
        f":{os.getenv('POSTGRES_PORT', '5432')}"
        f"/{os.getenv('POSTGRES_DB', 'schemalens')}"
    )
    return psycopg.connect(conninfo=dsn)

def get_db_constraints() -> list[dict[str, Any]]:
    """
    Query the data to retrieve the foreign key constraints information
    """
    stmt = """
        SELECT
            kcu.constraint_name AS name,
            tc.table_name AS target_table,
            tc.table_schema AS target_schema,
            kcu.column_name AS target_column,
            ccu.table_name AS source_table,
            ccu.column_name AS source_column,
            ccu.table_schema AS source_schema
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
        ON tc.constraint_name = ccu.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY';
    """

    with get_db_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cur:
            cur.execute(stmt)
            rows = cur.fetchall()

    return [asdict(DbConstraint(**row)) for row in rows]


def get_db_schema() -> list[dict[str, Any]]:
    """
    Query the database to retrieve the schema information, including tables,
    columns, data types, and constraints.
    """
    # we need to query the information_schema to get list of tables and columns
    stmt = """
        SELECT  t.table_name,
                t.table_schema,
                c.column_name,
                CASE 
                    WHEN c.data_type IN ('character varying', 'varchar', 'character', 'char')
                        THEN CONCAT(c.data_type, '(', c.character_maximum_length, ')')
                    WHEN c.numeric_precision IS NOT NULL
                        THEN CONCAT(c.data_type, '(', c.numeric_precision, ')')
                    ELSE c.data_type
                END AS formatted_type,
                c.is_nullable
        FROM information_schema."tables" t
        LEFT JOIN information_schema."columns" c
        ON c."table_name" = t."table_name"
        AND c."table_schema" = t."table_schema"
        WHERE t.table_schema='public'
        ORDER BY t."table_name", c.ordinal_position;
"""
    with get_db_connection() as connection:
        with connection.cursor(row_factory=dict_row) as cur:
            cur.execute(stmt)
            rows = cur.fetchall()

    tables: dict[str, DbSchemaTable] = {}

    for row in rows:
        table_name = row["table_name"]
        table_schema = row["table_schema"]
        if table_name not in tables:
            tables[table_name] = DbSchemaTable(table_name=table_name, table_schema=table_schema, columns=[])

        if row["column_name"] is not None:
            tables[table_name].columns.append(
                DbSchemaColumn(
                    column_name=row["column_name"],
                    formatted_type=row["formatted_type"],
                    is_nullable=row["is_nullable"],
                )
            )

    return [asdict(table) for table in tables.values()]
