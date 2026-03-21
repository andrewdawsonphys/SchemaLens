export default function RecommendationsSidebar({
  isOpen,
  loading,
  error,
  items,
  tableSchema,
  tableName,
  selectedType,
  onClose,
}) {
  if (!isOpen) {
    return null;
  }

  const title = selectedType
    ? `${selectedType[0].toUpperCase()}${selectedType.slice(1)} recommendations`
    : "Recommendations";

  return (
    <aside className="recommendations-sidebar" aria-label="Recommendations panel">
      <div className="recommendations-sidebar__header">
        <div>
          <div className="recommendations-sidebar__title">{title}</div>
          <div className="recommendations-sidebar__subtitle">
            {tableSchema}.{tableName}
          </div>
        </div>
        <button
          type="button"
          className="recommendations-sidebar__close"
          onClick={onClose}
          aria-label="Close recommendations panel"
        >
          x
        </button>
      </div>

      <div className="recommendations-sidebar__content">
        {loading && <div className="recommendations-sidebar__state">Loading recommendations...</div>}

        {!loading && error && (
          <div className="recommendations-sidebar__state recommendations-sidebar__state--error">
            {error}
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="recommendations-sidebar__state">No recommendations found.</div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="recommendation-tiles">
            {items.map((item, index) => (
              <article key={`${item.name}-${item.element_name || "table"}-${index}`} className="recommendation-tile">
                <div className="recommendation-tile__meta">
                  <span className={`recommendation-tile__badge recommendation-tile__badge--${item.type || "warning"}`}>
                    {(item.type || "warning").toUpperCase()}
                  </span>
                  <span className="recommendation-tile__rule">{item.name}</span>
                </div>
                <div className="recommendation-tile__info">
                  <div>
                    <strong>Table:</strong> {tableSchema}.{item.table_name || tableName}
                  </div>
                  <div>
                    <strong>Column:</strong> {item.element_name || "(table-level)"}
                  </div>
                </div>
                <p className="recommendation-tile__description">{item.description}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
