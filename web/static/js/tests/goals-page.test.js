/**
 * GoalsPage Component Tests
 * Tests for goals page initialization, rendering, and functionality
 */

const { GoalsPage } = require('../pages/goals.js');

// Mock dependencies
const mockAPIClient = {
  getGoals: jest.fn(),
  getGoal: jest.fn(),
  createGoal: jest.fn(),
  updateGoal: jest.fn(),
  deleteGoal: jest.fn(),
  getProjects: jest.fn(),
  getFlows: jest.fn()
};

const mockRouter = {
  navigate: jest.fn()
};

const mockErrorHandler = {
  show: jest.fn()
};

// Test setup
beforeEach(() => {
  // Reset mocks
  mockAPIClient.getGoals.mockClear();
  mockAPIClient.getGoal.mockClear();
  mockAPIClient.createGoal.mockClear();
  mockAPIClient.updateGoal.mockClear();
  mockAPIClient.deleteGoal.mockClear();
  mockAPIClient.getProjects.mockClear();
  mockAPIClient.getFlows.mockClear();
  mockRouter.navigate.mockClear();
  mockErrorHandler.show.mockClear();
  
  // Setup global objects
  global.window = {
    apiClient: mockAPIClient,
    router: mockRouter,
    errorHandler: mockErrorHandler,
    StyleLoader: {
      injectStyles: jest.fn()
    }
  };
  
  global.document = {
    createElement: jest.fn(() => ({
      id: '',
      textContent: '',
      appendChild: jest.fn()
    })),
    head: {
      appendChild: jest.fn()
    },
    getElementById: jest.fn(),
    querySelector: jest.fn(),
    querySelectorAll: jest.fn()
  };
});

