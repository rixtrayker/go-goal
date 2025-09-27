/**
 * Advanced Global Search System
 * Provides intelligent search across all entities with scopes, filters, and history
 */
class GlobalSearch {
  constructor() {
    this.isOpen = false;
    this.searchHistory = this.loadSearchHistory();
    this.recentItems = [];
    this.searchCache = new Map();
    this.debounceTimer = null;
    this.currentScope = 'all';
    this.currentFilters = {};
    this.searchModal = null;
    this.searchInput = null;
    this.resultsContainer = null;
    
    this.scopes = {
      'all': { name: 'All', icon: '🔍', color: '#6366f1' },
      'projects': { name: 'Projects', icon: '📁', color: '#3b82f6' },
      'goals': { name: 'Goals', icon: '🎯', color: '#8b5cf6' },
      'tasks': { name: 'Tasks', icon: '✓', color: '#10b981' },
      'contexts': { name: 'Contexts', icon: '🌈', color: '#f59e0b' },
      'tags': { name: 'Tags', icon: '🏷️', color: '#ef4444' },
      'notes': { name: 'Notes', icon: '📝', color: '#6b7280' }
    };

    this.init();
  }

  init() {
    this.createSearchModal();
    this.loadRecentItems();
    
    // Global search trigger in navbar
    this.enhanceNavbarSearch();
  }

  enhanceNavbarSearch() {
    const navSearch = document.querySelector('.search-input');
    if (navSearch) {
      navSearch.addEventListener('focus', () => this.toggle());
      navSearch.addEventListener('click', () => this.toggle());
    }
  }

