import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import Card from './Card.svelte';

describe('Card', () => {
  it('renders with default props', () => {
    render(Card, {}, { default: 'Card content' });

    const card = screen.getByTestId('card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('card');
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders with title', () => {
    render(Card, { title: 'Card Title' }, { default: 'Card content' });

    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders with custom variant', () => {
    render(Card, { variant: 'outlined' }, { default: 'Card content' });

    const card = screen.getByTestId('card');
    expect(card).toHaveClass('card--outlined');
  });

  it('renders with elevated variant', () => {
    render(Card, { variant: 'elevated' }, { default: 'Card content' });

    const card = screen.getByTestId('card');
    expect(card).toHaveClass('card--elevated');
  });

  it('renders as clickable when onClick is provided', () => {
    const mockOnClick = vi.fn();
    render(Card, { on_click: mockOnClick }, { default: 'Card content' });

    const card = screen.getByTestId('card');
    expect(card).toHaveClass('card--clickable');
    expect(card).toHaveAttribute('role', 'button');
    expect(card).toHaveAttribute('tabindex', '0');
  });

  it('calls onClick when clicked', async () => {
    const mockOnClick = vi.fn();
    render(Card, { on_click: mockOnClick }, { default: 'Card content' });

    const card = screen.getByTestId('card');
    await fireEvent.click(card);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('calls onClick when Enter key is pressed', async () => {
    const mockOnClick = vi.fn();
    render(Card, { on_click: mockOnClick }, { default: 'Card content' });

    const card = screen.getByTestId('card');
    card.focus();
    await fireEvent.keyDown(card, { key: 'Enter' });

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('calls onClick when Space key is pressed', async () => {
    const mockOnClick = vi.fn();
    render(Card, { on_click: mockOnClick }, { default: 'Card content' });

    const card = screen.getByTestId('card');
    card.focus();
    await fireEvent.keyDown(card, { key: ' ' });

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('renders with header slot', () => {
    render(
      Card,
      {},
      {
        default: 'Card content',
        header: '<div>Custom header</div>',
      }
    );

    expect(screen.getByText('Custom header')).toBeInTheDocument();
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders with footer slot', () => {
    render(
      Card,
      {},
      {
        default: 'Card content',
        footer: '<div>Custom footer</div>',
      }
    );

    expect(screen.getByText('Card content')).toBeInTheDocument();
    expect(screen.getByText('Custom footer')).toBeInTheDocument();
  });

  it('renders with actions slot', () => {
    render(
      Card,
      { title: 'Card Title' },
      {
        default: 'Card content',
        actions: '<button>Action</button>',
      }
    );

    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card content')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });

  it('applies custom CSS classes', () => {
    render(Card, { class: 'custom-class' }, { default: 'Card content' });

    const card = screen.getByTestId('card');
    expect(card).toHaveClass('custom-class');
  });

  it('renders with padding variant', () => {
    render(Card, { padding: 'large' }, { default: 'Card content' });

    const card = screen.getByTestId('card');
    expect(card).toHaveClass('card--padding-large');
  });

  it('renders without padding', () => {
    render(Card, { padding: 'none' }, { default: 'Card content' });

    const card = screen.getByTestId('card');
    expect(card).toHaveClass('card--padding-none');
  });

  it('renders in disabled state', () => {
    const mockOnClick = vi.fn();
    render(Card, { disabled: true, on_click: mockOnClick }, { default: 'Card content' });

    const card = screen.getByTestId('card');
    expect(card).toHaveClass('card--disabled');
    expect(card).not.toHaveAttribute('tabindex');
  });

  it('does not call onClick when disabled', async () => {
    const mockOnClick = vi.fn();
    render(Card, { disabled: true, on_click: mockOnClick }, { default: 'Card content' });

    const card = screen.getByTestId('card');
    await fireEvent.click(card);

    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('renders with loading state', () => {
    render(Card, { is_loading: true }, { default: 'Card content' });

    const card = screen.getByTestId('card');
    expect(card).toHaveClass('card--loading');
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});