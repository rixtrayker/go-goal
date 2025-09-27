/**
 * Tags Page Component
 * Handles tag management, visualization, and assignment
 */
class TagsPage {
  constructor(container) {
    this.container = container;
    this.tags = [];
    this.filteredTags = [];
    this.searchTerm = '';
    this.sortBy = 'name';
    this.sortOrder = 'asc';
    this.selectedTags = new Set();
    this.showUsageStats = true;
  }

  async render(params = {}) {
    const { id, action } = params;

    if (id && action === 'edit') {
      await this.renderEditForm(id);
    } else if (action === 'new') {
      await this.renderCreateForm();
    } else {
      await this.renderTagsList();
    }
  }

  async renderTagsList() {
    this.container.innerHTML = `
      <div class="tags-page">
        <div class="page-header">
          <div class="page-title">
            <h1>Tags</h1>
            <div class="page-subtitle">${this.tags.length} tags</div>
          </div>
          <div class="page-actions">
            <button class="btn btn-secondary" onclick="this.bulkActions()">
              <span>⚡</span> Bulk Actions
            </button>
            <button class="btn btn-primary" data-route="/tags/new">
              <span>+</span> New Tag
            </button>
          </div>
        </div>

        <div class="tags-controls">
          <div class="search-filters">
            <div class="search-box">
              <input type="text" 
                     class="search-input" 
                     placeholder="Search tags..." 
                     value="${this.searchTerm}"
                     oninput="this.closest('.tags-page').tagsPage.handleSearch(this.value)">
              <div class="search-icon">🔍</div>
            </div>

            <select class="sort-select" 
                    onchange="this.closest('.tags-page').tagsPage.handleSort(this.value)">
              <option value="name_asc" ${this.sortBy === 'name' && this.sortOrder === 'asc' ? 'selected' : ''}>Name A-Z</option>
              <option value="name_desc" ${this.sortBy === 'name' && this.sortOrder === 'desc' ? 'selected' : ''}>Name Z-A</option>
              <option value="usage_desc" ${this.sortBy === 'usage' && this.sortOrder === 'desc' ? 'selected' : ''}>Most Used</option>
              <option value="usage_asc" ${this.sortBy === 'usage' && this.sortOrder === 'asc' ? 'selected' : ''}>Least Used</option>
              <option value="created_desc" ${this.sortBy === 'created' && this.sortOrder === 'desc' ? 'selected' : ''}>Recently Created</option>
            </select>

            <button class="view-toggle-btn ${this.showUsageStats ? 'active' : ''}" 
                    onclick="this.closest('.tags-page').tagsPage.toggleUsageStats()">
              📊 Usage Stats
            </button>
          </div>

          <div class="selected-actions" style="display: ${this.selectedTags.size > 0 ? 'flex' : 'none'}">
            <span class="selected-count">${this.selectedTags.size} selected</span>
            <button class="btn btn-secondary btn-sm" onclick="this.closest('.tags-page').tagsPage.clearSelection()">
              Clear
            </button>
            <button class="btn btn-danger btn-sm" onclick="this.closest('.tags-page').tagsPage.deleteSelected()">
              Delete Selected
            </button>
            <button class="btn btn-primary btn-sm" onclick="this.closest('.tags-page').tagsPage.mergeSelected()">
              Merge Selected
            </button>
          </div>
        </div>

        <div id="tags-content" class="tags-content">
          <div class="loading-spinner">Loading tags...</div>
        </div>

        <div class="tags-insights" style="display: ${this.showUsageStats ? 'block' : 'none'}">
          <h3>Tag Insights</h3>
          <div class="insights-grid" id="insights-grid">
            <!-- Insights will be populated here -->
          </div>
        </div>
      </div>
    `;

    this.loadStyles();
    this.container.querySelector('.tags-page').tagsPage = this;
    
    await this.loadData();
    this.renderTagsContent();
    this.renderInsights();
  }

