import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import TaskForm from './TaskForm.svelte';
import type { Task, Project, Goal, CreateTaskInput } from '$lib/types/graphql';

// Mock data
const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Test Project',
    description: 'Test project description',
    status: 'active',
    workspaceId: 1,
    flowId: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    goals: [],
    tasks: [],
    notes: [],
    tags: [],
    flow: null,
  }
];

const mockGoals: Goal[] = [
  {
    id: '1',
    title: 'Test Goal',
    description: 'Test goal description',
    priority: 'high',
    dueDate: null,
    status: 'active',
    projectId: 1,
    flowId: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    project: mockProjects[0],
    tasks: [],
    notes: [],
    tags: [],
    flow: null,
  }
];

const mockTask: Task = {
  id: '1',
  title: 'Test Task',
  description: 'Test task description',
  status: 'pending',
  priority: 'medium',
  dueDate: '2024-12-31T00:00:00Z',
  goalId: 1,
  projectId: 1,
  flowId: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  goal: mockGoals[0],
  project: mockProjects[0],
  notes: [],
  tags: [],
  flow: null,
};

describe('TaskForm', () => {
  let mockOnSubmit: any;
  let mockOnCancel: any;

  beforeEach(() => {
    mockOnSubmit = vi.fn();
    mockOnCancel = vi.fn();
  });

  it('renders create form with empty fields', () => {
    render(TaskForm, {
      projects: mockProjects,
      goals: mockGoals,
      on_submit: mockOnSubmit,
      on_cancel: mockOnCancel,
    });

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/project/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/goal/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create task/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('renders edit form with pre-filled values', () => {
    render(TaskForm, {
      task: mockTask,
      projects: mockProjects,
      goals: mockGoals,
      on_submit: mockOnSubmit,
      on_cancel: mockOnCancel,
    });

    expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test task description')).toBeInTheDocument();
    expect(screen.getByDisplayValue('medium')).toBeInTheDocument();
    expect(screen.getByDisplayValue('pending')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update task/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(TaskForm, {
      projects: mockProjects,
      goals: mockGoals,
      on_submit: mockOnSubmit,
      on_cancel: mockOnCancel,
    });

    const submitButton = screen.getByRole('button', { name: /create task/i });
    await fireEvent.click(submitButton);

    expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    expect(screen.getByText(/priority is required/i)).toBeInTheDocument();
    expect(screen.getByText(/status is required/i)).toBeInTheDocument();
    expect(screen.getByText(/project is required/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits valid form data', async () => {
    render(TaskForm, {
      projects: mockProjects,
      goals: mockGoals,
      on_submit: mockOnSubmit,
      on_cancel: mockOnCancel,
    });

    // Fill form fields
    await fireEvent.input(screen.getByLabelText(/title/i), { target: { value: 'New Task' } });
    await fireEvent.input(screen.getByLabelText(/description/i), { target: { value: 'Task description' } });
    await fireEvent.change(screen.getByLabelText(/priority/i), { target: { value: 'high' } });
    await fireEvent.change(screen.getByLabelText(/status/i), { target: { value: 'pending' } });
    await fireEvent.change(screen.getByLabelText(/project/i), { target: { value: '1' } });
    await fireEvent.change(screen.getByLabelText(/goal/i), { target: { value: '1' } });
    await fireEvent.input(screen.getByLabelText(/due date/i), { target: { value: '2024-12-31' } });

    const submitButton = screen.getByRole('button', { name: /create task/i });
    await fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'New Task',
        description: 'Task description',
        priority: 'high',
        status: 'pending',
        projectId: 1,
        goalId: 1,
        dueDate: '2024-12-31T00:00:00.000Z',
      });
    });
  });
});