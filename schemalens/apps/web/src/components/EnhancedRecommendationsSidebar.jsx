import { useState, useMemo, useRef, useEffect } from 'react';
import { LoadingSpinner } from './ui/LoadingSpinner.jsx';
import { InlineError } from './ui/ErrorMessage.jsx';
import { useSidebarResize } from '../hooks/useSidebarResize.js';
import { 
  buildRecommendationCounts, 
  filterRecommendationsByType,
  sortRecommendationsByPriority 
} from '../utils/recommendationHelpers.js';

// Recommendation type configurations
const RECOMMENDATION_TYPES = {
  error: {
    label: 'Errors', 
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-700'
  },
  warning: { 
    label: 'Warnings', 
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-200 dark:border-yellow-700'
  },
  info: { 
    label: 'Info', 
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-700'
  }
};

const SORT_OPTIONS = [
  { value: 'priority', label: 'Priority' },
  { value: 'type', label: 'Type' },
  { value: 'name', label: 'Rule Name' },
  { value: 'table', label: 'Table' },
];

/**
 * Statistics tiles component showing key metrics
 */
function StatisticsTiles({ items, viewMode }) {
  const counts = buildRecommendationCounts(items);
  const totalIssues = items.length;
  
  // Calculate schema health score (0-100)
  const calculateSchemaScore = () => {
    if (totalIssues === 0) return 100;
    const penalty = (counts.error * 10) + (counts.warning * 5) + (counts.info * 2);
    return Math.max(0, 100-penalty);
  };
  
  const schemaScore = calculateSchemaScore();
  
  // Determine score color based on value
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };
  
  const getScoreStatus = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Work';
  };

  return (
    <div className="statistics-tiles">
      <div className="statistics-tiles__grid">
        
        {/* Schema Health Score */}
        <div className="statistics-tile statistics-tile--score">
          <div className="statistics-tile__header">
            <div className="statistics-tile__icon">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" />
              </svg>
            </div>
            <span className="statistics-tile__label">Schema Score</span>
          </div>
          <div className="statistics-tile__content">
            <div className={`statistics-tile__value ${getScoreColor(schemaScore)}`}>
              {schemaScore}/100
            </div>
            <div className="statistics-tile__subtitle">
              {getScoreStatus(schemaScore)}
            </div>
          </div>
        </div>

        {/* Total Issues */}
        <div className="statistics-tile statistics-tile--total">
          <div className="statistics-tile__header">
            <div className="statistics-tile__icon">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 11H15V13H9V11M9 7H15V9H9V7M4 5V19L7 16H18V5H4Z" />
              </svg>
            </div>
            <span className="statistics-tile__label">Total Issues</span>
          </div>
          <div className="statistics-tile__content">
            <div className="statistics-tile__value text-gray-700 dark:text-gray-200">
              {totalIssues}
            </div>
            <div className="statistics-tile__subtitle">
              {viewMode === 'all' ? 'All Tables' : 'This Table'}
            </div>
          </div>
        </div>

        {/* Errors */}
        {counts.error > 0 && (
          <div className="statistics-tile statistics-tile--error">
            <div className="statistics-tile__header">
              <div className="statistics-tile__icon">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <span className="statistics-tile__label">Errors</span>
            </div>
            <div className="statistics-tile__content">
              <div className="statistics-tile__value text-red-600 dark:text-red-400">
                {counts.error}
              </div>
              <div className="statistics-tile__subtitle">
                High Priority
              </div>
            </div>
          </div>
        )}

        {/* Warnings */}
        {counts.warning > 0 && (
          <div className="statistics-tile statistics-tile--warning">
            <div className="statistics-tile__header">
              <div className="statistics-tile__icon">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                </svg>
              </div>
              <span className="statistics-tile__label">Warnings</span>
            </div>
            <div className="statistics-tile__content">
              <div className="statistics-tile__value text-yellow-600 dark:text-yellow-400">
                {counts.warning}
              </div>
              <div className="statistics-tile__subtitle">
                Medium Priority
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        {counts.info > 0 && (
          <div className="statistics-tile statistics-tile--info">
            <div className="statistics-tile__header">
              <div className="statistics-tile__icon">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                </svg>
              </div>
              <span className="statistics-tile__label">Info</span>
            </div>
            <div className="statistics-tile__content">
              <div className="statistics-tile__value text-blue-600 dark:text-blue-400">
                {counts.info}
              </div>
              <div className="statistics-tile__subtitle">
                Low Priority
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

/**
 * Statistics header component
 */
function RecommendationsStats({ items, selectedFilter, onFilterChange }) {
  const counts = buildRecommendationCounts(items);
  const total = items.length;

  return (
    <div className="recommendations-stats">

      
      <div className="recommendations-stats__filters">
        <button
          onClick={() => onFilterChange('')}
          className={`recommendations-stats__filter ${selectedFilter === '' ? 'active' : ''}`}
        >
          All ({total})
        </button>
        
        {Object.entries(counts).filter(([, count]) => count > 0).map(([type, count]) => {
          const config = RECOMMENDATION_TYPES[type];
          return (
            <button
              key={type}
              onClick={() => onFilterChange(type)}
              className={`recommendations-stats__filter recommendations-stats__filter--${type} ${
                selectedFilter === type ? 'active' : ''
              }`}
            >
              {config.label} ({count})
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Search and sort controls with table/schema filtering
 */
function RecommendationsControls({ 
  searchQuery, 
  onSearchChange, 
  sortBy, 
  onSortChange, 
  tableFilter, 
  onTableFilterChange, 
  schemaFilter, 
  onSchemaFilterChange,
  availableTables = [],
  availableSchemas = [],
  viewMode = 'table'
}) {
  return (
    <div className="recommendations-controls">
      <div className="recommendations-search">
        <div className="recommendations-search__wrapper">
          <svg 
            className="recommendations-search__icon" 
            width="16" height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder={viewMode === 'all' ? "Search all recommendations..." : "Search recommendations..."}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="recommendations-search__input"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="recommendations-search__clear"
              aria-label="Clear search"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
      </div>
      
      {/* Table and Schema filters - only show in 'all' mode */}
      {viewMode === 'all' && (
        <>
          <div className="recommendations-filter">
            <select
              value={schemaFilter}
              onChange={(e) => onSchemaFilterChange(e.target.value)}
              className="recommendations-filter__select"
            >
              <option value="">All Schemas</option>
              {availableSchemas.map(schema => (
                <option key={schema} value={schema}>
                  {schema}
                </option>
              ))}
            </select>
          </div>
          
          <div className="recommendations-filter">
            <select
              value={tableFilter}
              onChange={(e) => onTableFilterChange(e.target.value)}
              className="recommendations-filter__select"
            >
              <option value="">All Tables</option>
              {availableTables.map(table => (
                <option key={table} value={table}>
                  {table}
                </option>
              ))}
            </select>
          </div>
        </>
      )}
      
      <div className="recommendations-sort">
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="recommendations-sort__select"
        >
          {SORT_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              Sort by {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

/**
 * Enhanced recommendation card with expand/collapse and table info for all-recommendations view
 */
function RecommendationCard({ recommendation, index, isExpanded, onToggle, onDismiss, onViewTable, viewMode = 'table' }) {
  const config = RECOMMENDATION_TYPES[recommendation.type] || RECOMMENDATION_TYPES.warning;
  const cardRef = useRef(null);

  // Auto-focus when expanded for keyboard navigation
  useEffect(() => {
    if (isExpanded && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isExpanded]);

  return (
    <article
      ref={cardRef}
      className={`recommendation-card ${isExpanded ? 'expanded' : ''}`}
      data-recommendation-type={recommendation.type}
    >
      <div 
        className="recommendation-card__header"
        onClick={() => onToggle(index)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle(index);
          }
        }}
        aria-expanded={isExpanded}
        aria-controls={`recommendation-${index}-content`}
      >
        <div className="recommendation-card__meta">
          <span className={`recommendation-card__badge ${config.bgColor} ${config.color} ${config.borderColor}`}>
            {recommendation.type.toUpperCase()}
          </span>
          
          <div className="recommendation-card__context">
            <span className="recommendation-card__rule">{recommendation.name}</span>
            <span className="recommendation-card__table-context">
              {(recommendation.table_schema && recommendation.table_schema !== 'public') && (
                <>
                  {recommendation.table_schema}.
                </>
              )}
              {recommendation.table_name}
              {recommendation.element_name && (
                <span className="recommendation-card__column-context">
                  .{recommendation.element_name}
                </span>
              )}
            </span>
          </div>
        </div>
        
        <div className="recommendation-card__actions">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewTable?.(recommendation.table_schema || 'public', recommendation.table_name);
            }}
            className="recommendation-card__view-table"
            aria-label="View table in diagram"
            title="Navigate to this table in the ERD"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDismiss?.(recommendation, index);
            }}
            className="recommendation-card__dismiss"
            aria-label="Dismiss recommendation"
            title="Dismiss this recommendation"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          
          <button
            className="recommendation-card__toggle"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              className={`recommendation-card__toggle-icon ${isExpanded ? 'expanded' : ''}`}
            >
              <polyline points="6,9 12,15 18,9"></polyline>
            </svg>
          </button>
        </div>
      </div>

      <div 
        id={`recommendation-${index}-content`}
        className={`recommendation-card__content ${isExpanded ? 'expanded' : ''}`}
      >
        <div className="recommendation-card__details">
          <div className="recommendation-card__info">
            {/* Only show column info in table-specific view, since it's in header for all-view */}
            {viewMode === 'table' && (
              <div className="recommendation-card__info-item">
                <strong>Column:</strong> 
                <span>{recommendation.element_name || '(table-level)'}</span>
              </div>
            )}
            
            {/* Always show table info in expanded details for all-view */}
            {viewMode === 'all' && (
              <>
                <div className="recommendation-card__info-item">
                  <strong>Table:</strong> 
                  <span>{recommendation.table_schema || 'public'}.{recommendation.table_name}</span>
                </div>
                <div className="recommendation-card__info-item">
                  <strong>Column:</strong> 
                  <span>{recommendation.element_name || '(table-level)'}</span>
                </div>
              </>
            )}
          </div>
          
          <p className="recommendation-card__description">
            {recommendation.description}
          </p>

          {recommendation.suggestion && (
            <div className="recommendation-card__suggestion">
              <h4 className="recommendation-card__suggestion-title">💡 Suggestion:</h4>
              <p>{recommendation.suggestion}</p>
            </div>
          )}
          
          <div className="recommendation-card__footer">
            <button className="recommendation-card__learn-more">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

/**
 * Empty state component
 */
function EmptyState({ hasFilters, selectedFilter, searchQuery }) {
  if (hasFilters) {
    return (
      <div className="recommendations-empty">
        <div className="recommendations-empty__icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"/>
            <path d="m9 12 2 2 4-4"/>
          </svg>
        </div>
        <h3 className="recommendations-empty__title">No matches found</h3>
        <p className="recommendations-empty__message">
          {searchQuery 
            ? `No recommendations match "${searchQuery}"`
            : `No ${selectedFilter} recommendations found`
          }
        </p>
      </div>
    );
  }

  return (
    <div className="recommendations-empty">
      <div className="recommendations-empty__icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10"/>
          <path d="m9 12 2 2 4-4"/>
        </svg>
      </div>
      <h3 className="recommendations-empty__title">All good here!</h3>
      <p className="recommendations-empty__message">
        No recommendations found for this table. Everything looks optimized! ✨
      </p>
    </div>
  );
}

/**
 * Resize handle component for sidebar
 */
function ResizeHandle({ onMouseDown, isResizing }) {
  return (
    <div 
      className={`sidebar-resize-handle ${isResizing ? 'sidebar-resize-handle--active' : ''}`}
      onMouseDown={onMouseDown}
      role="separator"
      aria-label="Resize sidebar"
      title="Drag to resize sidebar"
    >
      <div className="sidebar-resize-handle__grip" />
    </div>
  );
}

/**
 * Main enhanced recommendations sidebar component
 */
export default function EnhancedRecommendationsSidebar({
  isOpen,
  loading,
  error,
  items = [],
  tableSchema,
  tableName,
  selectedType,
  viewMode = 'table',
  onClose,
  onViewTable,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState(selectedType || '');
  const [tableFilter, setTableFilter] = useState('');
  const [schemaFilter, setSchemaFilter] = useState('');
  const [sortBy, setSortBy] = useState('priority');
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [dismissedItems, setDismissedItems] = useState(new Set());
  
  // Resize functionality
  const { width, isResizing, handleMouseDown } = useSidebarResize();

  // Update filter when selectedType prop changes
  useEffect(() => {
    setSelectedFilter(selectedType || '');
  }, [selectedType]);

  // Extract available tables and schemas from items for filtering
  const { availableTables, availableSchemas } = useMemo(() => {
    if (viewMode !== 'all') {
      return { availableTables: [], availableSchemas: [] };
    }

    const tables = new Set();
    const schemas = new Set();
    
    items.forEach(item => {
      if (item.table_name) {
        tables.add(item.table_name);
      }
      if (item.table_schema) {
        schemas.add(item.table_schema);
      }
    });
    
    return {
      availableTables: Array.from(tables).sort(),
      availableSchemas: Array.from(schemas).sort()
    };
  }, [items, viewMode]);

  // Process recommendations
  const processedItems = useMemo(() => {
    let filtered = items.filter(item => !dismissedItems.has(item.name));
    
    // Apply search filter (enhanced for all-view)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        (item.element_name && item.element_name.toLowerCase().includes(query)) ||
        (viewMode === 'all' && (
          (item.table_name && item.table_name.toLowerCase().includes(query)) ||
          (item.table_schema && item.table_schema.toLowerCase().includes(query))
        ))
      );
    }

    // Apply table filter (all-view only)
    if (viewMode === 'all' && tableFilter) {
      filtered = filtered.filter(item => item.table_name === tableFilter);
    }

    // Apply schema filter (all-view only)
    if (viewMode === 'all' && schemaFilter) {
      filtered = filtered.filter(item => item.table_schema === schemaFilter);
    }

    // Apply type filter
    if (selectedFilter) {
      filtered = filterRecommendationsByType(filtered, selectedFilter);
    }

    // Apply sorting
    if (sortBy === 'priority') {
      filtered = sortRecommendationsByPriority(filtered);
    } else if (sortBy === 'type') {
      filtered = [...filtered].sort((a, b) => a.type.localeCompare(b.type));
    } else if (sortBy === 'name') {
      filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'table') {
      filtered = [...filtered].sort((a, b) => {
        const aTable = `${a.table_schema || 'public'}.${a.table_name}`;
        const bTable = `${b.table_schema || 'public'}.${b.table_name}`;
        return aTable.localeCompare(bTable);
      });
    }

    return filtered;
  }, [items, searchQuery, selectedFilter, tableFilter, schemaFilter, sortBy, dismissedItems, viewMode]);

  const handleCardToggle = (index) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedCards(newExpanded);
  };

  const handleDismiss = (recommendation, index) => {
    setDismissedItems(prev => new Set([...prev, recommendation.name]));
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  };

  const handleClearAll = () => {
    setSearchQuery('');
    setSelectedFilter('');
    setTableFilter('');
    setSchemaFilter('');
    setExpandedCards(new Set());
    setDismissedItems(new Set());
  };

  if (!isOpen) {
    return null;
  }


  const subtitle = viewMode === 'all' 
    ? 'Database-wide recommendations'
    : `${tableSchema}.${tableName}`;

  return (
    <aside 
      className="recommendations-sidebar enhanced" 
      style={{ width: `${width}px` }}
      aria-label="Recommendations panel"
    >
      <ResizeHandle 
        onMouseDown={handleMouseDown}
        isResizing={isResizing}
      />
      
      <div className="recommendations-sidebar__header">
        <div className="recommendations-sidebar__title-section">
          <h2 className="recommendations-sidebar__title">Recommendations</h2>
        </div>
        <button
          type="button"
          className="recommendations-sidebar__close"
          onClick={onClose}
          aria-label="Close recommendations panel"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div className="recommendations-sidebar__content">
        {loading && (
          <div className="recommendations-sidebar__loading">
            <LoadingSpinner size="medium" message="Loading recommendations..." />
          </div>
        )}

        {!loading && error && (
          <InlineError message={error} className="recommendations-sidebar__error" />
        )}

        {!loading && !error && (
          <>
            {items.length > 0 && (
              <StatisticsTiles 
                items={items.filter(item => !dismissedItems.has(item.name))}
                viewMode={viewMode}
              />
            )}
            
            <RecommendationsStats
              items={items.filter(item => !dismissedItems.has(item.name))}
              selectedFilter={selectedFilter}
              onFilterChange={setSelectedFilter}
            />

            {items.length > 0 && (
              <RecommendationsControls
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                sortBy={sortBy}
                onSortChange={setSortBy}
                tableFilter={tableFilter}
                onTableFilterChange={setTableFilter}
                schemaFilter={schemaFilter}
                onSchemaFilterChange={setSchemaFilter}
                availableTables={availableTables}
                availableSchemas={availableSchemas}
                viewMode={viewMode}
              />
            )}

            <div className="recommendations-list">
              {processedItems.length === 0 ? (
                <EmptyState 
                  hasFilters={!!searchQuery || !!selectedFilter || !!tableFilter || !!schemaFilter}
                  selectedFilter={selectedFilter}
                  searchQuery={searchQuery}
                />
              ) : (
                <>
                  {processedItems.map((item, index) => (
                    <RecommendationCard
                      key={`${item.name}-${item.element_name || 'table'}-${index}`}
                      recommendation={item}
                      index={index}
                      isExpanded={expandedCards.has(index)}
                      onToggle={handleCardToggle}
                      onDismiss={handleDismiss}
                      onViewTable={onViewTable}
                      viewMode={viewMode}
                    />
                  ))}
                  
                  {(searchQuery || selectedFilter || tableFilter || schemaFilter || dismissedItems.size > 0) && (
                    <div className="recommendations-list__footer">
                      <button
                        onClick={handleClearAll}
                        className="recommendations-clear-filters"
                      >
                        Clear all filters
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </aside>
  );
}