  async renderCreateForm() {
    this.container.innerHTML = `
      <div class="tag-form-page">
        <div class="page-header">
          <div class="page-navigation">
            <button class="btn btn-ghost" onclick="router.navigate('/tags')">
              ← Back to Tags
            </button>
          </div>
          <div class="page-title">
            <h1>Create New Tag</h1>
          </div>
        </div>

        <form id="tag-form" class="tag-form">
          <div class="form-section">
            <h3>Basic Information</h3>
            
            <div class="form-group">
              <label for="name">Tag Name *</label>
              <input type="text" id="name" name="name" required 
                     placeholder="Enter tag name">
            </div>

            <div class="form-group">
              <label for="description">Description</label>
              <textarea id="description" name="description" rows="3" 
                        placeholder="Optional description for this tag..."></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="color">Color</label>
                <div class="color-picker">
                  <input type="color" id="color" name="color" value="#6366f1">
                  <div class="color-presets">
                    ${this.getColorPresets().map(color => `
                      <div class="color-preset" 
                           style="background: ${color}" 
                           onclick="document.getElementById('color').value = '${color}'"></div>
                    `).join('')}
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label for="icon">Icon (Optional)</label>
                <input type="text" id="icon" name="icon" 
                       placeholder="🏷️ or any emoji">
                <div class="form-help">You can use any emoji or leave empty</div>
              </div>
            </div>

            <div class="form-group">
              <label>
                <input type="checkbox" id="isSystem" name="isSystem">
                System Tag (cannot be deleted by users)
              </label>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary" onclick="router.navigate('/tags')">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary">
              Create Tag
            </button>
          </div>
        </form>
      </div>
    `;

    this.setupForm();
  }

  async renderEditForm(id) {
    try {
      const tag = await window.apiClient.getTag(id);

      this.container.innerHTML = `
        <div class="tag-form-page">
          <div class="page-header">
            <div class="page-navigation">
              <button class="btn btn-ghost" onclick="router.navigate('/tags')">
                ← Back to Tags
              </button>
            </div>
            <div class="page-title">
              <h1>Edit Tag</h1>
            </div>
          </div>

          <form id="tag-form" class="tag-form">
            <input type="hidden" name="id" value="${tag.id}">
            
            <div class="form-section">
              <h3>Basic Information</h3>
              
              <div class="form-group">
                <label for="name">Tag Name *</label>
                <input type="text" id="name" name="name" required 
                       value="${tag.name}" placeholder="Enter tag name">
              </div>

              <div class="form-group">
                <label for="description">Description</label>
                <textarea id="description" name="description" rows="3" 
                          placeholder="Optional description for this tag...">${tag.description || ''}</textarea>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="color">Color</label>
                  <div class="color-picker">
                    <input type="color" id="color" name="color" value="${tag.color || '#6366f1'}">
                    <div class="color-presets">
                      ${this.getColorPresets().map(color => `
                        <div class="color-preset" 
                             style="background: ${color}" 
                             onclick="document.getElementById('color').value = '${color}'"></div>
                      `).join('')}
                    </div>
                  </div>
                </div>

                <div class="form-group">
                  <label for="icon">Icon (Optional)</label>
                  <input type="text" id="icon" name="icon" 
                         value="${tag.icon || ''}" placeholder="🏷️ or any emoji">
                  <div class="form-help">You can use any emoji or leave empty</div>
                </div>
              </div>

              <div class="form-group">
                <label>
                  <input type="checkbox" id="isSystem" name="isSystem" ${tag.isSystem ? 'checked' : ''}>
                  System Tag (cannot be deleted by users)
                </label>
              </div>

              <div class="usage-stats">
                <h4>Usage Statistics</h4>
                <div class="stats-grid">
                  <div class="stat-item">
                    <div class="stat-value">${tag.usageCount || 0}</div>
                    <div class="stat-label">Total Uses</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value">${tag.taskCount || 0}</div>
                    <div class="stat-label">Tasks</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value">${tag.projectCount || 0}</div>
                    <div class="stat-label">Projects</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value">${tag.goalCount || 0}</div>
                    <div class="stat-label">Goals</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn-secondary" onclick="router.navigate('/tags')">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary">
                Update Tag
              </button>
            </div>
          </form>
        </div>
      `;

      this.setupForm(true);

    } catch (error) {
      this.container.innerHTML = `
        <div class="error-page">
          <h2>Tag not found</h2>
          <p>The tag you're trying to edit doesn't exist or has been deleted.</p>
          <button class="btn btn-primary" onclick="router.navigate('/tags')">
            Back to Tags
          </button>
        </div>
      `;
    }
  }

