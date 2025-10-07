import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import ProjectForm from './ProjectForm.svelte';
import type { Project, Workspace, CreateProjectInput } from '$lib/types/graphql';

// Mock data
const mockWorkspaces: Workspace[] = [
  {
    id: '1',
    name: 'Test Workspace',
    description: 'Test workspace description',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    projects: [],
    flows: [],
  }
];

const mockProject: Project = {
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
};

describe('ProjectForm', () => {
  let mockOnSubmit: any;
  let mockOnCancel: any;

  beforeEach(() => {
    mockOnSubmit = vi.fn();
    mockOnCancel = vi.fn();
  });

  it('renders create form with empty fields', () => {
    render(ProjectForm, {
      workspaces: mockWorkspaces,
      on_submit: mockOnSubmit,
      on_cancel: mockOnCancel,
    });

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/workspace/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create project/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('renders edit form with pre-filled values', () => {
    render(ProjectForm, {
      project: mockProject,
      workspaces: mockWorkspaces,
      on_submit: mockOnSubmit,
      on_cancel: mockOnCancel,
    });

    expect(screen.getByDisplayValue('Test Project')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test project description')).toBeInTheDocument();
    expect(screen.getByDisplayValue('active')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update project/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(ProjectForm, {
      workspaces: mockWorkspaces,
      on_submit: mockOnSubmit,
      on_cancel: mockOnCancel,
    });

    const submitButton = screen.getByRole('button', { name: /create project/i });
    await fireEvent.click(submitButton);

    expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    expect(screen.getByText(/status is required/i)).toBeInTheDocument();
    expect(screen.getByText(/workspace is required/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits valid form data', async () => {
    render(ProjectForm, {
      workspaces: mockWorkspaces,
      on_submit: mockOnSubmit,
      on_cancel: mockOnCancel,
    });

    // Fill form fields
    await fireEvent.input(screen.getByLabelText(/title/i), { target: { value: 'New Project' } });
    await fireEvent.input(screen.getByLabelText(/description/i), { target: { value: 'Project description' } });
    await fireEvent.change(screen.getByLabelText(/status/i), { target: { value: 'active' } });
    await fireEvent.change(screen.getByLabelText(/workspace/i), { target: { value: '1' } });

    const submitButton = screen.getByRole('button', { name: /create project/i });
    await fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'New Project',
        description: 'Project description',
        status: 'active',
        workspaceId: 1,
      });
    });
  });

  it('calls cancel handler when cancel button is clicked', async () => {
    render(ProjectForm, {
      workspaces: mockWorkspaces,
      on_submit: mockOnSubmit,
      on_cancel: mockOnCancel,
    });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });
});