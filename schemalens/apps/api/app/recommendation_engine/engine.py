import re
from collections import Counter
from dataclasses import dataclass
from abc import ABC, abstractmethod
from enum import Enum
from ..crud import get_db_schema
from ..models import DbSchemaTable

class RecommendationType(str, Enum):
    ERROR = "error"      # Critical issues (missing PKs, etc.)
    WARNING = "warning"  # Best practice violations
    INFO = "info"        # Suggestions for improvement

@dataclass
class Recommendation:
    """Base data class for a recommendation"""
    name: str
    description: str
    element_type: str
    element_name: str
    table_name: str
    type: RecommendationType = RecommendationType.WARNING

class RecommendationRule(ABC):

    NAME: str
    DESCRIPTION: str

    @abstractmethod
    def check(self, data) -> list[Recommendation]:
        """Apply the rule to the given data and return a list of recommendations"""
        raise NotImplementedError

class InconsistentNamingConvention(RecommendationRule):

    NAME = "Inconsistent Naming Convention"

    def check(self, data: list[DbSchemaTable]) -> list[Recommendation]:

        convention_counter = Counter({"camel_case": 0, "snake_case": 0, "pascal_case": 0})

        convention_patterns = {
            "camel_case": re.compile(r'^[a-z]+(?:[A-Z][a-z0-9]*)+$'),
            "snake_case": re.compile(r'^[a-z]+(?:_[a-z0-9]+)*$'),
            "pascal_case": re.compile(r'^[A-Z][a-z0-9]*(?:[A-Z][a-z0-9]*)*$')
        }

        # (1) Always use the full schema to determine the dominant naming convention
        for table_schema in get_db_schema():
            table_name = table_schema.table_name
            column_names = [column.column_name for column in table_schema.columns]

            for name in [table_name, *column_names]:
                for convention_key, pattern in convention_patterns.items():
                    if re.match(pattern, name):
                        convention_counter[convention_key] += 1
                        break

        most_common_convention = convention_counter.most_common(1)[0][0]

        # (2) Check only the provided data (may be filtered to one table) for violations
        target_pattern = convention_patterns[most_common_convention]
        recommendations = []

        for table_schema in data:
            table_name = table_schema.table_name
            # check table name
            if not re.match(target_pattern, table_name):

                recommendations.append(
                    Recommendation(
                        name="Inconsistent Naming Convention",
                        description=f"Table name doesn't follow the {' '.join(most_common_convention.split('_'))} convention",
                        element_type="table",
                        element_name=None,
                        table_name=table_name,
                        type=RecommendationType.WARNING
                    )
                )

            # check column names
            for column in table_schema.columns:
                column_name = column.column_name
                if not re.match(target_pattern, column_name):
                    recommendations.append(
                        Recommendation(
                            name="Inconsistent Naming Convention",
                            description=f"Column name doesn't follow the {' '.join(most_common_convention.split('_'))} convention",
                            element_type="column",
                            element_name=column_name,
                            table_name=table_name,
                            type=RecommendationType.WARNING
                        )
                    )

        return recommendations

class MissingPrimaryKey(RecommendationRule):

    NAME = "Missing Primary Key"

    def check(self, data: list[DbSchemaTable]) -> list[Recommendation]:
        recommendations: list[Recommendation] = []

        for table_schema in data:
            if not any(column.is_primary_key for column in table_schema.columns):
                recommendations.append(
                    Recommendation(
                        name=self.NAME,
                        description="Table is missing a primary key",
                        element_type="table",
                        element_name=None,
                        table_name=table_schema.table_name,
                        type=RecommendationType.ERROR
                    )
                )

        return recommendations

class RecommendationEngine:

    def __init__(self):
        self.default_rules = [MissingPrimaryKey, InconsistentNamingConvention]

    def get_recommendations(self, table_name: str = None, table_schema: str = "public") -> list[Recommendation]:
        """Generate a recommendation based on the database schema and constraints information"""
        recommendations: list[Recommendation] = []

        schema = get_db_schema(table_name, table_schema)

        for rule in self.default_rules:
            recommendations.extend(rule().check(schema))

        return recommendations
