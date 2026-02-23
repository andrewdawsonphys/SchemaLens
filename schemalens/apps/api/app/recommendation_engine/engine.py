import re
from collections import Counter
from dataclasses import dataclass
from abc import ABC, abstractmethod
from ..crud import get_db_schema

@dataclass
class Recommendation:
    """Base data class for a recommendation"""
    name: str
    description: str
    element_type: str
    element_name: str
    table_name: str

class RecommendationRule(ABC):

    NAME: str
    DESCRIPTION: str

    @abstractmethod
    def check(self, data) -> list[Recommendation]:
        """Apply the rule to the given data and return a list of recommendations"""
        raise NotImplementedError


class InconsistentNamingConvention(RecommendationRule):

    NAME = "Inconsistent Naming Convention"

    def check(self, data) -> list[Recommendation]:

        convention_counter = Counter({"camel_case": 0, "snake_case": 0, "pascal_case": 0})

        convention_patterns = {
            "lowercase_single_word": re.compile(r'^[a-z]+$'),
            "camel_case": re.compile(r'^[a-z]+(?:[A-Z][a-z0-9]*)*$'),
            "snake_case": re.compile(r'^[a-z]+(?:_[a-z0-9]+)*$'),
            "pascal_case": re.compile(r'^[A-Z][a-z0-9]+(?:[A-Z][a-z0-9]+)*$')
        }

        # (1) Find which naming convention is the most common in the database schema
        for table_schema in data:
            table_name = table_schema["table_name"]
            column_names = [name["column_name"] for name in table_schema["columns"]]

            for name in [table_name, *column_names]:
                for convention_key, pattern in convention_patterns.items():
                    if re.match(pattern, name):
                        convention_counter[convention_key] += 1

        most_common_convention = convention_counter.most_common(1)[0][0]
        # (2) Check for any table names / column names that do not follow the
        # most common naming convention and generate a recommendation for each of them
        target_pattern = convention_patterns[most_common_convention]
        recommendations = []

        for table_schema in data:

            # check table name
            if re.match(target_pattern, table_schema["table_name"]):
                recommendations.append(
                    Recommendation(
                        name="InconsistentNamingConvention",
                        description=f"Table name doesn't follow the {" ".join(most_common_convention.split("_"))} convention",
                        element_type="table",
                        element_name=None,
                        table_name=table_name
                    )
                )

        return recommendations



class RecommendationEngine:

    def __init__(self):
        self.default_rules = [InconsistentNamingConvention]
        self.rules = [InconsistentNamingConvention]

    def get_recommendations(self) -> list[Recommendation]:
        """Generate a recommendation based on the database schema and constraints information"""
        recommendations: list[Recommendation] = []
        schema = get_db_schema()

        for rule in self.rules:
            recommendations = rule().check(schema)
            if recommendation := rule().check(schema):
                recommendations += recommendation

        return recommendations
