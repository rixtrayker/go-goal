/**
 * Modern Keyboard Shortcuts System
 * Provides global keyboard shortcuts with visual indicators
 */
class KeyboardShortcuts {
  constructor() {
    this.shortcuts = new Map();
    this.sequences = new Map();
    this.currentSequence = [];
    this.sequenceTimeout = null;
    this.helpModal = null;
    this.isEnabled = true;
    
    this.init();
    this.registerDefaultShortcuts();
    this.createHelpModal();
  }

  init() {
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));
    
    // Prevent shortcuts when typing in inputs
    document.addEventListener('focusin', (e) => {
      if (e.target.matches('input, textarea, select, [contenteditable]')) {
        this.isEnabled = false;
      }
    });
    
    document.addEventListener('focusout', (e) => {
      if (e.target.matches('input, textarea, select, [contenteditable]')) {
        this.isEnabled = true;
      }
    });
  }

  registerShortcut(keys, callback, description, scope = 'global') {
    const keyString = this.normalizeKeys(keys);
    this.shortcuts.set(keyString, {
      callback,
      description,
      scope,
      keys: keyString
    });
  }

  registerSequence(sequence, callback, description, scope = 'global') {
    const sequenceString = sequence.join(' ');
    this.sequences.set(sequenceString, {
      callback,
      description,
      scope,
      sequence
    });
  }

  normalizeKeys(keys) {
    return keys
      .toLowerCase()
      .split('+')
      .map(key => key.trim())
      .sort()
      .join('+');
  }

  handleKeyDown(e) {
    if (!this.isEnabled) return;

    const keys = this.getKeysFromEvent(e);
    const keyString = keys.join('+');

    // Handle sequences
    this.currentSequence.push(e.key.toLowerCase());
    this.checkSequences();

    // Reset sequence timeout
    if (this.sequenceTimeout) {
      clearTimeout(this.sequenceTimeout);
    }
    this.sequenceTimeout = setTimeout(() => {
      this.currentSequence = [];
    }, 2000);

    // Handle single shortcuts
    if (this.shortcuts.has(keyString)) {
      e.preventDefault();
      const shortcut = this.shortcuts.get(keyString);
      shortcut.callback(e);
      this.showShortcutFeedback(shortcut.description);
    }
  }

  handleKeyUp(e) {
    // Handle any key up events if needed
  }

  getKeysFromEvent(e) {
    const keys = [];
    
    if (e.ctrlKey || e.metaKey) keys.push('cmd');
    if (e.altKey) keys.push('alt');
    if (e.shiftKey) keys.push('shift');
    
    const key = e.key.toLowerCase();
    if (!['control', 'meta', 'alt', 'shift'].includes(key)) {
      keys.push(key);
    }
    
    return keys.sort();
  }

  checkSequences() {
    const currentSequenceString = this.currentSequence.join(' ');
    
    for (const [sequenceString, shortcut] of this.sequences) {
      if (sequenceString === currentSequenceString) {
        shortcut.callback();
        this.showShortcutFeedback(shortcut.description);
        this.currentSequence = [];
        clearTimeout(this.sequenceTimeout);
        break;
      }
    }
  }

  showShortcutFeedback(description) {
    // Create or update feedback toast
    let toast = document.getElementById('shortcut-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'shortcut-toast';
      toast.className = 'shortcut-toast';
      document.body.appendChild(toast);
    }

    toast.textContent = description;
    toast.style.display = 'block';
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.style.display = 'none';
      }, 300);
    }, 2000);
  }

  createHelpModal() {
    const modal = document.createElement('div');
    modal.id = 'shortcuts-help-modal';
    modal.className = 'shortcuts-modal';
    modal.innerHTML = `
      <div class="shortcuts-modal-overlay" onclick="keyboardShortcuts.hideHelp()"></div>
      <div class="shortcuts-modal-content glass">
        <div class="shortcuts-modal-header">
          <h2>Keyboard Shortcuts</h2>
          <button onclick="keyboardShortcuts.hideHelp()" class="btn btn-ghost">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="shortcuts-modal-body">
          <div class="shortcuts-grid" id="shortcuts-grid">
            <!-- Shortcuts will be populated here -->
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    this.helpModal = modal;
  }

  showHelp() {
    this.populateHelpModal();
    this.helpModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  hideHelp() {
    this.helpModal.style.display = 'none';
    document.body.style.overflow = '';
  }

  populateHelpModal() {
    const grid = document.getElementById('shortcuts-grid');
    grid.innerHTML = '';

    const categories = {
      'Navigation': [],
      'Actions': [],
      'Search': [],
      'Global': []
    };

    // Categorize shortcuts
    this.shortcuts.forEach((shortcut, keys) => {
      const category = this.getShortcutCategory(shortcut.description);
      categories[category].push({
        keys,
        description: shortcut.description
      });
    });

    this.sequences.forEach((shortcut) => {
      const category = this.getShortcutCategory(shortcut.description);
      categories[category].push({
        keys: shortcut.sequence.join(' '),
        description: shortcut.description
      });
    });

    // Render categories
    Object.entries(categories).forEach(([category, shortcuts]) => {
      if (shortcuts.length === 0) return;

      const categoryEl = document.createElement('div');
      categoryEl.className = 'shortcuts-category';
      categoryEl.innerHTML = `
        <h3>${category}</h3>
        <div class="shortcuts-list">
          ${shortcuts.map(shortcut => `
            <div class="shortcut-item">
              <div class="shortcut-keys">${this.formatKeysForDisplay(shortcut.keys)}</div>
              <div class="shortcut-description">${shortcut.description}</div>
            </div>
          `).join('')}
        </div>
      `;
      grid.appendChild(categoryEl);
    });
  }

  getShortcutCategory(description) {
    if (description.includes('Navigate') || description.includes('Go to')) return 'Navigation';
    if (description.includes('Search') || description.includes('Find')) return 'Search';
    if (description.includes('Create') || description.includes('Delete') || description.includes('Save')) return 'Actions';
    return 'Global';
  }

  formatKeysForDisplay(keys) {
    return keys
      .split('+')
      .map(key => {
        const keyMap = {
          'cmd': '⌘',
          'ctrl': 'Ctrl',
          'alt': '⌥',
          'shift': '⇧',
          'enter': 'Enter',
          'escape': 'Esc',
          'arrowup': '↑',
          'arrowdown': '↓',
          'arrowleft': '←',
          'arrowright': '→'
        };
        return `<kbd>${keyMap[key] || key.toUpperCase()}</kbd>`;
      })
      .join(' + ');
  }

  registerDefaultShortcuts() {
    // Navigation shortcuts
    this.registerShortcut('cmd+1', () => this.navigateTo('/dashboard'), 'Go to Dashboard', 'navigation');
    this.registerShortcut('cmd+2', () => this.navigateTo('/projects'), 'Go to Projects', 'navigation');
    this.registerShortcut('cmd+3', () => this.navigateTo('/goals'), 'Go to Goals', 'navigation');
    this.registerShortcut('cmd+4', () => this.navigateTo('/tasks'), 'Go to Tasks', 'navigation');
    this.registerShortcut(
      "cmd+5",
      () => this.navigateTo("/flows"),
      "Go to Flows",
      "navigation"
    );

    // Search shortcuts
    this.registerShortcut('cmd+k', () => globalSearch.toggle(), 'Open Global Search', 'search');
    this.registerShortcut('cmd+shift+k', () => globalSearch.toggleAdvanced(), 'Advanced Search', 'search');
    this.registerShortcut('escape', () => globalSearch.close(), 'Close Search/Modals', 'global');

    // Quick actions
    this.registerShortcut('cmd+n', () => this.quickCreate(), 'Quick Create', 'actions');
    this.registerShortcut('cmd+shift+n', () => this.quickCreateMenu(), 'Quick Create Menu', 'actions');
    this.registerShortcut('cmd+s', (e) => this.quickSave(e), 'Quick Save', 'actions');

    // Help
    this.registerShortcut('cmd+shift+?', () => this.showHelp(), 'Show Keyboard Shortcuts', 'global');

    // Sequences
    this.registerSequence(['g', 'd'], () => this.navigateTo('/dashboard'), 'Go to Dashboard', 'navigation');
    this.registerSequence(['g', 'p'], () => this.navigateTo('/projects'), 'Go to Projects', 'navigation');
    this.registerSequence(['g', 'g'], () => this.navigateTo('/goals'), 'Go to Goals', 'navigation');
    this.registerSequence(['g', 't'], () => this.navigateTo('/tasks'), 'Go to Tasks', 'navigation');
    this.registerSequence(
      ["g", "c"],
      () => this.navigateTo("/flows"),
      "Go to Flows",
      "navigation"
    );
  }

  navigateTo(path) {
    window.location.href = path;
  }

  quickCreate() {
    // Determine context and create appropriate item
    const path = window.location.pathname;
    if (path.includes('projects')) {
      window.location.href = '/projects/new';
    } else if (path.includes('goals')) {
      window.location.href = '/goals/new';
    } else if (path.includes('tasks')) {
      window.location.href = '/tasks/new';
    } else if (path.includes('flows')) {
      // Trigger flow creation modal
      if (window.createFlowModal) {
        window.createFlowModal();
      }
    } else {
      this.quickCreateMenu();
    }
  }

  quickCreateMenu() {
    // Show quick create menu
    if (!document.getElementById('quick-create-menu')) {
      this.createQuickCreateMenu();
    }
    
    const menu = document.getElementById('quick-create-menu');
    menu.style.display = 'flex';
  }

  createQuickCreateMenu() {
    const menu = document.createElement('div');
    menu.id = 'quick-create-menu';
    menu.className = 'quick-create-menu';
    menu.innerHTML = `
      <div class="quick-create-overlay" onclick="this.parentElement.style.display='none'"></div>
      <div class="quick-create-content glass">
        <h3>Quick Create</h3>
        <div class="quick-create-options">
          <a href="/projects/new" class="quick-create-option">
            <div class="option-icon">📁</div>
            <div class="option-text">
              <div class="option-title">Project</div>
              <div class="option-desc">Create a new project</div>
            </div>
            <kbd>P</kbd>
          </a>
          <a href="/goals/new" class="quick-create-option">
            <div class="option-icon">🎯</div>
            <div class="option-text">
              <div class="option-title">Goal</div>
              <div class="option-desc">Set a new goal</div>
            </div>
            <kbd>G</kbd>
          </a>
          <a href="/tasks/new" class="quick-create-option">
            <div class="option-icon">✓</div>
            <div class="option-text">
              <div class="option-title">Task</div>
              <div class="option-desc">Add a new task</div>
            </div>
            <kbd>T</kbd>
          </a>
          <a href="/notes/new" class="quick-create-option">
            <div class="option-icon">📝</div>
            <div class="option-text">
              <div class="option-title">Note</div>
              <div class="option-desc">Write a note</div>
            </div>
            <kbd>N</kbd>
          </a>
        </div>
      </div>
    `;
    document.body.appendChild(menu);

    // Add keyboard navigation for quick create menu
    menu.addEventListener('keydown', (e) => {
      const options = menu.querySelectorAll('.quick-create-option');
      switch(e.key.toLowerCase()) {
        case 'p':
          window.location.href = '/projects/new';
          break;
        case 'g':
          window.location.href = '/goals/new';
          break;
        case 't':
          window.location.href = '/tasks/new';
          break;
        case 'n':
          window.location.href = '/notes/new';
          break;
        case 'escape':
          menu.style.display = 'none';
          break;
      }
    });
  }

  quickSave(e) {
    e.preventDefault();
    
    // Find any form on the page and submit it
    const form = document.querySelector('form');
    if (form) {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      this.showShortcutFeedback('Form saved');
    } else {
      this.showShortcutFeedback('No form to save');
    }
  }
}

// Initialize keyboard shortcuts
const keyboardShortcuts = new KeyboardShortcuts();

// Add CSS for shortcuts UI
const shortcutsCSS = `
.shortcut-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  z-index: 10000;
  transform: translateX(100%);
  transition: transform 0.3s ease;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.shortcut-toast.show {
  transform: translateX(0);
}

.shortcuts-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10000;
  display: none;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.shortcuts-modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
}

