import { BaseEdge, getSmoothStepPath } from "@xyflow/react";

const getColor = (selected, defaultColor = "#B1B1B7") => (selected ? "#FFCC00" : defaultColor);

function CrowFoot({ selected, length = 16, strokeWidth = 1.5 }) {
  const color = getColor(selected);

  return (
    <g stroke={color} strokeWidth={strokeWidth}>
      <line x1="0" y1={-length / 2} x2={length} y2="0" />
      <line x1="0" y1="0" x2={length} y2="0" />
      <line x1="0" y1={length / 2} x2={length} y2="0" />
    </g>
  );
}

function ZeroOrOne({ selected, radius = 5, lineLength = 12, strokeWidth = 1.5 }) {
  const color = getColor(selected);

  return (
    <g stroke={color} strokeWidth={strokeWidth} fill="white">
      <line x1="0" y1="0" x2={lineLength} y2="0" />
      <circle cx={lineLength + radius} cy="0" r={radius} />
    </g>
  );
}

export default function ErdEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style = {},
  selected,
}) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 0,
  });

  const color = getColor(selected, style.stroke);

  // Map relationship type to marker URLs
  const markerMap = {
    ONE_TO_MANY: ["many", "zero-or-one"],
    ONE_TO_ONE: ["zero-or-one", "zero-or-one"],
    MANY_TO_MANY: ["many", "many"],
  };

  const [startMarkerId, endMarkerId] = markerMap[data.relationshipType] || [null, null];

  return (
    <>
      <defs>
        <marker
          id="many"
          markerWidth="20"
          markerHeight="20"
          viewBox="0 -8 16 16"
          orient="auto"
          refX="0"
          refY="0"
        >
          <CrowFoot />
        </marker>

        <marker
          id="many-selected"
          markerWidth="20"
          markerHeight="20"
          viewBox="0 -8 16 16"
          orient="auto"
          refX="0"
          refY="0"
        >
          <CrowFoot selected />
        </marker>

        </defs>

      <BaseEdge
        id={id}
        path={edgePath}
        markerStart={selected ? `url(#${startMarkerId}-selected)` : `url(#${startMarkerId})`}
        markerEnd={selected ? `url(#${endMarkerId}-selected)` : `url(#${endMarkerId})`}
        style={{ stroke: color, ...style }}
        type="step"
      />
    </>
  );
}