  createSearchModal() {
    const modal = document.createElement('div');
    modal.id = 'global-search-modal';
    modal.className = 'search-modal';
    modal.innerHTML = `
      <div class="search-modal-overlay" onclick="globalSearch.close()"></div>
      <div class="search-modal-content glass">
        <div class="search-header">
          <div class="search-input-container">
            <div class="search-icon-container">
              <svg class="search-icon" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </div>
            <input 
              type="text" 
              id="global-search-input" 
              class="search-input-field" 
              placeholder="Search across all your data..."
              autocomplete="off"
              spellcheck="false"
            />
            <div class="search-shortcut-hint">
              <kbd>⌘K</kbd>
            </div>
          </div>
          
          <div class="search-scopes">
            ${Object.entries(this.scopes).map(([key, scope]) => `
              <button 
                class="scope-btn ${key === 'all' ? 'active' : ''}" 
                data-scope="${key}"
                onclick="globalSearch.setScope('${key}')"
              >
                <span class="scope-icon">${scope.icon}</span>
                <span class="scope-name">${scope.name}</span>
              </button>
            `).join('')}
          </div>

          <div class="search-filters" id="search-filters">
            <!-- Dynamic filters will be inserted here -->
          </div>
        </div>

        <div class="search-body">
          <div class="search-results" id="search-results">
            <!-- Results will be populated here -->
          </div>
        </div>

        <div class="search-footer">
          <div class="search-hints">
            <div class="hint-group">
              <kbd>↑</kbd><kbd>↓</kbd> <span>Navigate</span>
            </div>
            <div class="hint-group">
              <kbd>Enter</kbd> <span>Open</span>
            </div>
            <div class="hint-group">
              <kbd>⌘Enter</kbd> <span>New Tab</span>
            </div>
            <div class="hint-group">
              <kbd>Esc</kbd> <span>Close</span>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    this.searchModal = modal;
    this.searchInput = document.getElementById('global-search-input');
    this.resultsContainer = document.getElementById('search-results');
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Search input events
    this.searchInput.addEventListener('input', (e) => {
      this.handleSearchInput(e.target.value);
    });

    this.searchInput.addEventListener('keydown', (e) => {
      this.handleKeyDown(e);
    });

    // Prevent search modal from closing when clicking inside
    this.searchModal.querySelector('.search-modal-content').addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  handleSearchInput(query) {
    clearTimeout(this.debounceTimer);
    
    if (query.trim() === '') {
      this.showRecentAndSuggestions();
      return;
    }

    this.debounceTimer = setTimeout(() => {
      this.performSearch(query);
    }, 200);
  }

  handleKeyDown(e) {
    const results = this.resultsContainer.querySelectorAll('.search-result-item');
    const selected = this.resultsContainer.querySelector('.search-result-item.selected');
    let selectedIndex = selected ? Array.from(results).indexOf(selected) : -1;

    switch(e.key) {
      case 'ArrowDown':
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, results.length - 1);
        this.selectResult(results, selectedIndex);
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, 0);
        this.selectResult(results, selectedIndex);
        break;
        
      case 'Enter':
        e.preventDefault();
        if (selected) {
          if (e.metaKey || e.ctrlKey) {
            window.open(selected.dataset.url, '_blank');
          } else {
            window.location.href = selected.dataset.url;
          }
          this.addToHistory(this.searchInput.value, selected.dataset.type, selected.dataset.title);
          this.close();
        }
        break;
        
      case 'Escape':
        e.preventDefault();
        this.close();
        break;
    }
  }

  selectResult(results, index) {
    results.forEach(result => result.classList.remove('selected'));
    if (results[index]) {
      results[index].classList.add('selected');
      results[index].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  async performSearch(query) {
    try {
      this.showLoading();
      
      const cacheKey = `${this.currentScope}:${query}:${JSON.stringify(this.currentFilters)}`;
      
      if (this.searchCache.has(cacheKey)) {
        const cachedResults = this.searchCache.get(cacheKey);
        this.displayResults(cachedResults, query);
        return;
      }

      const results = await this.fetchSearchResults(query);
      this.searchCache.set(cacheKey, results);
      this.displayResults(results, query);
      
    } catch (error) {
      console.error('Search error:', error);
      this.showError('Search failed. Please try again.');
    }
  }

  async fetchSearchResults(query) {
    const requests = [];
    const searchParams = new URLSearchParams({
      q: query,
      limit: 20
    });

    if (this.currentScope === 'all') {
      // Search all endpoints
      requests.push(
        fetch(`/api/v1/projects?${searchParams}`).then(r => r.json()).then(data => ({ type: 'projects', data })),
        fetch(`/api/v1/goals?${searchParams}`).then(r => r.json()).then(data => ({ type: 'goals', data })),
        fetch(`/api/v1/tasks?${searchParams}`).then(r => r.json()).then(data => ({ type: 'tasks', data })),
        fetch(`/api/v1/contexts?${searchParams}`).then(r => r.json()).then(data => ({ type: 'contexts', data })),
        fetch(`/api/v1/notes?${searchParams}`).then(r => r.json()).then(data => ({ type: 'notes', data })),
        fetch(`/api/v1/tags?${searchParams}`).then(r => r.json()).then(data => ({ type: 'tags', data }))
      );
    } else {
      // Search specific scope
      requests.push(
        fetch(`/api/v1/${this.currentScope}?${searchParams}`).then(r => r.json()).then(data => ({ type: this.currentScope, data }))
      );
    }

    const responses = await Promise.allSettled(requests);
    const results = [];

    responses.forEach(response => {
      if (response.status === 'fulfilled') {
        const { type, data } = response.value;
        const filteredData = this.filterAndRankResults(data, query, type);
        results.push(...filteredData.map(item => ({ ...item, type })));
      }
    });

    return this.sortResultsByRelevance(results, query);
  }

  filterAndRankResults(data, query, type) {
    if (!Array.isArray(data)) return [];
    
    const queryLower = query.toLowerCase();
    
    return data
      .filter(item => {
        const searchableText = [
          item.title || item.name || '',
          item.description || '',
          item.content || '',
          ...(item.tags || []).map(tag => tag.name || tag)
        ].join(' ').toLowerCase();
        
        return searchableText.includes(queryLower);
      })
      .map(item => {
        const title = item.title || item.name || '';
        const description = item.description || item.content || '';
        
        // Calculate relevance score
        let score = 0;
        
        // Exact title match gets highest score
        if (title.toLowerCase() === queryLower) score += 100;
        else if (title.toLowerCase().includes(queryLower)) score += 50;
        
        // Description match
        if (description.toLowerCase().includes(queryLower)) score += 25;
        
        // Recent items get bonus
        if (this.recentItems.some(recent => recent.id === item.id && recent.type === type)) {
          score += 10;
        }
        
        return { ...item, _relevanceScore: score };
      })
      .sort((a, b) => b._relevanceScore - a._relevanceScore);
  }

  sortResultsByRelevance(results, query) {
    return results.sort((a, b) => {
      // First by relevance score
      if (b._relevanceScore !== a._relevanceScore) {
        return b._relevanceScore - a._relevanceScore;
      }
      
      // Then by type priority (projects > goals > tasks > etc.)
      const typePriority = { projects: 5, goals: 4, tasks: 3, contexts: 2, notes: 1, tags: 0 };
      const aPriority = typePriority[a.type] || 0;
      const bPriority = typePriority[b.type] || 0;
      
      if (bPriority !== aPriority) {
        return bPriority - aPriority;
      }
      
      // Finally by creation date (newer first)
      const aDate = new Date(a.createdAt || a.created_at || 0);
      const bDate = new Date(b.createdAt || b.created_at || 0);
      return bDate - aDate;
    });
  }

  displayResults(results, query) {
    if (results.length === 0) {
      this.showNoResults(query);
      return;
    }

    const groupedResults = this.groupResultsByType(results);
    let html = '';

    Object.entries(groupedResults).forEach(([type, items]) => {
      if (items.length === 0) return;
      
      const scope = this.scopes[type];
      html += `
        <div class="result-group">
          <div class="result-group-header">
            <span class="result-group-icon">${scope.icon}</span>
            <span class="result-group-title">${scope.name}</span>
            <span class="result-group-count">${items.length}</span>
          </div>
          <div class="result-group-items">
            ${items.map(item => this.renderResultItem(item, query)).join('')}
          </div>
        </div>
      `;
    });

    this.resultsContainer.innerHTML = html;
    
    // Auto-select first result
    const firstResult = this.resultsContainer.querySelector('.search-result-item');
    if (firstResult) {
      firstResult.classList.add('selected');
    }
  }

  groupResultsByType(results) {
    const grouped = {};
    
    results.forEach(result => {
      if (!grouped[result.type]) {
        grouped[result.type] = [];
      }
      grouped[result.type].push(result);
    });
    
    return grouped;
  }

  renderResultItem(item, query) {
    const title = item.title || item.name || 'Untitled';
    const description = item.description || item.content || '';
    const truncatedDesc = description.length > 100 ? description.substring(0, 100) + '...' : description;
    
    const highlightedTitle = this.highlightQuery(title, query);
    const highlightedDesc = this.highlightQuery(truncatedDesc, query);
    
    const url = this.getItemUrl(item, item.type);
    const statusBadge = this.getStatusBadge(item);
    const metadata = this.getItemMetadata(item);

    return `
      <div class="search-result-item" data-url="${url}" data-type="${item.type}" data-title="${title}">
        <div class="result-item-main">
          <div class="result-item-title">${highlightedTitle}</div>
          <div class="result-item-description">${highlightedDesc}</div>
          <div class="result-item-metadata">
            ${statusBadge}
            ${metadata}
          </div>
        </div>
        <div class="result-item-actions">
          <div class="result-item-type">${this.scopes[item.type].icon}</div>
        </div>
      </div>
    `;
  }

  highlightQuery(text, query) {
    if (!query || !text) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  getItemUrl(item, type) {
    const baseUrls = {
      projects: '/projects',
      goals: '/goals',
      tasks: '/tasks',
      contexts: '/contexts',
      notes: '/notes',
      tags: '/tags'
    };
    
    return `${baseUrls[type]}/${item.id}`;
  }

  getStatusBadge(item) {
    if (!item.status) return '';
    
    return `<span class="badge badge-${item.status}">${item.status}</span>`;
  }

  getItemMetadata(item) {
    const metadata = [];
    
    if (item.priority) {
      metadata.push(`<span class="metadata-item priority-${item.priority}">P${item.priority}</span>`);
    }
    
    if (item.dueDate || item.due_date) {
      const dueDate = new Date(item.dueDate || item.due_date);
      metadata.push(`<span class="metadata-item">Due ${dueDate.toLocaleDateString()}</span>`);
    }
    
    if (item.tags && item.tags.length > 0) {
      const tagNames = item.tags.slice(0, 3).map(tag => tag.name || tag).join(', ');
      metadata.push(`<span class="metadata-item">${tagNames}</span>`);
    }
    
    return metadata.join('');
  }

  showRecentAndSuggestions() {
    let html = '';
    
    // Recent searches
    if (this.searchHistory.length > 0) {
      html += `
        <div class="recent-section">
          <div class="section-header">
            <span class="section-icon">🕒</span>
            <span class="section-title">Recent Searches</span>
          </div>
          <div class="recent-items">
            ${this.searchHistory.slice(0, 5).map(item => `
              <div class="recent-item" onclick="globalSearch.executeRecentSearch('${item.query}')">
                <div class="recent-item-main">
                  <div class="recent-item-query">${item.query}</div>
                  <div class="recent-item-meta">${item.type} • ${item.title}</div>
                </div>
                <div class="recent-item-time">${this.formatRelativeTime(item.timestamp)}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
    
    // Recent items
    if (this.recentItems.length > 0) {
      html += `
        <div class="recent-section">
          <div class="section-header">
            <span class="section-icon">📋</span>
            <span class="section-title">Recently Viewed</span>
          </div>
          <div class="recent-items">
            ${this.recentItems.slice(0, 8).map(item => `
              <div class="search-result-item" data-url="${this.getItemUrl(item, item.type)}" data-type="${item.type}" data-title="${item.title}">
                <div class="result-item-main">
                  <div class="result-item-title">${item.title}</div>
                  <div class="result-item-description">${(item.description || '').substring(0, 60)}${item.description && item.description.length > 60 ? '...' : ''}</div>
                </div>
                <div class="result-item-actions">
                  <div class="result-item-type">${this.scopes[item.type].icon}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
    
    if (html === '') {
      html = `
        <div class="empty-state">
          <div class="empty-state-icon">🔍</div>
          <div class="empty-state-title">Start typing to search</div>
          <div class="empty-state-description">Search across all your projects, goals, tasks, and more</div>
        </div>
      `;
    }
    
    this.resultsContainer.innerHTML = html;
  }

  showLoading() {
    this.resultsContainer.innerHTML = `
      <div class="search-loading">
        <div class="loading-spinner"></div>
        <div class="loading-text">Searching...</div>
      </div>
    `;
  }

  showError(message) {
    this.resultsContainer.innerHTML = `
      <div class="search-error">
        <div class="error-icon">⚠️</div>
        <div class="error-message">${message}</div>
      </div>
    `;
  }

  showNoResults(query) {
    this.resultsContainer.innerHTML = `
      <div class="no-results">
        <div class="no-results-icon">🔍</div>
        <div class="no-results-title">No results found</div>
        <div class="no-results-description">
          Try adjusting your search terms or <a href="javascript:void(0)" onclick="globalSearch.setScope('all')">searching all categories</a>
        </div>
      </div>
    `;
  }

  setScope(scope) {
    this.currentScope = scope;
    
    // Update UI
    document.querySelectorAll('.scope-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.scope === scope);
    });
    
    // Update placeholder
    const scopeName = this.scopes[scope].name.toLowerCase();
    this.searchInput.placeholder = scope === 'all' 
      ? 'Search across all your data...' 
      : `Search ${scopeName}...`;
    
    // Re-run search if there's a query
    if (this.searchInput.value.trim()) {
      this.performSearch(this.searchInput.value.trim());
    }
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.isOpen = true;
    this.searchModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Focus search input
    setTimeout(() => {
      this.searchInput.focus();
      this.showRecentAndSuggestions();
    }, 100);
  }

  close() {
    this.isOpen = false;
    this.searchModal.style.display = 'none';
    document.body.style.overflow = '';
    
    // Clear search
    this.searchInput.value = '';
    this.currentScope = 'all';
    this.setScope('all');
  }

  toggleAdvanced() {
    // TODO: Implement advanced search modal
    console.log('Advanced search not yet implemented');
  }

  executeRecentSearch(query) {
    this.searchInput.value = query;
    this.performSearch(query);
  }

  addToHistory(query, type, title) {
    const historyItem = {
      query,
      type,
      title,
      timestamp: Date.now()
    };
    
    // Remove duplicates
    this.searchHistory = this.searchHistory.filter(item => 
      item.query !== query || item.type !== type || item.title !== title
    );
    
    // Add to beginning
    this.searchHistory.unshift(historyItem);
    
    // Keep only last 50 searches
    this.searchHistory = this.searchHistory.slice(0, 50);
    
    this.saveSearchHistory();
  }

  addRecentItem(item, type) {
    const recentItem = { ...item, type, timestamp: Date.now() };
    
    // Remove duplicates
    this.recentItems = this.recentItems.filter(recent => 
      !(recent.id === item.id && recent.type === type)
    );
    
    // Add to beginning
    this.recentItems.unshift(recentItem);
    
    // Keep only last 20 items
    this.recentItems = this.recentItems.slice(0, 20);
    
    this.saveRecentItems();
  }

  loadSearchHistory() {
    try {
      const history = localStorage.getItem('go-goal-search-history');
      return history ? JSON.parse(history) : [];
    } catch {
      return [];
    }
  }

  saveSearchHistory() {
    try {
      localStorage.setItem('go-goal-search-history', JSON.stringify(this.searchHistory));
    } catch {
      // Ignore storage errors
    }
  }

  loadRecentItems() {
    try {
      const items = localStorage.getItem('go-goal-recent-items');
      this.recentItems = items ? JSON.parse(items) : [];
    } catch {
      this.recentItems = [];
    }
  }

  saveRecentItems() {
    try {
      localStorage.setItem('go-goal-recent-items', JSON.stringify(this.recentItems));
    } catch {
      // Ignore storage errors
    }
  }

  formatRelativeTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minute = 60 * 1000;
    const hour = minute * 60;
    const day = hour * 24;
    
    if (diff < minute) return 'Just now';
    if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
    if (diff < day) return `${Math.floor(diff / hour)}h ago`;
    return `${Math.floor(diff / day)}d ago`;
  }
}

// Initialize global search
const globalSearch = new GlobalSearch();

// Expose to window for keyboard shortcuts
window.globalSearch = globalSearch;