.shortcuts-modal-content {
  position: relative;
  width: 100%;
  max-width: 800px;
  max-height: 80vh;
  overflow: hidden;
  border-radius: 20px;
  padding: 0;
}

.shortcuts-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 2rem 1rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.shortcuts-modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.shortcuts-modal-body {
  padding: 2rem;
  overflow-y: auto;
  max-height: calc(80vh - 120px);
}

.shortcuts-grid {
  display: grid;
  gap: 2rem;
}

.shortcuts-category h3 {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--glass-primary);
}

.shortcuts-list {
  display: grid;
  gap: 0.75rem;
}

.shortcut-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.shortcut-keys {
  display: flex;
  gap: 0.25rem;
  align-items: center;
}

.shortcut-keys kbd {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  min-width: 24px;
  text-align: center;
}

.shortcut-description {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.quick-create-menu {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10000;
  display: none;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.quick-create-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
}

.quick-create-content {
  position: relative;
  width: 100%;
  max-width: 500px;
  border-radius: 20px;
  padding: 2rem;
}

.quick-create-content h3 {
  margin: 0 0 1.5rem 0;
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
}

.quick-create-options {
  display: grid;
  gap: 0.75rem;
}

.quick-create-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
}

.quick-create-option:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateX(4px);
}

.option-icon {
  font-size: 1.5rem;
  width: 40px;
  text-align: center;
}

.option-text {
  flex: 1;
}

.option-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.option-desc {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.quick-create-option kbd {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  min-width: 24px;
  text-align: center;
}
`;

// Inject CSS (wrapped in function scope to avoid global variable conflicts)
(function() {
  const keyboardShortcutsStyleElement = document.createElement('style');
  keyboardShortcutsStyleElement.textContent = shortcutsCSS;
  document.head.appendChild(keyboardShortcutsStyleElement);
})();