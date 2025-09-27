// Test setup file for Jest
// This file runs before each test file

// Setup globals for tests
global.FormData = class FormData {
  constructor() {
    this.data = new Map();
  }
  
  get(key) {
    return this.data.get(key);
  }
  
  set(key, value) {
    this.data.set(key, value);
  }
};