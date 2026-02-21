from dataclasses import dataclass
from typing import Optional

@dataclass
class DbSchemaColumn:
    column_name: Optional[str]
    formatted_type: Optional[str]
    is_nullable: Optional[str]

@dataclass
class DbSchemaTable:
    table_name: str
    table_schema: str
    columns: list[DbSchemaColumn]

@dataclass
class DbConstraint:
    name: str
    target_table: str
    target_column: str
    target_schema: str
    source_table: str
    source_column: str
    source_schema: str
