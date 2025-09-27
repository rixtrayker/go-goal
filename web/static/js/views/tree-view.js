/**
 * Tree View Component
 * Provides hierarchical visualization for projects, goals, tasks, and sub-tasks
 */
class TreeView {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      expandable: true,
      selectable: true,
      draggable: false,
      showIcons: true,
      showCheckboxes: false,
      maxDepth: 10,
      indent: 24,
      ...options
    };
    
    this.data = [];
    this.selectedNodes = new Set();
    this.expandedNodes = new Set();
    this.draggedNode = null;
    
    this.init();
  }

  init() {
    this.container.className = 'tree-view';
    this.setupEventListeners();
    this.loadStyles();
  }

  loadStyles() {
    const treeViewStyles = `
      .tree-view {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-size: 14px;
        user-select: none;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        padding: 12px;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .tree-node {
        position: relative;
        margin: 2px 0;
      }

      .tree-node-content {
        display: flex;
        align-items: center;
        padding: 6px 8px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
        gap: 8px;
        position: relative;
      }

      .tree-node-content:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .tree-node-content.selected {
        background: rgba(99, 102, 241, 0.2);
        border: 1px solid rgba(99, 102, 241, 0.3);
      }

      .tree-node-content.dragging {
        opacity: 0.5;
        transform: scale(0.95);
      }

      .tree-node-content.drop-target {
        background: rgba(34, 197, 94, 0.2);
        border: 2px dashed rgba(34, 197, 94, 0.5);
      }

      .tree-node-expand {
        width: 16px;
        height: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border-radius: 3px;
        color: var(--text-secondary);
        font-size: 12px;
        transition: all 0.2s ease;
      }

      .tree-node-expand:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .tree-node-expand.expanded {
        transform: rotate(90deg);
      }

      .tree-node-expand.empty {
        visibility: hidden;
      }

      .tree-node-checkbox {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 3px;
        cursor: pointer;
        position: relative;
        transition: all 0.2s ease;
      }

      .tree-node-checkbox.checked {
        background: var(--glass-primary);
        border-color: var(--glass-primary);
      }

      .tree-node-checkbox.checked::after {
        content: '✓';
        position: absolute;
        top: -2px;
        left: 2px;
        color: white;
        font-size: 12px;
        font-weight: bold;
      }

      .tree-node-checkbox.indeterminate {
        background: rgba(99, 102, 241, 0.3);
        border-color: var(--glass-primary);
      }

      .tree-node-checkbox.indeterminate::after {
        content: '−';
        position: absolute;
        top: -2px;
        left: 4px;
        color: var(--glass-primary);
        font-size: 12px;
        font-weight: bold;
      }

      .tree-node-icon {
        width: 18px;
        height: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        color: var(--text-secondary);
      }

      .tree-node-label {
        flex: 1;
        min-width: 0;
        color: var(--text-primary);
        font-weight: 500;
      }

      .tree-node-badge {
        background: rgba(255, 255, 255, 0.1);
        color: var(--text-secondary);
        padding: 2px 6px;
        border-radius: 10px;
        font-size: 11px;
        font-weight: 600;
        margin-left: 8px;
      }

      .tree-node-status {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-left: 8px;
      }

      .tree-node-status.active { background: #10b981; }
      .tree-node-status.pending { background: #f59e0b; }
      .tree-node-status.completed { background: #6366f1; }
      .tree-node-status.cancelled { background: #ef4444; }

      .tree-node-actions {
        opacity: 0;
        display: flex;
        gap: 4px;
        margin-left: 8px;
        transition: opacity 0.2s ease;
      }

      .tree-node-content:hover .tree-node-actions {
        opacity: 1;
      }

      .tree-node-action {
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        cursor: pointer;
        color: var(--text-secondary);
        font-size: 12px;
        transition: all 0.2s ease;
      }

      .tree-node-action:hover {
        background: rgba(255, 255, 255, 0.1);
        color: var(--text-primary);
      }

      .tree-node-children {
        margin-left: var(--indent, 24px);
        position: relative;
      }

      .tree-node-children::before {
        content: '';
        position: absolute;
        left: -12px;
        top: 0;
        bottom: 0;
        width: 1px;
        background: rgba(255, 255, 255, 0.1);
      }

      .tree-node-children.collapsed {
        display: none;
      }

      .tree-loading {
        padding: 20px;
        text-align: center;
        color: var(--text-secondary);
      }

      .tree-empty {
        padding: 40px 20px;
        text-align: center;
        color: var(--text-secondary);
      }

      .tree-empty-icon {
        font-size: 48px;
        margin-bottom: 16px;
        opacity: 0.5;
      }

      .tree-search {
        margin-bottom: 16px;
        position: relative;
      }

      .tree-search-input {
        width: 100%;
        padding: 8px 12px 8px 36px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.05);
        color: var(--text-primary);
        font-size: 14px;
      }

      .tree-search-input:focus {
        outline: none;
        border-color: var(--glass-primary);
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
      }

      .tree-search-icon {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--text-secondary);
        font-size: 14px;
      }

      .tree-node-highlight {
        background: rgba(255, 235, 59, 0.3);
        border-radius: 3px;
        padding: 0 2px;
      }

      /* Context menu styles */
      .tree-context-menu {
        position: fixed;
        background: rgba(0, 0, 0, 0.9);
        backdrop-filter: blur(10px);
        border-radius: 8px;
        padding: 8px 0;
        min-width: 150px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        display: none;
      }

      .tree-context-menu-item {
        padding: 8px 16px;
        cursor: pointer;
        color: white;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: background 0.2s ease;
      }

      .tree-context-menu-item:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .tree-context-menu-item.disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .tree-context-menu-separator {
        height: 1px;
        background: rgba(255, 255, 255, 0.1);
        margin: 4px 0;
      }

      @keyframes tree-node-insert {
        from {
          opacity: 0;
          transform: translateX(-10px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      .tree-node.inserted {
        animation: tree-node-insert 0.3s ease;
      }
    `;

    // Use StyleLoader if available, otherwise fallback to direct injection
    if (window.StyleLoader) {
      window.StyleLoader.injectStyles('tree-view-styles', treeViewStyles);
    } else {
      // Fallback for when StyleLoader is not available
      if (!document.getElementById('tree-view-styles')) {
        const styleEl = document.createElement('style');
        styleEl.id = 'tree-view-styles';
        styleEl.textContent = treeViewStyles;
        document.head.appendChild(styleEl);
      }
    }
  }

  setupEventListeners() {
    this.container.addEventListener('click', this.handleClick.bind(this));
    this.container.addEventListener('contextmenu', this.handleContextMenu.bind(this));
    
    if (this.options.draggable) {
      this.container.addEventListener('dragstart', this.handleDragStart.bind(this));
      this.container.addEventListener('dragover', this.handleDragOver.bind(this));
      this.container.addEventListener('drop', this.handleDrop.bind(this));
      this.container.addEventListener('dragend', this.handleDragEnd.bind(this));
    }
  }

  setData(data) {
    this.data = this.normalizeData(data);
    this.render();
  }

  normalizeData(data) {
    // Convert flat array to tree structure if needed
    if (Array.isArray(data) && data.length > 0 && !data[0].children) {
      return this.buildTreeFromFlat(data);
    }
    return data;
  }

  buildTreeFromFlat(items) {
    const lookup = {};
    const tree = [];

    // Create lookup table
    items.forEach(item => {
      lookup[item.id] = { ...item, children: [] };
    });

    // Build tree structure
    items.forEach(item => {
      if (item.parentId && lookup[item.parentId]) {
        lookup[item.parentId].children.push(lookup[item.id]);
      } else {
        tree.push(lookup[item.id]);
      }
    });

    return tree;
  }

  render() {
    if (!this.data || this.data.length === 0) {
      this.renderEmpty();
      return;
    }

    let html = '';
    
    if (this.options.searchable) {
      html += this.renderSearch();
    }

    html += '<div class="tree-nodes">';
    html += this.renderNodes(this.data);
    html += '</div>';

    this.container.innerHTML = html;
  }

  renderSearch() {
    return `
      <div class="tree-search">
        <div class="tree-search-icon">🔍</div>
        <input 
          type="text" 
          class="tree-search-input" 
          placeholder="Search..." 
          oninput="this.closest('.tree-view').treeView.handleSearch(this.value)"
        />
      </div>
    `;
  }

  renderNodes(nodes, level = 0) {
    if (level > this.options.maxDepth) return '';

    return nodes.map(node => this.renderNode(node, level)).join('');
  }

  renderNode(node, level = 0) {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = this.expandedNodes.has(node.id);
    const isSelected = this.selectedNodes.has(node.id);
    const indent = level * this.options.indent;

    let html = `
      <div class="tree-node" data-id="${node.id}" data-level="${level}">
        <div class="tree-node-content ${isSelected ? 'selected' : ''}" 
             style="padding-left: ${indent}px"
             ${this.options.draggable ? 'draggable="true"' : ''}>
    `;

    // Expand/collapse button
    if (this.options.expandable) {
      html += `
        <div class="tree-node-expand ${hasChildren ? (isExpanded ? 'expanded' : '') : 'empty'}" 
             data-action="toggle">
          ${hasChildren ? '▶' : ''}
        </div>
      `;
    }

    // Checkbox
    if (this.options.showCheckboxes) {
      const checkState = this.getCheckboxState(node);
      html += `
        <div class="tree-node-checkbox ${checkState}" 
             data-action="check"></div>
      `;
    }

    // Icon
    if (this.options.showIcons) {
      html += `
        <div class="tree-node-icon">
          ${this.getNodeIcon(node)}
        </div>
      `;
    }

    // Label
    html += `
      <div class="tree-node-label" data-action="select">
        ${this.highlightSearchTerm(node.label || node.title || node.name)}
      </div>
    `;

    // Badge (count, priority, etc.)
    if (node.badge) {
      html += `<div class="tree-node-badge">${node.badge}</div>`;
    }

    // Status indicator
    if (node.status) {
      html += `<div class="tree-node-status ${node.status}"></div>`;
    }

    // Actions
    html += this.renderNodeActions(node);

    html += '</div>';

    // Children
    if (hasChildren && isExpanded) {
      html += `
        <div class="tree-node-children" style="--indent: ${this.options.indent}px">
          ${this.renderNodes(node.children, level + 1)}
        </div>
      `;
    }

    html += '</div>';

    return html;
  }

  renderNodeActions(node) {
    const actions = this.getNodeActions(node);
    if (!actions.length) return '';

    return `
      <div class="tree-node-actions">
        ${actions.map(action => `
          <div class="tree-node-action" 
               data-action="${action.action}" 
               title="${action.title}">
            ${action.icon}
          </div>
        `).join('')}
      </div>
    `;
  }

  getNodeActions(node) {
    const actions = [];

    if (this.options.actions?.add) {
      actions.push({
        action: 'add',
        icon: '+',
        title: 'Add child'
      });
    }

    if (this.options.actions?.edit) {
      actions.push({
        action: 'edit',
        icon: '✎',
        title: 'Edit'
      });
    }

    if (this.options.actions?.delete) {
      actions.push({
        action: 'delete',
        icon: '×',
        title: 'Delete'
      });
    }

    return actions;
  }

  renderEmpty() {
    this.container.innerHTML = `
      <div class="tree-empty">
        <div class="tree-empty-icon">🌳</div>
        <div>No items to display</div>
      </div>
    `;
  }

  getNodeIcon(node) {
    if (node.icon) return node.icon;

    const typeIcons = {
      project: '📁',
      goal: '🎯',
      task: '✓',
      subtask: '→',
      note: '📝',
      context: '🌈',
      tag: '🏷️'
    };

    return typeIcons[node.type] || '📄';
  }

  getCheckboxState(node) {
    // Implement checkbox state logic
    if (node.checked) return 'checked';
    if (node.indeterminate) return 'indeterminate';
    return '';
  }

  highlightSearchTerm(text) {
    if (!this.searchTerm) return text;
    
    const regex = new RegExp(`(${this.searchTerm})`, 'gi');
    return text.replace(regex, '<span class="tree-node-highlight">$1</span>');
  }

  handleClick(event) {
    const action = event.target.dataset.action;
    const nodeEl = event.target.closest('.tree-node');
    
    if (!nodeEl) return;

    const nodeId = nodeEl.dataset.id;
    const node = this.findNode(nodeId);

    switch (action) {
      case 'toggle':
        this.toggleNode(nodeId);
        break;
      case 'select':
        this.selectNode(nodeId, event.ctrlKey || event.metaKey);
        break;
      case 'check':
        this.checkNode(nodeId);
        break;
      case 'add':
        this.emit('add', { node, parent: node });
        break;
      case 'edit':
        this.emit('edit', { node });
        break;
      case 'delete':
        this.emit('delete', { node });
        break;
    }
  }

  handleContextMenu(event) {
    event.preventDefault();
    
    const nodeEl = event.target.closest('.tree-node');
    if (!nodeEl) return;

    const nodeId = nodeEl.dataset.id;
    const node = this.findNode(nodeId);

    this.showContextMenu(event.clientX, event.clientY, node);
  }

  handleSearch(searchTerm) {
    this.searchTerm = searchTerm.toLowerCase();
    
    if (this.searchTerm) {
      // Expand all nodes that contain search term
      this.expandSearchResults();
    }
    
    this.render();
  }

  expandSearchResults() {
    const expandNode = (nodes) => {
      nodes.forEach(node => {
        const label = (node.label || node.title || node.name || '').toLowerCase();
        if (label.includes(this.searchTerm)) {
          // Expand all parent nodes
          let current = node;
          while (current) {
            this.expandedNodes.add(current.id);
            current = this.findParentNode(current.id);
          }
        }
        
        if (node.children) {
          expandNode(node.children);
        }
      });
    };

    expandNode(this.data);
  }

  toggleNode(nodeId) {
    if (this.expandedNodes.has(nodeId)) {
      this.expandedNodes.delete(nodeId);
    } else {
      this.expandedNodes.add(nodeId);
    }
    
    this.render();
    this.emit('toggle', { nodeId, expanded: this.expandedNodes.has(nodeId) });
  }

  selectNode(nodeId, multiSelect = false) {
    if (!multiSelect) {
      this.selectedNodes.clear();
    }
    
    if (this.selectedNodes.has(nodeId)) {
      this.selectedNodes.delete(nodeId);
    } else {
      this.selectedNodes.add(nodeId);
    }
    
    this.render();
    this.emit('select', { 
      nodeId, 
      selected: Array.from(this.selectedNodes),
      node: this.findNode(nodeId)
    });
  }

  checkNode(nodeId) {
    const node = this.findNode(nodeId);
    if (!node) return;

    node.checked = !node.checked;
    
    // Update children
    if (node.children) {
      this.setChildrenChecked(node.children, node.checked);
    }
    
    // Update parent
    this.updateParentChecked(nodeId);
    
    this.render();
    this.emit('check', { nodeId, checked: node.checked, node });
  }

  setChildrenChecked(children, checked) {
    children.forEach(child => {
      child.checked = checked;
      if (child.children) {
        this.setChildrenChecked(child.children, checked);
      }
    });
  }

  updateParentChecked(nodeId) {
    const parent = this.findParentNode(nodeId);
    if (!parent || !parent.children) return;

    const checkedCount = parent.children.filter(child => child.checked).length;
    const totalCount = parent.children.length;

    if (checkedCount === 0) {
      parent.checked = false;
      parent.indeterminate = false;
    } else if (checkedCount === totalCount) {
      parent.checked = true;
      parent.indeterminate = false;
    } else {
      parent.checked = false;
      parent.indeterminate = true;
    }

    this.updateParentChecked(parent.id);
  }

  findNode(nodeId, nodes = this.data) {
    for (const node of nodes) {
      if (node.id == nodeId) return node;
      if (node.children) {
        const found = this.findNode(nodeId, node.children);
        if (found) return found;
      }
    }
    return null;
  }

  findParentNode(nodeId, nodes = this.data, parent = null) {
    for (const node of nodes) {
      if (node.id == nodeId) return parent;
      if (node.children) {
        const found = this.findParentNode(nodeId, node.children, node);
        if (found) return found;
      }
    }
    return null;
  }

  showContextMenu(x, y, node) {
    // Remove existing context menu
    const existing = document.querySelector('.tree-context-menu');
    if (existing) existing.remove();

    const menu = document.createElement('div');
    menu.className = 'tree-context-menu';
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
    menu.style.display = 'block';

    const menuItems = this.getContextMenuItems(node);
    menu.innerHTML = menuItems.map(item => {
      if (item.separator) {
        return '<div class="tree-context-menu-separator"></div>';
      }
      return `
        <div class="tree-context-menu-item ${item.disabled ? 'disabled' : ''}" 
             data-action="${item.action}">
          <span>${item.icon}</span>
          <span>${item.label}</span>
        </div>
      `;
    }).join('');

    // Handle menu clicks
    menu.addEventListener('click', (e) => {
      const item = e.target.closest('.tree-context-menu-item');
      if (item && !item.classList.contains('disabled')) {
        const action = item.dataset.action;
        this.emit(action, { node });
        menu.remove();
      }
    });

    // Close menu on outside click
    setTimeout(() => {
      document.addEventListener('click', () => menu.remove(), { once: true });
    }, 0);

    document.body.appendChild(menu);
  }

  getContextMenuItems(node) {
    return [
      { icon: '👀', label: 'View', action: 'view' },
      { icon: '✎', label: 'Edit', action: 'edit' },
      { separator: true },
      { icon: '+', label: 'Add Child', action: 'add' },
      { icon: '📋', label: 'Duplicate', action: 'duplicate' },
      { separator: true },
      { icon: '🗑️', label: 'Delete', action: 'delete' }
    ];
  }

  // Drag and drop handlers
  handleDragStart(event) {
    const nodeEl = event.target.closest('.tree-node');
    if (!nodeEl) return;

    this.draggedNode = nodeEl.dataset.id;
    nodeEl.querySelector('.tree-node-content').classList.add('dragging');
    
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', this.draggedNode);
  }

  handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';

    const nodeEl = event.target.closest('.tree-node');
    if (nodeEl && nodeEl.dataset.id !== this.draggedNode) {
      // Remove existing drop targets
      this.container.querySelectorAll('.drop-target').forEach(el => {
        el.classList.remove('drop-target');
      });
      
      nodeEl.querySelector('.tree-node-content').classList.add('drop-target');
    }
  }

  handleDrop(event) {
    event.preventDefault();
    
    const targetEl = event.target.closest('.tree-node');
    if (!targetEl) return;

    const targetId = targetEl.dataset.id;
    const sourceId = this.draggedNode;

    if (sourceId && targetId && sourceId !== targetId) {
      this.emit('move', {
        sourceId,
        targetId,
        sourceNode: this.findNode(sourceId),
        targetNode: this.findNode(targetId)
      });
    }
  }

  handleDragEnd(event) {
    // Clean up drag state
    this.container.querySelectorAll('.dragging, .drop-target').forEach(el => {
      el.classList.remove('dragging', 'drop-target');
    });
    
    this.draggedNode = null;
  }

  // Public API
  expandAll() {
    const collectIds = (nodes) => {
      const ids = [];
      nodes.forEach(node => {
        ids.push(node.id);
        if (node.children) {
          ids.push(...collectIds(node.children));
        }
      });
      return ids;
    };

    this.expandedNodes = new Set(collectIds(this.data));
    this.render();
  }

  collapseAll() {
    this.expandedNodes.clear();
    this.render();
  }

  getSelected() {
    return Array.from(this.selectedNodes).map(id => this.findNode(id));
  }

  getChecked() {
    const collectChecked = (nodes) => {
      const checked = [];
      nodes.forEach(node => {
        if (node.checked) checked.push(node);
        if (node.children) {
          checked.push(...collectChecked(node.children));
        }
      });
      return checked;
    };

    return collectChecked(this.data);
  }

  addNode(parentId, nodeData) {
    const parent = parentId ? this.findNode(parentId) : null;
    const newNode = {
      id: Date.now().toString(),
      ...nodeData
    };

    if (parent) {
      if (!parent.children) parent.children = [];
      parent.children.push(newNode);
      this.expandedNodes.add(parent.id);
    } else {
      this.data.push(newNode);
    }

    this.render();
    this.emit('nodeAdded', { node: newNode, parent });
  }

  updateNode(nodeId, updates) {
    const node = this.findNode(nodeId);
    if (node) {
      Object.assign(node, updates);
      this.render();
      this.emit('nodeUpdated', { node });
    }
  }

  removeNode(nodeId) {
    const removeFromArray = (nodes, id) => {
      const index = nodes.findIndex(node => node.id == id);
      if (index !== -1) {
        const removed = nodes.splice(index, 1)[0];
        return removed;
      }
      
      for (const node of nodes) {
        if (node.children) {
          const removed = removeFromArray(node.children, id);
          if (removed) return removed;
        }
      }
      
      return null;
    };

    const removed = removeFromArray(this.data, nodeId);
    if (removed) {
      this.selectedNodes.delete(nodeId);
      this.expandedNodes.delete(nodeId);
      this.render();
      this.emit('nodeRemoved', { node: removed });
    }
  }

  // Event system
  emit(event, data) {
    if (this.options.on && this.options.on[event]) {
      this.options.on[event](data);
    }
    
    // Also emit as DOM event
    this.container.dispatchEvent(new CustomEvent(`tree-${event}`, { detail: data }));
  }
}

// Make TreeView globally available
window.TreeView = TreeView;

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TreeView;
}