/**
 * Tag Input Component
 * Provides an interactive tag input field with autocomplete and management
 */
class TagInput {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      placeholder: 'Add tags...',
      allowNew: true,
      maxTags: null,
      suggestions: [],
      value: [],
      ...options
    };
    
    this.tags = [...this.options.value];
    this.suggestions = [...this.options.suggestions];
    this.isOpen = false;
    this.selectedIndex = -1;
    
    this.init();
  }

  init() {
    this.render();
    this.setupEventListeners();
    this.loadSuggestions();
  }

  render() {
    this.container.innerHTML = `
      <div class="tag-input-wrapper">
        <div class="tag-input-container">
          <div class="selected-tags" id="selected-tags">
            ${this.renderSelectedTags()}
          </div>
          <input type="text" 
                 class="tag-input" 
                 placeholder="${this.tags.length === 0 ? this.options.placeholder : ''}"
                 autocomplete="off">
        </div>
        <div class="tag-suggestions" id="tag-suggestions" style="display: none;">
          <!-- Suggestions will be populated here -->
        </div>
      </div>
    `;

    this.input = this.container.querySelector('.tag-input');
    this.selectedTagsContainer = this.container.querySelector('#selected-tags');
    this.suggestionsContainer = this.container.querySelector('#tag-suggestions');
  }

  renderSelectedTags() {
    return this.tags.map((tag, index) => `
      <div class="selected-tag" style="background: ${tag.color || '#6366f1'}">
        ${tag.icon ? `<span class="tag-icon">${tag.icon}</span>` : ''}
        <span class="tag-name">${tag.name}</span>
        <button type="button" class="remove-tag" onclick="this.closest('.tag-input-wrapper').tagInput.removeTag(${index})">×</button>
      </div>
    `).join('');
  }

  setupEventListeners() {
    // Store reference for event handlers
    this.container.querySelector('.tag-input-wrapper').tagInput = this;

    this.input.addEventListener('input', (e) => {
      this.handleInput(e.target.value);
    });

    this.input.addEventListener('keydown', (e) => {
      this.handleKeydown(e);
    });

    this.input.addEventListener('focus', () => {
      this.showSuggestions();
    });

    this.input.addEventListener('blur', (e) => {
      // Delay hiding to allow for suggestion clicks
      setTimeout(() => {
        if (!this.container.contains(document.activeElement)) {
          this.hideSuggestions();
        }
      }, 150);
    });

    // Handle clicks outside
    document.addEventListener('click', (e) => {
      if (!this.container.contains(e.target)) {
        this.hideSuggestions();
      }
    });
  }

  async loadSuggestions() {
    try {
      if (window.apiClient && window.apiClient.getTags) {
        const allTags = await window.apiClient.getTags();
        this.suggestions = allTags.map(tag => ({
          id: tag.id,
          name: tag.name,
          color: tag.color,
          icon: tag.icon,
          usageCount: tag.usageCount || 0
        }));
      }
    } catch (error) {
      console.warn('Failed to load tag suggestions:', error);
    }
  }

  handleInput(value) {
    this.filterSuggestions(value);
    this.showSuggestions();
  }

  handleKeydown(e) {
    const value = this.input.value.trim();

    switch (e.key) {
      case 'Enter':
      case 'Tab':
        e.preventDefault();
        if (this.selectedIndex >= 0) {
          this.selectSuggestion(this.selectedIndex);
        } else if (value && this.options.allowNew) {
          this.addTag({ name: value });
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        this.navigateSuggestions(1);
        break;

      case 'ArrowUp':
        e.preventDefault();
        this.navigateSuggestions(-1);
        break;

      case 'Escape':
        this.hideSuggestions();
        this.input.blur();
        break;

      case 'Backspace':
        if (value === '' && this.tags.length > 0) {
          this.removeTag(this.tags.length - 1);
        }
        break;

      case ',':
        if (value && this.options.allowNew) {
          e.preventDefault();
          this.addTag({ name: value });
        }
        break;
    }
  }

  filterSuggestions(query) {
    if (!query) {
      this.filteredSuggestions = this.suggestions
        .filter(suggestion => !this.tags.some(tag => tag.name === suggestion.name))
        .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
        .slice(0, 10);
    } else {
      const lowerQuery = query.toLowerCase();
      this.filteredSuggestions = this.suggestions
        .filter(suggestion => 
          suggestion.name.toLowerCase().includes(lowerQuery) &&
          !this.tags.some(tag => tag.name === suggestion.name)
        )
        .sort((a, b) => {
          const aStarts = a.name.toLowerCase().startsWith(lowerQuery);
          const bStarts = b.name.toLowerCase().startsWith(lowerQuery);
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;
          return (b.usageCount || 0) - (a.usageCount || 0);
        })
        .slice(0, 10);
    }

    this.selectedIndex = -1;
    this.renderSuggestions();
  }

  renderSuggestions() {
    const query = this.input.value.trim();
    let suggestions = '';

    if (this.filteredSuggestions.length > 0) {
      suggestions = this.filteredSuggestions.map((suggestion, index) => `
        <div class="suggestion-item ${index === this.selectedIndex ? 'selected' : ''}" 
             onclick="this.closest('.tag-input-wrapper').tagInput.selectSuggestion(${index})">
          <div class="suggestion-visual">
            <div class="suggestion-color" style="background: ${suggestion.color || '#6366f1'}"></div>
            ${suggestion.icon ? `<span class="suggestion-icon">${suggestion.icon}</span>` : ''}
          </div>
          <div class="suggestion-content">
            <div class="suggestion-name">${this.highlightMatch(suggestion.name, query)}</div>
            <div class="suggestion-usage">${suggestion.usageCount || 0} uses</div>
          </div>
        </div>
      `).join('');
    }

    if (query && this.options.allowNew && !this.tags.some(tag => tag.name.toLowerCase() === query.toLowerCase())) {
      const createNew = `
        <div class="suggestion-item create-new ${this.selectedIndex === this.filteredSuggestions.length ? 'selected' : ''}" 
             onclick="this.closest('.tag-input-wrapper').tagInput.addTag({name: '${query}'})">
          <div class="suggestion-visual">
            <div class="suggestion-color" style="background: #6366f1"></div>
            <span class="suggestion-icon">+</span>
          </div>
          <div class="suggestion-content">
            <div class="suggestion-name">Create "${query}"</div>
            <div class="suggestion-usage">New tag</div>
          </div>
        </div>
      `;
      suggestions += createNew;
    }

    this.suggestionsContainer.innerHTML = suggestions || '<div class="no-suggestions">No suggestions</div>';
  }

  highlightMatch(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  showSuggestions() {
    this.isOpen = true;
    this.suggestionsContainer.style.display = 'block';
    this.filterSuggestions(this.input.value);
  }

  hideSuggestions() {
    this.isOpen = false;
    this.suggestionsContainer.style.display = 'none';
    this.selectedIndex = -1;
  }

  navigateSuggestions(direction) {
    const maxIndex = this.filteredSuggestions.length + (this.input.value.trim() && this.options.allowNew ? 0 : -1);
    
    this.selectedIndex = Math.max(-1, Math.min(maxIndex, this.selectedIndex + direction));
    this.renderSuggestions();
  }

  selectSuggestion(index) {
    if (index >= 0 && index < this.filteredSuggestions.length) {
      this.addTag(this.filteredSuggestions[index]);
    }
  }

  addTag(tag) {
    // Check max tags limit
    if (this.options.maxTags && this.tags.length >= this.options.maxTags) {
      return;
    }

    // Check for duplicates
    if (this.tags.some(existingTag => existingTag.name.toLowerCase() === tag.name.toLowerCase())) {
      return;
    }

    // Add default properties if missing
    const newTag = {
      name: tag.name.trim(),
      color: tag.color || '#6366f1',
      icon: tag.icon || null,
      id: tag.id || null
    };

    this.tags.push(newTag);
    this.input.value = '';
    this.input.placeholder = '';
    this.updateDisplay();
    this.filterSuggestions('');
    this.triggerChange();
  }

  removeTag(index) {
    if (index >= 0 && index < this.tags.length) {
      this.tags.splice(index, 1);
      this.updateDisplay();
      this.triggerChange();
      
      if (this.tags.length === 0) {
        this.input.placeholder = this.options.placeholder;
      }
    }
  }

  updateDisplay() {
    this.selectedTagsContainer.innerHTML = this.renderSelectedTags();
  }

  triggerChange() {
    // Trigger custom event for form integration
    const event = new CustomEvent('tagsChanged', {
      detail: { tags: this.tags },
      bubbles: true
    });
    this.container.dispatchEvent(event);
  }

  // Public API methods
  getValue() {
    return this.tags;
  }

  setValue(tags) {
    this.tags = Array.isArray(tags) ? [...tags] : [];
    this.updateDisplay();
    this.input.placeholder = this.tags.length === 0 ? this.options.placeholder : '';
  }

  addTagByName(name) {
    const existingTag = this.suggestions.find(s => s.name.toLowerCase() === name.toLowerCase());
    if (existingTag) {
      this.addTag(existingTag);
    } else if (this.options.allowNew) {
      this.addTag({ name });
    }
  }

  clear() {
    this.tags = [];
    this.updateDisplay();
    this.input.placeholder = this.options.placeholder;
    this.triggerChange();
  }

  focus() {
    this.input.focus();
  }

  // Static method to initialize all tag inputs on a page
  static initializeAll() {
    document.querySelectorAll('[data-tag-input]').forEach(element => {
      if (!element.tagInput) {
        const options = element.dataset.tagInput ? JSON.parse(element.dataset.tagInput) : {};
        element.tagInput = new TagInput(element, options);
      }
    });
  }
}

// CSS Styles
const tagInputStyles = `
  .tag-input-wrapper {
    position: relative;
    width: 100%;
  }

  .tag-input-container {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    transition: all 0.2s ease;
    min-height: 42px;
  }

  .tag-input-container:focus-within {
    border-color: var(--glass-primary);
    background: rgba(255, 255, 255, 0.08);
  }

  .selected-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    flex: 1;
  }

  .selected-tag {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 12px;
    color: white;
    white-space: nowrap;
    max-width: 150px;
  }

  .tag-icon {
    font-size: 10px;
  }

  .tag-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .remove-tag {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.8);
    cursor: pointer;
    padding: 0;
    margin-left: 2px;
    font-size: 14px;
    line-height: 1;
    transition: color 0.2s ease;
  }

  .remove-tag:hover {
    color: white;
  }

  .tag-input {
    background: none;
    border: none;
    outline: none;
    color: var(--text-primary);
    font-size: 14px;
    flex: 1;
    min-width: 100px;
    padding: 2px 0;
  }

  .tag-input::placeholder {
    color: var(--text-secondary);
  }

  .tag-suggestions {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: rgba(20, 20, 40, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    z-index: 1000;
    max-height: 200px;
    overflow-y: auto;
    margin-top: 4px;
  }

  .suggestion-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .suggestion-item:last-child {
    border-bottom: none;
  }

  .suggestion-item:hover,
  .suggestion-item.selected {
    background: rgba(255, 255, 255, 0.1);
  }

  .suggestion-visual {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }

  .suggestion-color {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }

  .suggestion-icon {
    font-size: 12px;
    width: 16px;
    text-align: center;
  }

  .suggestion-content {
    flex: 1;
    min-width: 0;
  }

  .suggestion-name {
    color: var(--text-primary);
    font-size: 14px;
    margin-bottom: 2px;
  }

  .suggestion-name mark {
    background: var(--glass-primary);
    color: white;
    padding: 1px 2px;
    border-radius: 2px;
  }

  .suggestion-usage {
    color: var(--text-secondary);
    font-size: 11px;
  }

  .create-new {
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .create-new .suggestion-name {
    color: var(--glass-primary);
  }

  .no-suggestions {
    padding: 12px;
    text-align: center;
    color: var(--text-secondary);
    font-size: 12px;
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .selected-tag {
      max-width: 120px;
    }
    
    .tag-input {
      min-width: 80px;
    }
  }
`;

// Inject CSS styles
if (window.StyleLoader) {
  window.StyleLoader.injectStyles('tag-input-styles', tagInputStyles);
} else {
  if (!document.getElementById('tag-input-styles')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'tag-input-styles';
    styleEl.textContent = tagInputStyles;
    document.head.appendChild(styleEl);
  }
}

// Make TagInput globally available
window.TagInput = TagInput;