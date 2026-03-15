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
    constraint_name: str
    referencing_table_name: str
    referencing_column_name: str
    referencing_table_schema: str
    referenced_table_name: str
    referenced_column_name: str
    referenced_table_schema: str
    relationship_type: str
