/**
 * Style Loader Utility
 * Handles dynamic CSS injection with proper scoping to avoid variable conflicts
 */

class StyleLoader {
  static loadedStyles = new Set();

  /**
   * Inject CSS styles into the document head
   * @param {string} id - Unique identifier for the style element
   * @param {string} cssContent - CSS content to inject
   * @param {boolean} force - Force reload even if already loaded
   */
  static injectStyles(id, cssContent, force = false) {
    // Check if already loaded
    if (this.loadedStyles.has(id) && !force) {
      return;
    }

    // Remove existing style element if forcing reload
    if (force) {
      const existingStyle = document.getElementById(id);
      if (existingStyle) {
        existingStyle.remove();
      }
    }

    // Check if style element already exists
    if (document.getElementById(id)) {
      this.loadedStyles.add(id);
      return;
    }

    try {
      // Create and inject style element
      const styleElement = document.createElement('style');
      styleElement.id = id;
      styleElement.textContent = cssContent;
      
      // Add to document head
      document.head.appendChild(styleElement);
      
      // Mark as loaded
      this.loadedStyles.add(id);
      
      console.debug(`✅ Styles loaded: ${id}`);
    } catch (error) {
      console.error(`❌ Failed to load styles: ${id}`, error);
    }
  }

  /**
   * Remove injected styles
   * @param {string} id - Style element ID to remove
   */
  static removeStyles(id) {
    const styleElement = document.getElementById(id);
    if (styleElement) {
      styleElement.remove();
      this.loadedStyles.delete(id);
      console.debug(`🗑️ Styles removed: ${id}`);
    }
  }

  /**
   * Check if styles are loaded
   * @param {string} id - Style element ID to check
   * @returns {boolean} - True if styles are loaded
   */
  static isLoaded(id) {
    return this.loadedStyles.has(id) && document.getElementById(id) !== null;
  }

  /**
   * Get list of all loaded style IDs
   * @returns {Array<string>} - Array of loaded style IDs
   */
  static getLoadedStyles() {
    return Array.from(this.loadedStyles);
  }

  /**
   * Reload all styles
   */
  static reloadAll() {
    const loadedIds = Array.from(this.loadedStyles);
    loadedIds.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        // Get the current CSS content
        const cssContent = element.textContent;
        // Remove and reload
        this.removeStyles(id);
        this.injectStyles(id, cssContent);
      }
    });
  }

  /**
   * Clear all loaded styles
   */
  static clearAll() {
    const loadedIds = Array.from(this.loadedStyles);
    loadedIds.forEach(id => this.removeStyles(id));
    this.loadedStyles.clear();
  }
}

// Make StyleLoader globally available
window.StyleLoader = StyleLoader;

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StyleLoader;
}