/**
 * Debug Utilities
 * Provides debugging helpers for development
 */

class DebugUtils {
  /**
   * Check for global variable conflicts
   */
  static checkGlobalConflicts() {
    const conflicts = [];
    const globalVars = Object.keys(window);
    const duplicates = {};
    
    globalVars.forEach(varName => {
      if (duplicates[varName]) {
        conflicts.push(varName);
      } else {
        duplicates[varName] = true;
      }
    });
    
    if (conflicts.length > 0) {
      console.warn('🚨 Potential global variable conflicts detected:', conflicts);
    } else {
      console.log('✅ No global variable conflicts detected');
    }
    
    return conflicts;
  }

  /**
   * List all loaded stylesheets
   */
  static listLoadedStyles() {
    const styleElements = document.querySelectorAll('style[id]');
    const externalStyles = document.querySelectorAll('link[rel="stylesheet"]');
    
    console.log('📊 Loaded Styles:');
    console.log('  Internal styles:', Array.from(styleElements).map(s => s.id));
    console.log('  External styles:', Array.from(externalStyles).map(s => s.href));
    
    if (window.StyleLoader) {
      console.log('  StyleLoader managed:', window.StyleLoader.getLoadedStyles());
    }
  }

  /**
   * Check for JavaScript errors
   */
  static enableErrorMonitoring() {
    let errorCount = 0;
    
    window.addEventListener('error', (event) => {
      errorCount++;
      console.error(`❌ JavaScript Error #${errorCount}:`, {
        message: event.message,
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
        error: event.error
      });
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      errorCount++;
      console.error(`❌ Promise Rejection #${errorCount}:`, event.reason);
    });
    
    console.log('🔍 Error monitoring enabled');
    return () => errorCount;
  }

  /**
   * Performance monitoring
   */
  static monitorPerformance() {
    if (window.performance && window.performance.mark) {
      console.log('⚡ Performance Monitoring:');
      console.log('  DOM Content Loaded:', window.performance.timing.domContentLoadedEventEnd - window.performance.timing.navigationStart, 'ms');
      console.log('  Page Load Complete:', window.performance.timing.loadEventEnd - window.performance.timing.navigationStart, 'ms');
      
      // Monitor resource loading
      const resources = window.performance.getEntriesByType('resource');
      const slowResources = resources.filter(r => r.duration > 100);
      
      if (slowResources.length > 0) {
        console.warn('🐌 Slow loading resources:', slowResources.map(r => ({
          name: r.name,
          duration: Math.round(r.duration),
          size: r.transferSize
        })));
      }
    }
  }

  /**
   * Check component initialization
   */
  static checkComponents() {
    const expectedComponents = [
      'appConfig',
      'errorHandler', 
      'apiClient',
      'keyboardShortcuts',
      'globalSearch',
      'StyleLoader',
      'router',
      'app'
    ];
    
    const missing = expectedComponents.filter(component => !window[component]);
    const available = expectedComponents.filter(component => window[component]);
    
    console.log('🧩 Component Status:');
    console.log('  ✅ Available:', available);
    if (missing.length > 0) {
      console.warn('  ❌ Missing:', missing);
    }
    
    return { available, missing };
  }

  /**
   * Run all checks
   */
  static runAllChecks() {
    console.log('🔍 Running Debug Checks...');
    console.log('================================');
    
    this.checkGlobalConflicts();
    this.listLoadedStyles();
    this.checkComponents();
    this.monitorPerformance();
    
    console.log('✅ Debug checks completed');
  }
}

// Make DebugUtils globally available in development
if (window.appConfig && window.appConfig.isDebugMode && window.appConfig.isDebugMode()) {
  window.DebugUtils = DebugUtils;
  
  // Auto-run checks when page loads
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => DebugUtils.runAllChecks(), 1000);
  });
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DebugUtils;
}