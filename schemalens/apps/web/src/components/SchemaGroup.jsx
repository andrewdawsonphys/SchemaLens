import React from 'react';

/**
 * Schema Group Component - Background zone with top-right label for schema grouping
 */
const SchemaGroup = ({ data }) => {
  const { label } = data;

  return (
    <div className="schema-group-container">
      <div className="schema-group-label">
        {label}
      </div>
    </div>
  );
};

export default SchemaGroup;