describe('GoalsPage', () => {
  let goalsPage;
  let mockContainer;

  beforeEach(() => {
    mockContainer = {
      innerHTML: '',
      querySelector: jest.fn(),
      querySelectorAll: jest.fn()
    };
    
    // Mock the GoalsPage class will be imported
    goalsPage = new GoalsPage(mockContainer);
  });

  describe('Constructor', () => {
    test('should initialize with correct default properties', () => {
      expect(goalsPage.container).toBe(mockContainer);
      expect(goalsPage.currentView).toBe('list');
      expect(goalsPage.goals).toEqual([]);
      expect(goalsPage.filteredGoals).toEqual([]);
      expect(goalsPage.searchTerm).toBe('');
      expect(goalsPage.filterStatus).toBe('all');
      expect(goalsPage.filterPriority).toBe('all');
      expect(goalsPage.filterProject).toBe('all');
      expect(goalsPage.sortBy).toBe('updated_at');
      expect(goalsPage.sortOrder).toBe('desc');
    });
  });

  describe('render', () => {
    test('should render goals list when no params provided', async () => {
      mockAPIClient.getGoals.mockResolvedValue([]);
      
      await goalsPage.render();
      
      expect(mockContainer.innerHTML).toContain('goals-page');
      expect(mockContainer.innerHTML).toContain('Goals');
      expect(mockAPIClient.getGoals).toHaveBeenCalled();
    });

    test('should render create form when action is new', async () => {
      mockAPIClient.getProjects.mockResolvedValue([]);
      mockAPIClient.getFlows.mockResolvedValue([]);
      
      await goalsPage.render({ action: 'new' });
      
      expect(mockContainer.innerHTML).toContain('goal-form-page');
      expect(mockContainer.innerHTML).toContain('Create New Goal');
    });

    test('should render goal detail when id provided', async () => {
      const mockGoal = {
        id: '1',
        title: 'Test Goal',
        description: 'Test Description',
        status: 'active',
        priority: 'high'
      };
      
      mockAPIClient.getGoal.mockResolvedValue(mockGoal);
      
      await goalsPage.render({ id: '1' });
      
      expect(mockAPIClient.getGoal).toHaveBeenCalledWith('1');
      expect(mockContainer.innerHTML).toContain('Test Goal');
    });

    test('should render edit form when id and action is edit', async () => {
      const mockGoal = {
        id: '1',
        title: 'Test Goal',
        description: 'Test Description',
        status: 'active',
        priority: 'high'
      };
      
      mockAPIClient.getGoal.mockResolvedValue(mockGoal);
      mockAPIClient.getProjects.mockResolvedValue([]);
      mockAPIClient.getFlows.mockResolvedValue([]);
      
      await goalsPage.render({ id: '1', action: 'edit' });
      
      expect(mockAPIClient.getGoal).toHaveBeenCalledWith('1');
      expect(mockContainer.innerHTML).toContain('Edit Goal');
    });
  });

  describe('renderGoalsList', () => {
    test('should render page header with goals count', async () => {
      const mockGoals = [
        { id: '1', title: 'Goal 1', status: 'active' },
        { id: '2', title: 'Goal 2', status: 'completed' }
      ];
      
      mockAPIClient.getGoals.mockResolvedValue(mockGoals);
      
      await goalsPage.renderGoalsList();
      
      expect(mockContainer.innerHTML).toContain('Goals');
      expect(mockContainer.innerHTML).toContain('2 goals');
      expect(mockContainer.innerHTML).toContain('New Goal');
    });

    test('should render search and filter controls', async () => {
      mockAPIClient.getGoals.mockResolvedValue([]);
      
      await goalsPage.renderGoalsList();
      
      expect(mockContainer.innerHTML).toContain('search-input');
      expect(mockContainer.innerHTML).toContain('filter-select');
      expect(mockContainer.innerHTML).toContain('sort-select');
    });

    test('should render view switcher buttons', async () => {
      mockAPIClient.getGoals.mockResolvedValue([]);
      
      await goalsPage.renderGoalsList();
      
      expect(mockContainer.innerHTML).toContain('view-switcher');
      expect(mockContainer.innerHTML).toContain('List');
      expect(mockContainer.innerHTML).toContain('Grid');
      expect(mockContainer.innerHTML).toContain('Kanban');
    });

    test('should load styles and set up page reference', async () => {
      mockAPIClient.getGoals.mockResolvedValue([]);
      const mockElement = { goalsPage: null };
      mockContainer.querySelector.mockReturnValue(mockElement);
      
      await goalsPage.renderGoalsList();
      
      expect(window.StyleLoader.injectStyles).toHaveBeenCalledWith('goals-page-styles', expect.any(String));
      expect(mockElement.goalsPage).toBe(goalsPage);
    });
  });

  describe('loadGoals', () => {
    test('should fetch goals from API and apply filters', async () => {
      const mockGoals = [
        { id: '1', title: 'Goal 1', status: 'active' },
        { id: '2', title: 'Goal 2', status: 'completed' }
      ];
      
      mockAPIClient.getGoals.mockResolvedValue(mockGoals);
      
      await goalsPage.loadGoals();
      
      expect(mockAPIClient.getGoals).toHaveBeenCalled();
      expect(goalsPage.goals).toEqual(mockGoals);
    });

    test('should handle API errors gracefully', async () => {
      const error = new Error('API Error');
      mockAPIClient.getGoals.mockRejectedValue(error);
      
      await goalsPage.loadGoals();
      
      expect(mockErrorHandler.show).toHaveBeenCalledWith('Failed to load goals');
    });
  });

  describe('applyFilters', () => {
    beforeEach(() => {
      goalsPage.goals = [
        { id: '1', title: 'Active Goal', status: 'active', priority: 'high', updatedAt: '2023-12-01' },
        { id: '2', title: 'Completed Goal', status: 'completed', priority: 'low', updatedAt: '2023-12-02' },
        { id: '3', title: 'Important Task', status: 'active', priority: 'urgent', updatedAt: '2023-12-03' }
      ];
    });

    test('should filter by search term', () => {
      goalsPage.searchTerm = 'Active';
      goalsPage.applyFilters();
      
      expect(goalsPage.filteredGoals).toHaveLength(1);
      expect(goalsPage.filteredGoals[0].title).toBe('Active Goal');
    });

    test('should filter by status', () => {
      goalsPage.filterStatus = 'completed';
      goalsPage.applyFilters();
      
      expect(goalsPage.filteredGoals).toHaveLength(1);
      expect(goalsPage.filteredGoals[0].status).toBe('completed');
    });

    test('should filter by priority', () => {
      goalsPage.filterPriority = 'urgent';
      goalsPage.applyFilters();
      
      expect(goalsPage.filteredGoals).toHaveLength(1);
      expect(goalsPage.filteredGoals[0].priority).toBe('urgent');
    });

    test('should sort by title ascending', () => {
      goalsPage.sortBy = 'title';
      goalsPage.sortOrder = 'asc';
      goalsPage.applyFilters();
      
      expect(goalsPage.filteredGoals[0].title).toBe('Active Goal');
      expect(goalsPage.filteredGoals[1].title).toBe('Completed Goal');
    });

    test('should sort by updated date descending', () => {
      goalsPage.sortBy = 'updated_at';
      goalsPage.sortOrder = 'desc';
      goalsPage.applyFilters();
      
      expect(goalsPage.filteredGoals[0].updatedAt).toBe('2023-12-03');
      expect(goalsPage.filteredGoals[2].updatedAt).toBe('2023-12-01');
    });
  });

  describe('renderGoalCard', () => {
    test('should render goal card with all properties', () => {
      const goal = {
        id: '1',
        title: 'Test Goal',
        description: 'Test Description',
        status: 'active',
        priority: 'high',
        progress: 75,
        createdAt: '2023-01-01',
        updatedAt: '2023-12-01',
        tags: [{ name: 'important' }, { name: 'work' }]
      };
      
      const cardHTML = goalsPage.renderGoalCard(goal, 'list');
      
      expect(cardHTML).toContain('Test Goal');
      expect(cardHTML).toContain('Test Description');
      expect(cardHTML).toContain('status-active');
      expect(cardHTML).toContain('priority-high');
      expect(cardHTML).toContain('75%');
      expect(cardHTML).toContain('important');
      expect(cardHTML).toContain('work');
    });

    test('should handle goal card without optional properties', () => {
      const goal = {
        id: '1',
        title: 'Minimal Goal',
        status: 'active',
        createdAt: '2023-01-01',
        updatedAt: '2023-12-01'
      };
      
      const cardHTML = goalsPage.renderGoalCard(goal, 'grid');
      
      expect(cardHTML).toContain('Minimal Goal');
      expect(cardHTML).toContain('status-active');
      expect(cardHTML).not.toContain('undefined');
    });
  });

  describe('Event Handlers', () => {
    test('handleSearch should update search term and re-render', () => {
      const mockRender = jest.spyOn(goalsPage, 'renderGoalsContent').mockImplementation();
      
      goalsPage.handleSearch('test search');
      
      expect(goalsPage.searchTerm).toBe('test search');
      expect(mockRender).toHaveBeenCalled();
    });

    test('handleStatusFilter should update filter and re-render', () => {
      const mockRender = jest.spyOn(goalsPage, 'renderGoalsContent').mockImplementation();
      
      goalsPage.handleStatusFilter('completed');
      
      expect(goalsPage.filterStatus).toBe('completed');
      expect(mockRender).toHaveBeenCalled();
    });

    test('switchView should update view and re-render', () => {
      const mockRender = jest.spyOn(goalsPage, 'renderGoalsContent').mockImplementation();
      
      goalsPage.switchView('grid');
      
      expect(goalsPage.currentView).toBe('grid');
      expect(mockRender).toHaveBeenCalled();
    });
  });

  describe('Form Operations', () => {
    test('setupForm should handle goal creation', async () => {
      const mockForm = {
        addEventListener: jest.fn(),
        querySelector: jest.fn(() => ({ disabled: false, textContent: '' }))
      };
      
      document.getElementById.mockReturnValue(mockForm);
      
      const mockGoal = { id: '1', title: 'New Goal' };
      mockAPIClient.createGoal.mockResolvedValue(mockGoal);
      
      goalsPage.setupForm();
      
      // Simulate form submission
      const submitHandler = mockForm.addEventListener.mock.calls.find(call => call[0] === 'submit')[1];
      
      const mockEvent = {
        preventDefault: jest.fn(),
        target: {
          querySelector: jest.fn(() => ({ disabled: false, textContent: '' }))
        }
      };
      
      const mockFormData = new Map([
        ['title', 'New Goal'],
        ['description', 'Description'],
        ['status', 'active'],
        ['priority', 'medium']
      ]);
      
      // Mock FormData
      global.FormData = jest.fn(() => ({
        get: jest.fn(key => mockFormData.get(key))
      }));
      
      await submitHandler(mockEvent);
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockAPIClient.createGoal).toHaveBeenCalledWith({
        title: 'New Goal',
        description: 'Description',
        status: 'active',
        priority: 'medium',
        projectId: null,
        contextId: null,
        tags: []
      });
      expect(mockRouter.navigate).toHaveBeenCalledWith('/goals/1');
    });
  });

  describe('Error Handling', () => {
    test('should handle goal not found error', async () => {
      mockAPIClient.getGoal.mockRejectedValue(new Error('Goal not found'));
      
      await goalsPage.render({ id: '999' });
      
      expect(mockContainer.innerHTML).toContain('Goal not found');
      expect(mockContainer.innerHTML).toContain('Back to Goals');
    });

    test('should handle form submission errors', async () => {
      const mockForm = {
        addEventListener: jest.fn(),
        querySelector: jest.fn(() => ({ disabled: false, textContent: 'Create Goal' }))
      };
      
      document.getElementById.mockReturnValue(mockForm);
      
      mockAPIClient.createGoal.mockRejectedValue(new Error('Creation failed'));
      
      goalsPage.setupForm();
      
      const submitHandler = mockForm.addEventListener.mock.calls.find(call => call[0] === 'submit')[1];
      
      const mockEvent = {
        preventDefault: jest.fn(),
        target: mockForm
      };
      
      global.FormData = jest.fn(() => ({
        get: jest.fn(() => 'test value')
      }));
      
      await submitHandler(mockEvent);
      
      expect(mockErrorHandler.show).toHaveBeenCalledWith('Failed to create goal: Creation failed');
    });
  });

  describe('Utility Methods', () => {
    test('formatDate should format dates correctly', () => {
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      expect(goalsPage.formatDate(today.toISOString())).toBe('today');
      expect(goalsPage.formatDate(yesterday.toISOString())).toBe('yesterday');
      expect(goalsPage.formatDate(tomorrow.toISOString())).toBe('tomorrow');
      expect(goalsPage.formatDate(weekAgo.toISOString())).toContain('ago');
    });

    test('clearFilters should reset all filters and update UI', () => {
      goalsPage.searchTerm = 'test';
      goalsPage.filterStatus = 'completed';
      goalsPage.filterPriority = 'high';
      
      const mockSearchInput = { value: '' };
      const mockFilterSelect = { value: '' };
      const mockPrioritySelect = { value: '' };
      const mockSortSelect = { value: '' };
      
      mockContainer.querySelector
        .mockReturnValueOnce(mockSearchInput)
        .mockReturnValueOnce(mockFilterSelect)
        .mockReturnValueOnce(mockPrioritySelect)
        .mockReturnValueOnce(mockSortSelect);
      
      const mockRender = jest.spyOn(goalsPage, 'renderGoalsContent').mockImplementation();
      
      goalsPage.clearFilters();
      
      expect(goalsPage.searchTerm).toBe('');
      expect(goalsPage.filterStatus).toBe('all');
      expect(goalsPage.filterPriority).toBe('all');
      expect(mockRender).toHaveBeenCalled();
    });
  });

  describe('Integration Tests', () => {
    test('should handle complete goal creation workflow', async () => {
      // Setup mocks for the full workflow
      mockAPIClient.getProjects.mockResolvedValue([{ id: '1', title: 'Project 1' }]);
      mockAPIClient.getFlows.mockResolvedValue([{ id: '1', name: 'Flow 1' }]);
      mockAPIClient.createGoal.mockResolvedValue({ id: '1', title: 'New Goal' });
      
      // Render create form
      await goalsPage.render({ action: 'new' });
      
      expect(mockContainer.innerHTML).toContain('Create New Goal');
      expect(mockAPIClient.getProjects).toHaveBeenCalled();
      expect(mockAPIClient.getFlows).toHaveBeenCalled();
    });

    test('should handle search and filter interactions', () => {
      goalsPage.goals = [
        { id: '1', title: 'Active Goal', status: 'active', priority: 'high' },
        { id: '2', title: 'Completed Goal', status: 'completed', priority: 'low' }
      ];
      
      // Test search
      goalsPage.handleSearch('Active');
      expect(goalsPage.filteredGoals).toHaveLength(1);
      
      // Clear search and test status filter
      goalsPage.handleSearch('');
      goalsPage.handleStatusFilter('completed');
      expect(goalsPage.filteredGoals).toHaveLength(1);
      expect(goalsPage.filteredGoals[0].status).toBe('completed');
    });
  });
});