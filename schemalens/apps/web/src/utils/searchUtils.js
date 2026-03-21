/**
 * Search utilities
 * Functions for searching and filtering tables
 */

/**
 * Search nodes by table name or ID
 * @param {Array} nodes - Array of React Flow nodes
 * @param {string} query - Search query
 * @returns {Object|null} Matching node or null if not found
 */
export function findMatchingNode(nodes, query) {
  if (!query?.trim() || !nodes?.length) {
    return null;
  }

  const searchTerm = query.toLowerCase().trim();
  
  return nodes.find((node) => {
    const tableName = node.data?.title?.toLowerCase() || "";
    const nodeId = node.id?.toLowerCase() || "";
    
    return tableName.includes(searchTerm) || nodeId.includes(searchTerm);
  });
}

/**
 * Filter nodes by search query for dropdown suggestions
 * @param {Array} nodes - Array of React Flow nodes
 * @param {string} query - Search query
 * @param {number} maxResults - Maximum number of results to return
 * @returns {Array} Filtered array of matching nodes
 */
export function filterNodesForSuggestions(nodes, query, maxResults = 10) {
  if (!query?.trim() || !nodes?.length) {
    return [];
  }

  const searchTerm = query.toLowerCase().trim();
  
  const matches = nodes.filter((node) => {
    const tableName = node.data?.title?.toLowerCase() || "";
    const nodeId = node.id?.toLowerCase() || "";
    
    return tableName.includes(searchTerm) || nodeId.includes(searchTerm);
  });

  // Sort by relevance: exact matches first, then starts-with, then contains
  const sorted = matches.sort((a, b) => {
    const aTitle = a.data?.title?.toLowerCase() || "";
    const bTitle = b.data?.title?.toLowerCase() || "";
    
    // Exact match gets highest priority
    if (aTitle === searchTerm) return -1;
    if (bTitle === searchTerm) return 1;
    
    // Starts with gets second priority
    if (aTitle.startsWith(searchTerm) && !bTitle.startsWith(searchTerm)) return -1;
    if (bTitle.startsWith(searchTerm) && !aTitle.startsWith(searchTerm)) return 1;
    
    // Alphabetical for same relevance level
    return aTitle.localeCompare(bTitle);
  });

  return sorted.slice(0, maxResults);
}

/**
 * Extract searchable text from a node
 * @param {Object} node - React Flow node
 * @returns {Array} Array of searchable strings
 */
export function getNodeSearchableText(node) {
  const searchable = [];
  
  if (node.data?.title) {
    searchable.push(node.data.title);
  }
  
  if (node.id) {
    searchable.push(node.id);
  }
  
  // Add column names as searchable text
  if (node.data?.columns) {
    searchable.push(...node.data.columns.map(col => col.name));
  }
  
  return searchable;
}

/**
 * Fuzzy search nodes with scoring
 * @param {Array} nodes - Array of React Flow nodes
 * @param {string} query - Search query
 * @param {number} threshold - Minimum score threshold (0-1)
 * @returns {Array} Array of matches with scores
 */
export function fuzzySearchNodes(nodes, query, threshold = 0.3) {
  if (!query?.trim() || !nodes?.length) {
    return [];
  }

  const searchTerm = query.toLowerCase().trim();
  
  return nodes
    .map(node => {
      const searchableText = getNodeSearchableText(node);
      let bestScore = 0;
      
      searchableText.forEach(text => {
        const score = calculateFuzzyScore(text.toLowerCase(), searchTerm);
        bestScore = Math.max(bestScore, score);
      });
      
      return { node, score: bestScore };
    })
    .filter(({ score }) => score >= threshold)
    .sort((a, b) => b.score - a.score)
    .map(({ node }) => node);
}

/**
 * Calculate fuzzy match score between two strings
 * @param {string} text - Text to search in
 * @param {string} query - Query to search for
 * @returns {number} Score between 0-1
 */
function calculateFuzzyScore(text, query) {
  if (text === query) return 1;
  if (text.includes(query)) return 0.8;
  
  // Simple character matching score
  let matches = 0;
  let queryIndex = 0;
  
  for (let i = 0; i < text.length && queryIndex < query.length; i++) {
    if (text[i] === query[queryIndex]) {
      matches++;
      queryIndex++;
    }
  }
  
  return matches / query.length * 0.6;
}