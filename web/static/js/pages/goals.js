// Simple mock implementation for testing purposes
// This is a minimal implementation to make tests runnable

class GoalsPage {
  constructor(container) {
    this.container = container;
    this.currentView = 'list';
    this.goals = [];
    this.filteredGoals = [];
    this.searchTerm = '';
    this.filterStatus = 'all';
    this.filterPriority = 'all';
    this.filterProject = 'all';
    this.sortBy = 'updated_at';
    this.sortOrder = 'desc';
  }

  async render(params = {}) {
    if (params.action === 'new') {
      return this.renderGoalForm();
    } else if (params.id && params.action === 'edit') {
      return this.renderGoalEditForm(params.id);
    } else if (params.id) {
      return this.renderGoalDetail(params.id);
    } else {
      return this.renderGoalsList();
    }
  }

  async renderGoalsList() {
    await this.loadGoals();
    this.container.innerHTML = `
      <div class="goals-page">
        <h1>Goals</h1>
        <p>${this.goals.length} goals</p>
        <button>New Goal</button>
        <input class="search-input" placeholder="Search...">
        <select class="filter-select"></select>
        <select class="sort-select"></select>
        <div class="view-switcher">
          <button>List</button>
          <button>Grid</button>
          <button>Kanban</button>
        </div>
        <div class="goals-content"></div>
      </div>
    `;
    
    // Mock style injection
    if (window.StyleLoader) {
      window.StyleLoader.injectStyles('goals-page-styles', '/* mock styles */');
    }
    
    // Set page reference
    const pageElement = this.container.querySelector('.goals-page');
    if (pageElement) {
      pageElement.goalsPage = this;
    }
  }

  async renderGoalForm() {
    await Promise.all([
      window.apiClient.getProjects(),
      window.apiClient.getFlows()
    ]);
    
    this.container.innerHTML = `
      <div class="goal-form-page">
        <h1>Create New Goal</h1>
        <form id="goalForm">
          <input name="title" placeholder="Title">
          <textarea name="description" placeholder="Description"></textarea>
          <select name="status"></select>
          <select name="priority"></select>
          <button type="submit">Create Goal</button>
        </form>
      </div>
    `;
    
    this.setupForm();
  }

  async renderGoalEditForm(id) {
    const goal = await window.apiClient.getGoal(id);
    await Promise.all([
      window.apiClient.getProjects(),
      window.apiClient.getFlows()
    ]);
    
    this.container.innerHTML = `
      <div class="goal-form-page">
        <h1>Edit Goal</h1>
        <form id="goalForm">
          <input name="title" value="${goal.title}">
          <button type="submit">Update Goal</button>
        </form>
      </div>
    `;
  }

  async renderGoalDetail(id) {
    try {
      const goal = await window.apiClient.getGoal(id);
      this.container.innerHTML = `
        <div class="goal-detail">
          <h1>${goal.title}</h1>
          <p>${goal.description || ''}</p>
        </div>
      `;
    } catch (error) {
      this.container.innerHTML = `
        <div class="error">
          <h1>Goal not found</h1>
          <a href="/goals">Back to Goals</a>
        </div>
      `;
    }
  }

  async loadGoals() {
    try {
      this.goals = await window.apiClient.getGoals();
      this.applyFilters();
    } catch (error) {
      if (window.errorHandler) {
        window.errorHandler.show('Failed to load goals');
      }
    }
  }

  applyFilters() {
    let filtered = [...this.goals];
    
    // Apply search filter
    if (this.searchTerm) {
      filtered = filtered.filter(goal => 
        goal.title.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (this.filterStatus !== 'all') {
      filtered = filtered.filter(goal => goal.status === this.filterStatus);
    }
    
    // Apply priority filter
    if (this.filterPriority !== 'all') {
      filtered = filtered.filter(goal => goal.priority === this.filterPriority);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aVal = a[this.sortBy];
      let bVal = b[this.sortBy];
      
      if (this.sortBy === 'title') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (this.sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    
    this.filteredGoals = filtered;
  }

  renderGoalCard(goal, view) {
    const priority = goal.priority || 'medium';
    return `
      <div class="goal-card ${view}-view status-${goal.status} priority-${priority}">
        <h3>${goal.title}</h3>
        <p>${goal.description || ''}</p>
        ${goal.progress ? `<div class="progress">${goal.progress}%</div>` : ''}
        ${goal.tags ? goal.tags.map(tag => `<span class="tag">${tag.name}</span>`).join('') : ''}
      </div>
    `;
  }

  handleSearch(term) {
    this.searchTerm = term;
    this.renderGoalsContent();
  }

  handleStatusFilter(status) {
    this.filterStatus = status;
    this.renderGoalsContent();
  }

  switchView(view) {
    this.currentView = view;
    this.renderGoalsContent();
  }

  renderGoalsContent() {
    this.applyFilters();
    // Mock implementation - just apply filters
  }

  setupForm() {
    const form = document.getElementById('goalForm');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitButton = e.target.querySelector('button[type="submit"]');
        if (submitButton) {
          submitButton.disabled = true;
          submitButton.textContent = 'Creating...';
        }
        
        try {
          const formData = new FormData(e.target);
          const goalData = {
            title: formData.get('title'),
            description: formData.get('description'),
            status: formData.get('status') || 'active',
            priority: formData.get('priority') || 'medium',
            projectId: null,
            contextId: null,
            tags: []
          };
          
          const goal = await window.apiClient.createGoal(goalData);
          window.router.navigate(`/goals/${goal.id}`);
        } catch (error) {
          if (window.errorHandler) {
            window.errorHandler.show(`Failed to create goal: ${error.message}`);
          }
        } finally {
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = 'Create Goal';
          }
        }
      });
    }
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays === -1) return 'tomorrow';
    if (diffDays > 0) return `${diffDays} days ago`;
    return `in ${Math.abs(diffDays)} days`;
  }

  clearFilters() {
    this.searchTerm = '';
    this.filterStatus = 'all';
    this.filterPriority = 'all';
    
    // Update UI elements
    const searchInput = this.container.querySelector('.search-input');
    const filterSelect = this.container.querySelector('.filter-select');
    const prioritySelect = this.container.querySelector('.priority-select');
    const sortSelect = this.container.querySelector('.sort-select');
    
    if (searchInput) searchInput.value = '';
    if (filterSelect) filterSelect.value = 'all';
    if (prioritySelect) prioritySelect.value = 'all';
    if (sortSelect) sortSelect.value = 'updated_at';
    
    this.renderGoalsContent();
  }
}

// Export for Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GoalsPage };
}