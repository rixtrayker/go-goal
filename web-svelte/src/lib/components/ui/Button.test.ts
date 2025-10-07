import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import Button from './Button.svelte';

describe('Button', () => {
  let mockOnClick: any;

  beforeEach(() => {
    mockOnClick = vi.fn();
  });

  it('renders with default props', () => {
    render(Button, { on_click: mockOnClick }, { default: 'Click me' });

    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('button');
    expect(button).toHaveClass('button--primary');
    expect(button).toHaveClass('button--medium');
  });

  it('renders with custom variant', () => {
    render(Button, { variant: 'secondary', on_click: mockOnClick }, { default: 'Click me' });

    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toHaveClass('button--secondary');
  });

  it('renders with custom size', () => {
    render(Button, { size: 'large', on_click: mockOnClick }, { default: 'Click me' });

    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toHaveClass('button--large');
  });

  it('renders in disabled state', () => {
    render(Button, { disabled: true, on_click: mockOnClick }, { default: 'Click me' });

    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeDisabled();
    expect(button).toHaveClass('button--disabled');
  });

  it('renders in loading state', () => {
    render(Button, { is_loading: true, on_click: mockOnClick }, { default: 'Click me' });

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('button--loading');
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', async () => {
    render(Button, { on_click: mockOnClick }, { default: 'Click me' });

    const button = screen.getByRole('button', { name: 'Click me' });
    await fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', async () => {
    render(Button, { disabled: true, on_click: mockOnClick }, { default: 'Click me' });

    const button = screen.getByRole('button', { name: 'Click me' });
    await fireEvent.click(button);

    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('does not call onClick when loading', async () => {
    render(Button, { is_loading: true, on_click: mockOnClick }, { default: 'Click me' });

    const button = screen.getByRole('button');
    await fireEvent.click(button);

    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('renders with icon', () => {
    render(Button, { icon: 'plus', on_click: mockOnClick }, { default: 'Add Item' });

    expect(screen.getByTestId('button-icon')).toBeInTheDocument();
    expect(screen.getByText('Add Item')).toBeInTheDocument();
  });

  it('renders icon-only button', () => {
    render(Button, { icon: 'settings', icon_only: true, 'aria-label': 'Settings', on_click: mockOnClick });

    const button = screen.getByRole('button', { name: 'Settings' });
    expect(button).toHaveClass('button--icon-only');
    expect(screen.getByTestId('button-icon')).toBeInTheDocument();
  });

  it('applies custom CSS classes', () => {
    render(Button, { class: 'custom-class', on_click: mockOnClick }, { default: 'Click me' });

    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toHaveClass('custom-class');
  });

  it('supports keyboard interaction', async () => {
    render(Button, { on_click: mockOnClick }, { default: 'Click me' });

    const button = screen.getByRole('button', { name: 'Click me' });
    button.focus();

    await fireEvent.keyDown(button, { key: 'Enter' });
    expect(mockOnClick).toHaveBeenCalledTimes(1);

    await fireEvent.keyDown(button, { key: ' ' });
    expect(mockOnClick).toHaveBeenCalledTimes(2);
  });

  it('renders with danger variant', () => {
    render(Button, { variant: 'danger', on_click: mockOnClick }, { default: 'Delete' });

    const button = screen.getByRole('button', { name: 'Delete' });
    expect(button).toHaveClass('button--danger');
  });

  it('renders with ghost variant', () => {
    render(Button, { variant: 'ghost', on_click: mockOnClick }, { default: 'Cancel' });

    const button = screen.getByRole('button', { name: 'Cancel' });
    expect(button).toHaveClass('button--ghost');
  });
});