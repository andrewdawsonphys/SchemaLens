from dataclasses import dataclass

@dataclass
class DbSchemaColumn:
    column_name: str | None
    formatted_type: str | None
    is_nullable: str | None


@dataclass
class DbSchemaTable:
    table_name: str
    columns: list[DbSchemaColumn]