  setupForm(isEdit = false) {
    const form = document.getElementById('tag-form');
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const tagData = {
        name: formData.get('name'),
        description: formData.get('description'),
        color: formData.get('color'),
        icon: formData.get('icon'),
        isSystem: formData.has('isSystem')
      };

      try {
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = isEdit ? 'Updating...' : 'Creating...';

        let tag;
        if (isEdit) {
          const id = formData.get('id');
          tag = await window.apiClient.updateTag(id, tagData);
        } else {
          tag = await window.apiClient.createTag(tagData);
        }

        window.errorHandler.show(`Tag ${isEdit ? 'updated' : 'created'} successfully!`, 'success');
        router.navigate('/tags');

      } catch (error) {
        console.error('Form submission error:', error);
        window.errorHandler.show(`Failed to ${isEdit ? 'update' : 'create'} tag: ${error.message}`);
        
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.textContent = isEdit ? 'Update Tag' : 'Create Tag';
      }
    });
  }

  getColorPresets() {
    return [
      '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
      '#f43f5e', '#ef4444', '#f97316', '#f59e0b', '#eab308',
      '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4',
      '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7'
    ];
  }

  loadStyles() {
    if (document.getElementById('tags-page-styles')) return;

    const tagsPageStyles = `
      .tags-page {
        padding: 24px;
        max-width: 1200px;
        margin: 0 auto;
      }

      .tags-controls {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        gap: 16px;
        flex-wrap: wrap;
      }

      .search-filters {
        display: flex;
        gap: 12px;
        flex: 1;
        flex-wrap: wrap;
        align-items: center;
      }

      .view-toggle-btn {
        padding: 8px 12px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 12px;
      }

      .view-toggle-btn.active,
      .view-toggle-btn:hover {
        background: rgba(255, 255, 255, 0.1);
        color: var(--text-primary);
        border-color: rgba(255, 255, 255, 0.2);
      }

      .selected-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        background: rgba(99, 102, 241, 0.1);
        border-radius: 8px;
        border: 1px solid rgba(99, 102, 241, 0.2);
      }

      .selected-count {
        font-size: 12px;
        color: var(--glass-primary);
        font-weight: 600;
      }

      .tags-content {
        min-height: 400px;
      }

      .tags-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 16px;
      }

      .tag-card {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 16px;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
      }

      .tag-card:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.2);
        transform: translateY(-2px);
      }

      .tag-card.selected {
        border-color: var(--glass-primary);
        background: rgba(99, 102, 241, 0.1);
      }

      .tag-card-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;
      }

      .tag-checkbox {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 3px;
        cursor: pointer;
        position: relative;
        transition: all 0.2s ease;
      }

      .tag-checkbox.checked {
        background: var(--glass-primary);
        border-color: var(--glass-primary);
      }

      .tag-checkbox.checked::after {
        content: '✓';
        position: absolute;
        top: -3px;
        left: 2px;
        color: white;
        font-size: 12px;
        font-weight: bold;
      }

      .tag-visual {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
      }

      .tag-color {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .tag-icon {
        font-size: 16px;
        width: 20px;
        text-align: center;
      }

      .tag-name {
        font-weight: 600;
        color: var(--text-primary);
        font-size: 16px;
      }

      .tag-description {
        color: var(--text-secondary);
        font-size: 14px;
        margin-bottom: 12px;
        line-height: 1.4;
      }

      .tag-stats {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        color: var(--text-secondary);
      }

      .tag-usage {
        display: flex;
        gap: 8px;
      }

      .usage-item {
        background: rgba(255, 255, 255, 0.1);
        padding: 2px 6px;
        border-radius: 4px;
      }

      .tag-actions {
        display: flex;
        gap: 4px;
        opacity: 0;
        transition: opacity 0.2s ease;
      }

      .tag-card:hover .tag-actions {
        opacity: 1;
      }

      .tag-action {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        cursor: pointer;
        color: var(--text-secondary);
        font-size: 12px;
        transition: all 0.2s ease;
      }

      .tag-action:hover {
        background: rgba(255, 255, 255, 0.1);
        color: var(--text-primary);
      }

      .tags-insights {
        margin-top: 32px;
        padding: 24px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .insights-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
        margin-top: 16px;
      }

      .insight-card {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        padding: 16px;
        text-align: center;
      }

      .insight-value {
        font-size: 24px;
        font-weight: 700;
        color: var(--glass-primary);
        margin-bottom: 4px;
      }

      .insight-label {
        font-size: 12px;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      /* Form Styles */
      .tag-form-page {
        padding: 24px;
        max-width: 600px;
        margin: 0 auto;
      }

      .tag-form {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 16px;
        padding: 32px;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .color-picker {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .color-picker input[type="color"] {
        width: 40px;
        height: 40px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
      }

      .color-presets {
        display: flex;
        gap: 4px;
        flex-wrap: wrap;
      }

      .color-preset {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        cursor: pointer;
        border: 2px solid transparent;
        transition: all 0.2s ease;
      }

      .color-preset:hover {
        border-color: rgba(255, 255, 255, 0.3);
        transform: scale(1.1);
      }

      .usage-stats {
        margin-top: 24px;
        padding: 20px;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.05);
      }

      .usage-stats h4 {
        margin: 0 0 16px 0;
        font-size: 16px;
        color: var(--text-primary);
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
        gap: 16px;
      }

      .stat-item {
        text-align: center;
      }

      .stat-value {
        font-size: 20px;
        font-weight: 700;
        color: var(--glass-primary);
        margin-bottom: 4px;
      }

      .stat-label {
        font-size: 12px;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      @media (max-width: 768px) {
        .tags-controls {
          flex-direction: column;
          align-items: stretch;
        }

        .search-filters {
          flex-direction: column;
        }

        .tags-grid {
          grid-template-columns: 1fr;
        }

        .insights-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
    `;

    // Use StyleLoader if available, otherwise fallback to direct injection
    if (window.StyleLoader) {
      window.StyleLoader.injectStyles('tags-page-styles', tagsPageStyles);
    } else {
      // Fallback for when StyleLoader is not available
      if (!document.getElementById('tags-page-styles')) {
        const styleEl = document.createElement('style');
        styleEl.id = 'tags-page-styles';
        styleEl.textContent = tagsPageStyles;
        document.head.appendChild(styleEl);
      }
    }
  }

  async loadData() {
    try {
      this.tags = await window.apiClient.getTags();
      this.applyFilters();
    } catch (error) {
      console.error('Failed to load tags:', error);
      window.errorHandler.show('Failed to load tags');
    }
  }

  applyFilters() {
    let filtered = [...this.tags];

    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(tag => 
        tag.name.toLowerCase().includes(term) ||
        (tag.description && tag.description.toLowerCase().includes(term))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal, bVal;

      switch (this.sortBy) {
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case 'usage':
          aVal = (a.usageCount || 0);
          bVal = (b.usageCount || 0);
          break;
        case 'created':
          aVal = new Date(a.createdAt);
          bVal = new Date(b.createdAt);
          break;
        default:
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
      }

      if (this.sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    this.filteredTags = filtered;
  }

  renderTagsContent() {
    const container = document.getElementById('tags-content');

    if (this.filteredTags.length === 0) {
      if (this.searchTerm) {
        container.innerHTML = `
          <div class="empty-state">
            <h3>No tags found</h3>
            <p>Try adjusting your search criteria.</p>
            <button class="btn btn-secondary" onclick="this.closest('.tags-page').tagsPage.clearSearch()">
              Clear Search
            </button>
          </div>
        `;
      } else {
        container.innerHTML = `
          <div class="empty-state">
            <h3>No tags yet</h3>
            <p>Create your first tag to start organizing your content.</p>
            <button class="btn btn-primary" data-route="/tags/new">
              Create Tag
            </button>
          </div>
        `;
      }
      return;
    }

    container.innerHTML = `
      <div class="tags-grid">
        ${this.filteredTags.map(tag => this.renderTagCard(tag)).join('')}
      </div>
    `;
  }

  renderTagCard(tag) {
    const isSelected = this.selectedTags.has(tag.id);
    
    return `
      <div class="tag-card ${isSelected ? 'selected' : ''}" 
           onclick="this.closest('.tags-page').tagsPage.selectTag('${tag.id}', event)">
        <div class="tag-card-header">
          <div class="tag-checkbox ${isSelected ? 'checked' : ''}" 
               onclick="event.stopPropagation(); this.closest('.tags-page').tagsPage.toggleSelection('${tag.id}')">
          </div>
          <div class="tag-visual">
            <div class="tag-color" style="background: ${tag.color || '#6366f1'}"></div>
            ${tag.icon ? `<div class="tag-icon">${tag.icon}</div>` : ''}
            <div class="tag-name">${tag.name}</div>
          </div>
          <div class="tag-actions">
            <div class="tag-action" onclick="event.stopPropagation(); router.navigate('/tags/${tag.id}/edit')" title="Edit">
              ✎
            </div>
            <div class="tag-action" onclick="event.stopPropagation(); this.closest('.tags-page').tagsPage.deleteTag('${tag.id}')" title="Delete">
              ×
            </div>
          </div>
        </div>
        
        ${tag.description ? `<div class="tag-description">${tag.description}</div>` : ''}
        
        <div class="tag-stats">
          <div class="tag-usage">
            <div class="usage-item">${tag.taskCount || 0} tasks</div>
            <div class="usage-item">${tag.projectCount || 0} projects</div>
            <div class="usage-item">${tag.goalCount || 0} goals</div>
          </div>
          <div class="tag-total">${tag.usageCount || 0} total</div>
        </div>
      </div>
    `;
  }

  renderInsights() {
    const insightsGrid = document.getElementById('insights-grid');
    if (!insightsGrid) return;

    const totalTags = this.tags.length;
    const totalUsage = this.tags.reduce((sum, tag) => sum + (tag.usageCount || 0), 0);
    const mostUsedTag = this.tags.reduce((max, tag) => 
      (tag.usageCount || 0) > (max.usageCount || 0) ? tag : max, this.tags[0]);
    const unusedTags = this.tags.filter(tag => !tag.usageCount || tag.usageCount === 0).length;

    insightsGrid.innerHTML = `
      <div class="insight-card">
        <div class="insight-value">${totalTags}</div>
        <div class="insight-label">Total Tags</div>
      </div>
      <div class="insight-card">
        <div class="insight-value">${totalUsage}</div>
        <div class="insight-label">Total Usage</div>
      </div>
      <div class="insight-card">
        <div class="insight-value">${mostUsedTag ? mostUsedTag.usageCount || 0 : 0}</div>
        <div class="insight-label">Most Used (${mostUsedTag ? mostUsedTag.name : 'N/A'})</div>
      </div>
      <div class="insight-card">
        <div class="insight-value">${unusedTags}</div>
        <div class="insight-label">Unused Tags</div>
      </div>
    `;
  }

  // Event handlers
  handleSearch(value) {
    this.searchTerm = value;
    this.applyFilters();
    this.renderTagsContent();
  }

  handleSort(value) {
    const [sortBy, sortOrder] = value.split('_');
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
    this.applyFilters();
    this.renderTagsContent();
  }

  toggleUsageStats() {
    this.showUsageStats = !this.showUsageStats;
    const insightsSection = document.querySelector('.tags-insights');
    const toggleBtn = document.querySelector('.view-toggle-btn');
    
    if (insightsSection) {
      insightsSection.style.display = this.showUsageStats ? 'block' : 'none';
    }
    
    if (toggleBtn) {
      toggleBtn.classList.toggle('active', this.showUsageStats);
    }
  }

  selectTag(tagId, event) {
    // If clicking to edit, don't select
    if (!event.ctrlKey && !event.metaKey) {
      router.navigate(`/tags/${tagId}/edit`);
      return;
    }
    
    this.toggleSelection(tagId);
  }

  toggleSelection(tagId) {
    if (this.selectedTags.has(tagId)) {
      this.selectedTags.delete(tagId);
    } else {
      this.selectedTags.add(tagId);
    }
    
    this.updateSelectionUI();
  }

  updateSelectionUI() {
    const selectedActions = document.querySelector('.selected-actions');
    const selectedCount = document.querySelector('.selected-count');
    
    if (selectedActions) {
      selectedActions.style.display = this.selectedTags.size > 0 ? 'flex' : 'none';
    }
    
    if (selectedCount) {
      selectedCount.textContent = `${this.selectedTags.size} selected`;
    }
    
    // Update card selection states
    document.querySelectorAll('.tag-card').forEach((card, index) => {
      const tag = this.filteredTags[index];
      if (tag) {
        const isSelected = this.selectedTags.has(tag.id);
        card.classList.toggle('selected', isSelected);
        const checkbox = card.querySelector('.tag-checkbox');
        if (checkbox) {
          checkbox.classList.toggle('checked', isSelected);
        }
      }
    });
  }

  clearSelection() {
    this.selectedTags.clear();
    this.updateSelectionUI();
  }

  clearSearch() {
    this.searchTerm = '';
    document.querySelector('.search-input').value = '';
    this.applyFilters();
    this.renderTagsContent();
  }

  async deleteTag(tagId) {
    const tag = this.tags.find(t => t.id == tagId);
    if (!tag) return;
    
    if (tag.isSystem) {
      window.errorHandler.show('System tags cannot be deleted');
      return;
    }

    if (!confirm(`Delete tag "${tag.name}"? This will remove it from all associated items.`)) return;
    
    try {
      await window.apiClient.deleteTag(tagId);
      window.errorHandler.show('Tag deleted successfully!', 'success');
      this.loadData();
    } catch (error) {
      console.error('Failed to delete tag:', error);
      window.errorHandler.show('Failed to delete tag: ' + error.message);
    }
  }

  async deleteSelected() {
    if (this.selectedTags.size === 0) return;
    
    const systemTags = this.tags.filter(t => this.selectedTags.has(t.id) && t.isSystem);
    if (systemTags.length > 0) {
      window.errorHandler.show('Cannot delete system tags');
      return;
    }
    
    if (!confirm(`Delete ${this.selectedTags.size} selected tags? This will remove them from all associated items.`)) return;
    
    try {
      const promises = Array.from(this.selectedTags).map(id => window.apiClient.deleteTag(id));
      await Promise.all(promises);
      
      window.errorHandler.show(`${this.selectedTags.size} tags deleted successfully!`, 'success');
      this.selectedTags.clear();
      this.loadData();
    } catch (error) {
      console.error('Failed to delete tags:', error);
      window.errorHandler.show('Failed to delete some tags: ' + error.message);
    }
  }

  async mergeSelected() {
    if (this.selectedTags.size < 2) {
      window.errorHandler.show('Select at least 2 tags to merge');
      return;
    }
    
    const selectedTagsList = this.tags.filter(t => this.selectedTags.has(t.id));
    const targetTagName = prompt(`Enter name for merged tag (will replace ${selectedTagsList.map(t => t.name).join(', ')}):`);
    
    if (!targetTagName) return;
    
    try {
      await window.apiClient.mergeTags(Array.from(this.selectedTags), targetTagName);
      window.errorHandler.show('Tags merged successfully!', 'success');
      this.selectedTags.clear();
      this.loadData();
    } catch (error) {
      console.error('Failed to merge tags:', error);
      window.errorHandler.show('Failed to merge tags: ' + error.message);
    }
  }

  bulkActions() {
    // TODO: Implement bulk actions modal
    window.errorHandler.show('Bulk actions coming soon!', 'info');
  }
}

// Make TagsPage globally available
window.TagsPage = TagsPage;