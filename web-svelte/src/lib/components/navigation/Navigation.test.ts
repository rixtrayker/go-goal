import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import Navigation from './Navigation.svelte';

// Mock SvelteKit navigation
vi.mock('$app/navigation', () => ({
  goto: vi.fn(),
}));

vi.mock('$app/stores', () => ({
  page: {
    subscribe: vi.fn((callback) => {
      callback({ url: { pathname: '/dashboard' } });
      return () => {};
    }),
  },
}));

describe('Navigation', () => {
  it('renders main navigation items', () => {
    render(Navigation);

    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/projects/i)).toBeInTheDocument();
    expect(screen.getByText(/goals/i)).toBeInTheDocument();
    expect(screen.getByText(/tasks/i)).toBeInTheDocument();
    expect(screen.getByText(/tags/i)).toBeInTheDocument();
  });

  it('highlights active navigation item', () => {
    render(Navigation);

    const dashboardLink = screen.getByText(/dashboard/i);
    expect(dashboardLink.parentElement).toHaveClass('active');
  });

  it('navigates to clicked route', async () => {
    const { goto } = await import('$app/navigation');
    render(Navigation);

    const projectsLink = screen.getByText(/projects/i);
    await fireEvent.click(projectsLink);

    expect(goto).toHaveBeenCalledWith('/projects');
  });

  it('displays user menu when user is logged in', () => {
    render(Navigation, {
      user: {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
      },
    });

    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('displays login button when user is not logged in', () => {
    render(Navigation);

    expect(screen.getByText(/login/i)).toBeInTheDocument();
  });

  it('toggles mobile menu', async () => {
    render(Navigation);

    const menuButton = screen.getByLabelText(/toggle menu/i);
    await fireEvent.click(menuButton);

    expect(screen.getByTestId('mobile-menu')).toHaveClass('open');
  });

  it('shows notification badge when there are notifications', () => {
    render(Navigation, {
      notification_count: 3,
    });

    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('3')).toHaveClass('notification-badge');
  });

  it('supports keyboard navigation', async () => {
    render(Navigation);

    const dashboardLink = screen.getByText(/dashboard/i);
    dashboardLink.focus();

    await fireEvent.keyDown(dashboardLink, { key: 'ArrowDown' });
    expect(screen.getByText(/projects/i)).toHaveFocus();

    await fireEvent.keyDown(screen.getByText(/projects/i), { key: 'ArrowUp' });
    expect(dashboardLink).toHaveFocus();
  });

  it('closes mobile menu when route changes', async () => {
    const { page } = await import('$app/stores');
    render(Navigation);

    const menuButton = screen.getByLabelText(/toggle menu/i);
    await fireEvent.click(menuButton);

    // Simulate route change
    page.subscribe = vi.fn((callback) => {
      callback({ url: { pathname: '/projects' } });
      return () => {};
    });

    expect(screen.getByTestId('mobile-menu')).not.toHaveClass('open');
  });
});