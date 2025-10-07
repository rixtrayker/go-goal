import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import GoalForm from './GoalForm.svelte';
import type { Goal, Project, CreateGoalInput } from '$lib/types/graphql';

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

const mockGoal: Goal = {
  id: '1',
  title: 'Test Goal',
  description: 'Test goal description',
  priority: 'high',
  dueDate: '2024-12-31T00:00:00Z',
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
};

describe('GoalForm', () => {
  let mockOnSubmit: any;
  let mockOnCancel: any;

  beforeEach(() => {
    mockOnSubmit = vi.fn();
    mockOnCancel = vi.fn();
  });

  it('renders create form with empty fields', () => {
    render(GoalForm, {
      projects: mockProjects,
      on_submit: mockOnSubmit,
      on_cancel: mockOnCancel,
    });

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/project/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create goal/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('renders edit form with pre-filled values', () => {
    render(GoalForm, {
      goal: mockGoal,
      projects: mockProjects,
      on_submit: mockOnSubmit,
      on_cancel: mockOnCancel,
    });

    expect(screen.getByDisplayValue('Test Goal')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test goal description')).toBeInTheDocument();
    expect(screen.getByDisplayValue('high')).toBeInTheDocument();
    expect(screen.getByDisplayValue('active')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update goal/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(GoalForm, {
      projects: mockProjects,
      on_submit: mockOnSubmit,
      on_cancel: mockOnCancel,
    });

    const submitButton = screen.getByRole('button', { name: /create goal/i });
    await fireEvent.click(submitButton);

    expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    expect(screen.getByText(/priority is required/i)).toBeInTheDocument();
    expect(screen.getByText(/status is required/i)).toBeInTheDocument();
    expect(screen.getByText(/project is required/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits valid form data', async () => {
    render(GoalForm, {
      projects: mockProjects,
      on_submit: mockOnSubmit,
      on_cancel: mockOnCancel,
    });

    // Fill form fields
    await fireEvent.input(screen.getByLabelText(/title/i), { target: { value: 'New Goal' } });
    await fireEvent.input(screen.getByLabelText(/description/i), { target: { value: 'Goal description' } });
    await fireEvent.change(screen.getByLabelText(/priority/i), { target: { value: 'high' } });
    await fireEvent.change(screen.getByLabelText(/status/i), { target: { value: 'active' } });
    await fireEvent.change(screen.getByLabelText(/project/i), { target: { value: '1' } });
    await fireEvent.input(screen.getByLabelText(/due date/i), { target: { value: '2024-12-31' } });

    const submitButton = screen.getByRole('button', { name: /create goal/i });
    await fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'New Goal',
        description: 'Goal description',
        priority: 'high',
        status: 'active',
        projectId: 1,
        dueDate: '2024-12-31T00:00:00.000Z',
      });
    });
  });

  it('calls cancel handler when cancel button is clicked', async () => {
    render(GoalForm, {
      projects: mockProjects,
      on_submit: mockOnSubmit,
      on_cancel: mockOnCancel,
    });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('displays loading state during submission', async () => {
    render(GoalForm, {
      projects: mockProjects,
      is_loading: true,
      on_submit: mockOnSubmit,
      on_cancel: mockOnCancel,
    });

    const submitButton = screen.getByRole('button', { name: /creating.../i });
    expect(submitButton).toBeDisabled();
  });

  it('displays validation errors', () => {
    const errors = {
      title: 'Title must be at least 3 characters',
      priority: 'Invalid priority value',
    };

    render(GoalForm, {
      projects: mockProjects,
      errors,
      on_submit: mockOnSubmit,
      on_cancel: mockOnCancel,
    });

    expect(screen.getByText('Title must be at least 3 characters')).toBeInTheDocument();
    expect(screen.getByText('Invalid priority value')).toBeInTheDocument();
  });
});