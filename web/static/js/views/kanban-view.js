/**
 * Kanban Board Component
 * Provides drag-and-drop task management with customizable columns
 */
class KanbanView {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      columns: [
        { id: 'pending', title: 'To Do', color: '#f59e0b' },
        { id: 'in_progress', title: 'In Progress', color: '#3b82f6' },
        { id: 'review', title: 'Review', color: '#8b5cf6' },
        { id: 'completed', title: 'Done', color: '#10b981' }
      ],
      allowAddColumn: true,
      allowEditColumn: true,
      allowDeleteColumn: true,
      cardTemplate: null,
      maxCardsPerColumn: null,
      swimlanes: false,
      ...options
    };
    
    this.data = [];
    this.draggedCard = null;
    this.draggedColumn = null;
    
    this.init();
  }

  init() {
    this.container.className = 'kanban-board';
    this.setupEventListeners();
    this.loadStyles();
  }

  loadStyles() {
    const kanbanViewStyles = `
      .kanban-board {
        display: flex;
        gap: 16px;
        padding: 16px;
        overflow-x: auto;
        height: 100%;
        min-height: 500px;
        background: rgba(255, 255, 255, 0.02);
        border-radius: 12px;
      }

      .kanban-column {
        flex: 0 0 280px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        flex-direction: column;
        max-height: 100%;
        position: relative;
        transition: all 0.3s ease;
      }

      .kanban-column:hover {
        border-color: rgba(255, 255, 255, 0.2);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .kanban-column.drag-over {
        background: rgba(34, 197, 94, 0.1);
        border-color: #10b981;
        transform: scale(1.02);
      }

      .kanban-column.dragging {
        opacity: 0.5;
        transform: scale(0.95);
      }

      .kanban-column-header {
        padding: 16px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: grab;
        user-select: none;
      }

      .kanban-column-header:active {
        cursor: grabbing;
      }

      .kanban-column-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        color: var(--text-primary);
      }

      .kanban-column-color {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .kanban-column-count {
        background: rgba(255, 255, 255, 0.1);
        color: var(--text-secondary);
        padding: 2px 8px;
        border-radius: 10px;
        font-size: 12px;
        font-weight: 600;
        margin-left: 8px;
      }

      .kanban-column-actions {
        display: flex;
        gap: 4px;
        opacity: 0;
        transition: opacity 0.2s ease;
      }

      .kanban-column:hover .kanban-column-actions {
        opacity: 1;
      }

      .kanban-column-action {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        cursor: pointer;
        color: var(--text-secondary);
        font-size: 14px;
        transition: all 0.2s ease;
      }

      .kanban-column-action:hover {
        background: rgba(255, 255, 255, 0.1);
        color: var(--text-primary);
      }

      .kanban-column-body {
        flex: 1;
        padding: 8px 16px 16px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .kanban-column-body::-webkit-scrollbar {
        width: 6px;
      }

      .kanban-column-body::-webkit-scrollbar-track {
        background: transparent;
      }

      .kanban-column-body::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 3px;
      }

      .kanban-card {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 8px;
        padding: 12px;
        cursor: grab;
        transition: all 0.3s ease;
        position: relative;
        user-select: none;
      }

      .kanban-card:hover {
        background: rgba(255, 255, 255, 0.15);
        border-color: rgba(255, 255, 255, 0.25);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .kanban-card:active {
        cursor: grabbing;
      }

      .kanban-card.dragging {
        opacity: 0.5;
        transform: rotate(5deg) scale(0.95);
        z-index: 1000;
      }

      .kanban-card.drop-preview {
        border: 2px dashed rgba(99, 102, 241, 0.5);
        background: rgba(99, 102, 241, 0.1);
        opacity: 0.7;
      }

      .kanban-card-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        margin-bottom: 8px;
      }

      .kanban-card-title {
        font-weight: 600;
        color: var(--text-primary);
        font-size: 14px;
        line-height: 1.3;
        flex: 1;
        min-width: 0;
      }

      .kanban-card-priority {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-left: 8px;
        flex-shrink: 0;
      }

      .kanban-card-priority.high { background: #ef4444; }
      .kanban-card-priority.medium { background: #f59e0b; }
      .kanban-card-priority.low { background: #10b981; }

      .kanban-card-description {
        color: var(--text-secondary);
        font-size: 12px;
        line-height: 1.4;
        margin-bottom: 8px;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .kanban-card-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }

      .kanban-card-tags {
        display: flex;
        gap: 4px;
        flex-wrap: wrap;
        flex: 1;
      }

      .kanban-card-tag {
        background: rgba(99, 102, 241, 0.2);
        color: rgba(99, 102, 241, 1);
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 10px;
        font-weight: 600;
        border: 1px solid rgba(99, 102, 241, 0.3);
      }

      .kanban-card-assignee {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: var(--glass-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 10px;
        font-weight: 600;
        border: 2px solid rgba(255, 255, 255, 0.2);
      }

      .kanban-card-due-date {
        font-size: 10px;
        color: var(--text-muted);
        background: rgba(255, 255, 255, 0.05);
        padding: 2px 6px;
        border-radius: 4px;
      }

      .kanban-card-due-date.overdue {
        background: rgba(239, 68, 68, 0.2);
        color: #ef4444;
      }

      .kanban-card-due-date.due-soon {
        background: rgba(245, 158, 11, 0.2);
        color: #f59e0b;
      }

      .kanban-add-card {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 12px;
        border: 2px dashed rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 14px;
        margin-top: 8px;
      }

      .kanban-add-card:hover {
        border-color: rgba(255, 255, 255, 0.4);
        color: var(--text-primary);
        background: rgba(255, 255, 255, 0.05);
      }

      .kanban-add-column {
        flex: 0 0 200px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px dashed rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        color: var(--text-secondary);
        font-size: 16px;
        gap: 8px;
      }

      .kanban-add-column:hover {
        border-color: rgba(255, 255, 255, 0.4);
        color: var(--text-primary);
        background: rgba(255, 255, 255, 0.05);
      }

      .kanban-card-quick-actions {
        position: absolute;
        top: 8px;
        right: 8px;
        display: flex;
        gap: 4px;
        opacity: 0;
        transition: opacity 0.2s ease;
      }

      .kanban-card:hover .kanban-card-quick-actions {
        opacity: 1;
      }

      .kanban-card-quick-action {
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.5);
        border-radius: 4px;
        cursor: pointer;
        color: white;
        font-size: 12px;
        transition: all 0.2s ease;
      }

      .kanban-card-quick-action:hover {
        background: rgba(0, 0, 0, 0.7);
        transform: scale(1.1);
      }

      /* Column edit modal */
      .kanban-column-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(5px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }

      .kanban-column-modal-content {
        background: rgba(0, 0, 0, 0.9);
        backdrop-filter: blur(20px);
        border-radius: 16px;
        padding: 24px;
        width: 90%;
        max-width: 400px;
        border: 1px solid rgba(255, 255, 255, 0.2);
      }

      .kanban-column-modal h3 {
        margin-bottom: 16px;
        color: var(--text-primary);
      }

      .kanban-column-modal .form-group {
        margin-bottom: 16px;
      }

      .kanban-column-modal label {
        display: block;
        margin-bottom: 4px;
        color: var(--text-secondary);
        font-size: 14px;
      }

      .kanban-column-modal input {
        width: 100%;
        padding: 8px 12px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        color: var(--text-primary);
      }

      .kanban-column-modal input:focus {
        outline: none;
        border-color: var(--glass-primary);
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
      }

      .kanban-column-modal-actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
        margin-top: 20px;
      }

      /* Loading and empty states */
      .kanban-loading {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 200px;
        color: var(--text-secondary);
        gap: 12px;
      }

      .kanban-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 300px;
        color: var(--text-secondary);
        text-align: center;
      }

      .kanban-empty-icon {
        font-size: 48px;
        margin-bottom: 16px;
        opacity: 0.5;
      }

      /* Animations */
      @keyframes card-insert {
        from {
          opacity: 0;
          transform: translateY(-10px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      .kanban-card.inserted {
        animation: card-insert 0.3s ease;
      }

      @keyframes column-insert {
        from {
          opacity: 0;
          transform: translateX(-20px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateX(0) scale(1);
        }
      }

      .kanban-column.inserted {
        animation: column-insert 0.4s ease;
      }

      /* Mobile responsive */
      @media (max-width: 768px) {
        .kanban-board {
          flex-direction: column;
          height: auto;
          min-height: auto;
        }

        .kanban-column {
          flex: none;
          width: 100%;
          max-height: 400px;
        }

        .kanban-add-column {
          flex: none;
          height: 60px;
        }
      }
    `;

    // Use StyleLoader if available, otherwise fallback to direct injection
    if (window.StyleLoader) {
      window.StyleLoader.injectStyles('kanban-view-styles', kanbanViewStyles);
    } else {
      // Fallback for when StyleLoader is not available
      if (!document.getElementById('kanban-view-styles')) {
        const styleEl = document.createElement('style');
        styleEl.id = 'kanban-view-styles';
        styleEl.textContent = kanbanViewStyles;
        document.head.appendChild(styleEl);
      }
    }
  }

  setupEventListeners() {
    this.container.addEventListener('click', this.handleClick.bind(this));
    this.container.addEventListener('dragstart', this.handleDragStart.bind(this));
    this.container.addEventListener('dragover', this.handleDragOver.bind(this));
    this.container.addEventListener('drop', this.handleDrop.bind(this));
    this.container.addEventListener('dragend', this.handleDragEnd.bind(this));
    this.container.addEventListener('dragenter', this.handleDragEnter.bind(this));
    this.container.addEventListener('dragleave', this.handleDragLeave.bind(this));
  }

  setData(data) {
    this.data = Array.isArray(data) ? data : [];
    this.render();
  }

  setColumns(columns) {
    this.options.columns = columns;
    this.render();
  }

  render() {
    if (!this.options.columns || this.options.columns.length === 0) {
      this.renderEmpty();
      return;
    }

    let html = '';

    // Render columns
    this.options.columns.forEach(column => {
      html += this.renderColumn(column);
    });

    // Add column button
    if (this.options.allowAddColumn) {
      html += this.renderAddColumn();
    }

    this.container.innerHTML = html;
  }

  renderColumn(column) {
    const cards = this.getColumnCards(column.id);
    const cardCount = cards.length;

    return `
      <div class="kanban-column" data-column-id="${column.id}" draggable="true">
        <div class="kanban-column-header">
          <div class="kanban-column-title">
            <div class="kanban-column-color" style="background-color: ${column.color}"></div>
            <span>${column.title}</span>
            <div class="kanban-column-count">${cardCount}</div>
          </div>
          <div class="kanban-column-actions">
            ${this.options.allowEditColumn ? `
              <div class="kanban-column-action" data-action="edit-column" title="Edit Column">
                ✎
              </div>
            ` : ''}
            ${this.options.allowDeleteColumn ? `
              <div class="kanban-column-action" data-action="delete-column" title="Delete Column">
                ×
              </div>
            ` : ''}
          </div>
        </div>
        <div class="kanban-column-body" data-column-id="${column.id}">
          ${cards.map(card => this.renderCard(card)).join('')}
          <div class="kanban-add-card" data-action="add-card" data-column-id="${column.id}">
            <span>+</span>
            <span>Add a card</span>
          </div>
        </div>
      </div>
    `;
  }

  renderCard(card) {
    const dueDateClass = this.getDueDateClass(card.dueDate);
    
    return `
      <div class="kanban-card" data-card-id="${card.id}" draggable="true">
        <div class="kanban-card-quick-actions">
          <div class="kanban-card-quick-action" data-action="edit-card" title="Edit">
            ✎
          </div>
          <div class="kanban-card-quick-action" data-action="delete-card" title="Delete">
            ×
          </div>
        </div>
        
        <div class="kanban-card-header">
          <div class="kanban-card-title">${card.title}</div>
          ${card.priority ? `
            <div class="kanban-card-priority ${card.priority}" title="Priority: ${card.priority}"></div>
          ` : ''}
        </div>
        
        ${card.description ? `
          <div class="kanban-card-description">${card.description}</div>
        ` : ''}
        
        <div class="kanban-card-meta">
          <div class="kanban-card-tags">
            ${(card.tags || []).slice(0, 3).map(tag => `
              <div class="kanban-card-tag">${tag.name || tag}</div>
            `).join('')}
            ${card.tags && card.tags.length > 3 ? `
              <div class="kanban-card-tag">+${card.tags.length - 3}</div>
            ` : ''}
          </div>
          
          <div style="display: flex; align-items: center; gap: 8px;">
            ${card.dueDate ? `
              <div class="kanban-card-due-date ${dueDateClass}">
                ${this.formatDate(card.dueDate)}
              </div>
            ` : ''}
            
            ${card.assignee ? `
              <div class="kanban-card-assignee" title="${card.assignee.name}">
                ${this.getInitials(card.assignee.name)}
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  renderAddColumn() {
    return `
      <div class="kanban-add-column" data-action="add-column">
        <span>+</span>
        <span>Add Column</span>
      </div>
    `;
  }

  renderEmpty() {
    this.container.innerHTML = `
      <div class="kanban-empty">
        <div class="kanban-empty-icon">📋</div>
        <div>No columns configured</div>
        <button class="btn btn-primary" onclick="this.closest('.kanban-board').kanbanView.addColumn()">
          Add Your First Column
        </button>
      </div>
    `;
  }

  getColumnCards(columnId) {
    return this.data.filter(card => card.status === columnId || card.columnId === columnId);
  }

  getDueDateClass(dueDate) {
    if (!dueDate) return '';
    
    const due = new Date(dueDate);
    const now = new Date();
    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'overdue';
    if (diffDays <= 2) return 'due-soon';
    return '';
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays < 0) return `${Math.abs(diffDays)}d ago`;
    if (diffDays <= 7) return `${diffDays}d`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  getInitials(name) {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  handleClick(event) {
    const action = event.target.dataset.action;
    const columnId = event.target.closest('[data-column-id]')?.dataset.columnId;
    const cardId = event.target.closest('[data-card-id]')?.dataset.cardId;

    switch (action) {
      case 'add-column':
        this.showColumnModal();
        break;
      case 'edit-column':
        this.showColumnModal(this.getColumn(columnId));
        break;
      case 'delete-column':
        this.deleteColumn(columnId);
        break;
      case 'add-card':
        this.showCardModal(null, columnId);
        break;
      case 'edit-card':
        this.showCardModal(this.getCard(cardId));
        break;
      case 'delete-card':
        this.deleteCard(cardId);
        break;
    }
  }

  handleDragStart(event) {
    const card = event.target.closest('.kanban-card');
    const column = event.target.closest('.kanban-column');

    if (card) {
      this.draggedCard = card.dataset.cardId;
      card.classList.add('dragging');
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', this.draggedCard);
    } else if (column) {
      this.draggedColumn = column.dataset.columnId;
      column.classList.add('dragging');
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', this.draggedColumn);
    }
  }

  handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }

  handleDragEnter(event) {
    const columnBody = event.target.closest('.kanban-column-body');
    const column = event.target.closest('.kanban-column');

    if (this.draggedCard && columnBody) {
      column?.classList.add('drag-over');
    }
  }

  handleDragLeave(event) {
    const column = event.target.closest('.kanban-column');
    
    // Only remove drag-over if we're actually leaving the column
    if (!column?.contains(event.relatedTarget)) {
      column?.classList.remove('drag-over');
    }
  }

  handleDrop(event) {
    event.preventDefault();
    
    const columnBody = event.target.closest('.kanban-column-body');
    const targetColumn = columnBody?.dataset.columnId;

    if (this.draggedCard && targetColumn) {
      this.moveCard(this.draggedCard, targetColumn);
    }
  }

  handleDragEnd(event) {
    // Clean up drag state
    this.container.querySelectorAll('.dragging, .drag-over').forEach(el => {
      el.classList.remove('dragging', 'drag-over');
    });

    this.draggedCard = null;
    this.draggedColumn = null;
  }

  moveCard(cardId, newColumnId) {
    const card = this.getCard(cardId);
    if (!card) return;

    const oldStatus = card.status || card.columnId;
    card.status = newColumnId;
    card.columnId = newColumnId;

    this.render();
    this.emit('cardMoved', {
      cardId,
      card,
      oldStatus,
      newStatus: newColumnId
    });
  }

  showColumnModal(column = null) {
    const isEdit = !!column;
    const modal = document.createElement('div');
    modal.className = 'kanban-column-modal';
    modal.innerHTML = `
      <div class="kanban-column-modal-content">
        <h3>${isEdit ? 'Edit Column' : 'Add Column'}</h3>
        <form id="column-form">
          <div class="form-group">
            <label for="column-title">Title</label>
            <input type="text" id="column-title" value="${column?.title || ''}" required>
          </div>
          <div class="form-group">
            <label for="column-color">Color</label>
            <input type="color" id="column-color" value="${column?.color || '#3b82f6'}">
          </div>
          <div class="kanban-column-modal-actions">
            <button type="button" class="btn btn-secondary" onclick="this.closest('.kanban-column-modal').remove()">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary">
              ${isEdit ? 'Update' : 'Add'} Column
            </button>
          </div>
        </form>
      </div>
    `;

    modal.querySelector('#column-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const title = modal.querySelector('#column-title').value;
      const color = modal.querySelector('#column-color').value;

      if (isEdit) {
        this.updateColumn(column.id, { title, color });
      } else {
        this.addColumn({ title, color });
      }

      modal.remove();
    });

    document.body.appendChild(modal);
    modal.querySelector('#column-title').focus();
  }

  showCardModal(card = null, columnId = null) {
    // This would typically open a more complex card editing modal
    // For now, emit an event for external handling
    this.emit('showCardModal', { card, columnId });
  }

  addColumn(columnData) {
    const newColumn = {
      id: Date.now().toString(),
      title: columnData.title,
      color: columnData.color,
      order: this.options.columns.length
    };

    this.options.columns.push(newColumn);
    this.render();
    this.emit('columnAdded', { column: newColumn });
  }

  updateColumn(columnId, updates) {
    const column = this.getColumn(columnId);
    if (column) {
      Object.assign(column, updates);
      this.render();
      this.emit('columnUpdated', { columnId, column, updates });
    }
  }

  deleteColumn(columnId) {
    const column = this.getColumn(columnId);
    if (!column) return;

    const cardsInColumn = this.getColumnCards(columnId);
    
    if (cardsInColumn.length > 0) {
      const confirmed = confirm(
        `This column contains ${cardsInColumn.length} card(s). Are you sure you want to delete it?`
      );
      if (!confirmed) return;
    }

    this.options.columns = this.options.columns.filter(col => col.id !== columnId);
    this.render();
    this.emit('columnDeleted', { columnId, column });
  }

  deleteCard(cardId) {
    const card = this.getCard(cardId);
    if (!card) return;

    const confirmed = confirm(`Are you sure you want to delete "${card.title}"?`);
    if (!confirmed) return;

    this.data = this.data.filter(c => c.id !== cardId);
    this.render();
    this.emit('cardDeleted', { cardId, card });
  }

  getColumn(columnId) {
    return this.options.columns.find(col => col.id === columnId);
  }

  getCard(cardId) {
    return this.data.find(card => card.id == cardId);
  }

  // Public API
  addCard(cardData, columnId) {
    const newCard = {
      id: Date.now().toString(),
      status: columnId,
      columnId: columnId,
      ...cardData
    };

    this.data.push(newCard);
    this.render();
    this.emit('cardAdded', { card: newCard, columnId });
  }

  updateCard(cardId, updates) {
    const card = this.getCard(cardId);
    if (card) {
      Object.assign(card, updates);
      this.render();
      this.emit('cardUpdated', { cardId, card, updates });
    }
  }

  filterCards(filterFn) {
    const originalData = this.data;
    this.data = originalData.filter(filterFn);
    this.render();
    
    // Return a function to restore original data
    return () => {
      this.data = originalData;
      this.render();
    };
  }

  setCardTemplate(templateFn) {
    this.options.cardTemplate = templateFn;
    this.render();
  }

  getColumnStats() {
    const stats = {};
    this.options.columns.forEach(column => {
      const cards = this.getColumnCards(column.id);
      stats[column.id] = {
        count: cards.length,
        totalEffort: cards.reduce((sum, card) => sum + (card.effort || 0), 0),
        completedEffort: cards
          .filter(card => card.progress === 100)
          .reduce((sum, card) => sum + (card.effort || 0), 0)
      };
    });
    return stats;
  }

  exportData() {
    return {
      columns: this.options.columns,
      cards: this.data,
      timestamp: new Date().toISOString()
    };
  }

  importData(data) {
    if (data.columns) {
      this.options.columns = data.columns;
    }
    if (data.cards) {
      this.data = data.cards;
    }
    this.render();
    this.emit('dataImported', data);
  }

  // Event system
  emit(event, data) {
    if (this.options.on && this.options.on[event]) {
      this.options.on[event](data);
    }
    
    // Also emit as DOM event
    this.container.dispatchEvent(new CustomEvent(`kanban-${event}`, { detail: data }));
  }
}

// Make KanbanView globally available
window.KanbanView = KanbanView;

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = KanbanView;
}