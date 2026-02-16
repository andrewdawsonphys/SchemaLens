import os
from dataclasses import asdict
from typing import Any

import psycopg

from psycopg.rows import dict_row
from .models import DbSchemaColumn, DbSchemaTable


def get_db_connection():
    """Build the DSN (Data Source Name) for connecting to the PostgreSQL database using environment variables."""
    dsn = (
        f"postgresql://{os.getenv('POSTGRES_USER', 'postgres')}"
        f":{os.getenv('POSTGRES_PASSWORD', 'postgres')}"
        f"@{os.getenv('POSTGRES_HOST', 'postgres')}"
        f":{os.getenv('POSTGRES_PORT', '5432')}"
        f"/{os.getenv('POSTGRES_DB', 'schemalens')}"
    )
    return psycopg.connect(conninfo=dsn)


def get_db_schema() -> list[dict[str, Any]]:
    """Query the database to retrieve the schema information, including tables, columns, data types, and constraints."""
    # we need to query the information_schema to get list of tables and columns
    stmt = """
        SELECT  t."table_name",
                c."column_name",
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
        if table_name not in tables:
            tables[table_name] = DbSchemaTable(table_name=table_name, columns=[])

        if row["column_name"] is not None:
            tables[table_name].columns.append(
                DbSchemaColumn(
                    column_name=row["column_name"],
                    formatted_type=row["formatted_type"],
                    is_nullable=row["is_nullable"],
                )
            )

    return [asdict(table) for table in tables.values()]
