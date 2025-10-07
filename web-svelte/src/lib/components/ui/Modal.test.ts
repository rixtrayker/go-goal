import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import Modal from './Modal.svelte';

describe('Modal', () => {
  let mockOnClose: any;

  beforeEach(() => {
    mockOnClose = vi.fn();
  });

  it('renders when open', () => {
    render(
      Modal,
      {
        is_open: true,
        title: 'Test Modal',
        on_close: mockOnClose,
      },
      { default: 'Modal content' }
    );

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
    expect(screen.getByLabelText(/close modal/i)).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      Modal,
      {
        is_open: false,
        title: 'Test Modal',
        on_close: mockOnClose,
      },
      { default: 'Modal content' }
    );

    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    render(
      Modal,
      {
        is_open: true,
        title: 'Test Modal',
        on_close: mockOnClose,
      },
      { default: 'Modal content' }
    );

    const closeButton = screen.getByLabelText(/close modal/i);
    await fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when overlay is clicked', async () => {
    render(
      Modal,
      {
        is_open: true,
        title: 'Test Modal',
        on_close: mockOnClose,
      },
      { default: 'Modal content' }
    );

    const overlay = screen.getByTestId('modal-overlay');
    await fireEvent.click(overlay);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when modal content is clicked', async () => {
    render(
      Modal,
      {
        is_open: true,
        title: 'Test Modal',
        on_close: mockOnClose,
      },
      { default: 'Modal content' }
    );

    const modalContent = screen.getByText('Modal content');
    await fireEvent.click(modalContent);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('closes when Escape key is pressed', async () => {
    render(
      Modal,
      {
        is_open: true,
        title: 'Test Modal',
        on_close: mockOnClose,
      },
      { default: 'Modal content' }
    );

    await fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('renders with custom size', () => {
    render(
      Modal,
      {
        is_open: true,
        title: 'Test Modal',
        size: 'large',
        on_close: mockOnClose,
      },
      { default: 'Modal content' }
    );

    const modalDialog = screen.getByRole('dialog');
    expect(modalDialog).toHaveClass('modal__dialog--large');
  });

  it('renders with footer content', () => {
    render(
      Modal,
      {
        is_open: true,
        title: 'Test Modal',
        on_close: mockOnClose,
      },
      {
        default: 'Modal content',
        footer: 'Footer content',
      }
    );

    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });

  it('prevents background scroll when open', () => {
    render(
      Modal,
      {
        is_open: true,
        title: 'Test Modal',
        on_close: mockOnClose,
      },
      { default: 'Modal content' }
    );

    expect(document.body).toHaveStyle({ overflow: 'hidden' });
  });

  it('restores background scroll when closed', async () => {
    const { component } = render(
      Modal,
      {
        is_open: true,
        title: 'Test Modal',
        on_close: mockOnClose,
      },
      { default: 'Modal content' }
    );

    // Close the modal
    component.$set({ is_open: false });

    await waitFor(() => {
      expect(document.body).not.toHaveStyle({ overflow: 'hidden' });
    });
  });

  it('focuses first focusable element when opened', async () => {
    render(
      Modal,
      {
        is_open: true,
        title: 'Test Modal',
        on_close: mockOnClose,
      },
      { default: '<button>First button</button><button>Second button</button>' }
    );

    await waitFor(() => {
      expect(screen.getByText('First button')).toHaveFocus();
    });
  });

  it('traps focus within modal', async () => {
    render(
      Modal,
      {
        is_open: true,
        title: 'Test Modal',
        on_close: mockOnClose,
      },
      { default: '<button>First button</button><button>Second button</button>' }
    );

    const firstButton = screen.getByText('First button');
    const secondButton = screen.getByText('Second button');
    const closeButton = screen.getByLabelText(/close modal/i);

    // Tab forward
    await fireEvent.keyDown(firstButton, { key: 'Tab' });
    expect(secondButton).toHaveFocus();

    await fireEvent.keyDown(secondButton, { key: 'Tab' });
    expect(closeButton).toHaveFocus();

    // Tab from last element should go to first
    await fireEvent.keyDown(closeButton, { key: 'Tab' });
    expect(firstButton).toHaveFocus();

    // Shift+Tab backward
    await fireEvent.keyDown(firstButton, { key: 'Tab', shiftKey: true });
    expect(closeButton).toHaveFocus();
  });
});