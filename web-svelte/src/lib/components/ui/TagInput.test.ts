import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import TagInput from './TagInput.svelte';
import type { Tag } from '$lib/types/graphql';

// Mock data
const mockTags: Tag[] = [
  {
    id: '1',
    name: 'urgent',
    color: '#ff0000',
    parentId: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    parent: null,
    children: [],
    projects: [],
    goals: [],
    tasks: [],
    notes: [],
  },
  {
    id: '2',
    name: 'feature',
    color: '#00ff00',
    parentId: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    parent: null,
    children: [],
    projects: [],
    goals: [],
    tasks: [],
    notes: [],
  },
  {
    id: '3',
    name: 'bug',
    color: '#0000ff',
    parentId: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    parent: null,
    children: [],
    projects: [],
    goals: [],
    tasks: [],
    notes: [],
  },
];

const mockSelectedTags: Tag[] = [mockTags[0]];

describe('TagInput', () => {
  let mockOnTagsChange: any;
  let mockOnTagCreate: any;

  beforeEach(() => {
    mockOnTagsChange = vi.fn();
    mockOnTagCreate = vi.fn();
  });

  it('renders with initial selected tags', () => {
    render(TagInput, {
      available_tags: mockTags,
      selected_tags: mockSelectedTags,
      on_tags_change: mockOnTagsChange,
      on_tag_create: mockOnTagCreate,
    });

    expect(screen.getByText('urgent')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/add tags/i)).toBeInTheDocument();
  });

  it('shows dropdown when typing', async () => {
    render(TagInput, {
      available_tags: mockTags,
      selected_tags: [],
      on_tags_change: mockOnTagsChange,
      on_tag_create: mockOnTagCreate,
    });

    const input = screen.getByPlaceholderText(/add tags/i);
    await fireEvent.input(input, { target: { value: 'fea' } });

    await waitFor(() => {
      expect(screen.getByText('feature')).toBeInTheDocument();
    });
  });

  it('filters tags based on input', async () => {
    render(TagInput, {
      available_tags: mockTags,
      selected_tags: [],
      on_tags_change: mockOnTagsChange,
      on_tag_create: mockOnTagCreate,
    });

    const input = screen.getByPlaceholderText(/add tags/i);
    await fireEvent.input(input, { target: { value: 'bug' } });

    await waitFor(() => {
      expect(screen.getByText('bug')).toBeInTheDocument();
      expect(screen.queryByText('feature')).not.toBeInTheDocument();
      expect(screen.queryByText('urgent')).not.toBeInTheDocument();
    });
  });

  it('adds tag when clicked from dropdown', async () => {
    render(TagInput, {
      available_tags: mockTags,
      selected_tags: [],
      on_tags_change: mockOnTagsChange,
      on_tag_create: mockOnTagCreate,
    });

    const input = screen.getByPlaceholderText(/add tags/i);
    await fireEvent.input(input, { target: { value: 'fea' } });

    await waitFor(() => {
      const featureTag = screen.getByText('feature');
      fireEvent.click(featureTag);
    });

    expect(mockOnTagsChange).toHaveBeenCalledWith([mockTags[1]]);
  });

  it('removes tag when remove button is clicked', async () => {
    render(TagInput, {
      available_tags: mockTags,
      selected_tags: mockSelectedTags,
      on_tags_change: mockOnTagsChange,
      on_tag_create: mockOnTagCreate,
    });

    const removeButton = screen.getByLabelText(/remove urgent tag/i);
    await fireEvent.click(removeButton);

    expect(mockOnTagsChange).toHaveBeenCalledWith([]);
  });

  it('creates new tag when not found in available tags', async () => {
    render(TagInput, {
      available_tags: mockTags,
      selected_tags: [],
      on_tags_change: mockOnTagsChange,
      on_tag_create: mockOnTagCreate,
    });

    const input = screen.getByPlaceholderText(/add tags/i);
    await fireEvent.input(input, { target: { value: 'newtag' } });
    await fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockOnTagCreate).toHaveBeenCalledWith('newtag');
  });

  it('handles keyboard navigation in dropdown', async () => {
    render(TagInput, {
      available_tags: mockTags,
      selected_tags: [],
      on_tags_change: mockOnTagsChange,
      on_tag_create: mockOnTagCreate,
    });

    const input = screen.getByPlaceholderText(/add tags/i);
    await fireEvent.input(input, { target: { value: 'u' } });

    // Arrow down to select first item
    await fireEvent.keyDown(input, { key: 'ArrowDown' });
    await fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockOnTagsChange).toHaveBeenCalledWith([mockTags[0]]);
  });

  it('prevents duplicate tags', async () => {
    render(TagInput, {
      available_tags: mockTags,
      selected_tags: mockSelectedTags,
      on_tags_change: mockOnTagsChange,
      on_tag_create: mockOnTagCreate,
    });

    const input = screen.getByPlaceholderText(/add tags/i);
    await fireEvent.input(input, { target: { value: 'urgent' } });

    await waitFor(() => {
      // Should not show already selected tag in dropdown
      expect(screen.queryByText('urgent')).not.toBeInTheDocument();
    });
  });

  it('displays tag colors correctly', () => {
    render(TagInput, {
      available_tags: mockTags,
      selected_tags: mockSelectedTags,
      on_tags_change: mockOnTagsChange,
      on_tag_create: mockOnTagCreate,
    });

    const tagElement = screen.getByText('urgent').parentElement;
    expect(tagElement).toHaveStyle({ backgroundColor: '#ff0000' });
  });
});