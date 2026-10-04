import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ToastHost } from '../../../src/components/ui/ToastHost';
import { toastManager, createUiBridge } from '../../../src/components/ui/toast-manager';

describe('Task 1.4: UiBridge & ToastHost', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    toastManager.clear();
  });

  afterEach(() => {
    act(() => {
      toastManager.clear();
    });
    vi.useRealTimers();
  });

  it('renders nothing when there are no active toasts', async () => {
    await act(async () => {
      render(<ToastHost />);
    });
    expect(screen.queryByTestId('toast-host')).not.toBeInTheDocument();
  });

  it('displays a notification translated via i18n when notify is called', async () => {
    await act(async () => {
      render(<ToastHost />);
    });

    act(() => {
      toastManager.notify('hint.unsupportedFormat');
    });

    const host = screen.getByTestId('toast-host');
    expect(host).toBeInTheDocument();
    expect(host).toHaveAttribute('role', 'status');
    expect(host).toHaveAttribute('aria-live', 'polite');

    expect(screen.getByText('Định dạng này không được hỗ trợ trong Markdown')).toBeInTheDocument();
  });

  it('auto-dismisses toast after 3500ms', async () => {
    await act(async () => {
      render(<ToastHost />);
    });

    act(() => {
      toastManager.notify('hint.unsupportedFormat');
    });

    expect(screen.getByTestId('toast-item')).toBeInTheDocument();

    // Fast-forward 3400ms (still visible)
    act(() => {
      vi.advanceTimersByTime(3400);
    });
    expect(screen.getByTestId('toast-item')).toBeInTheDocument();

    // Fast-forward past 3500ms
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.queryByTestId('toast-item')).not.toBeInTheDocument();
    expect(screen.queryByTestId('toast-host')).not.toBeInTheDocument();
  });

  it('supports multiple consecutive notifications without stacking errors', async () => {
    await act(async () => {
      render(<ToastHost />);
    });

    act(() => {
      toastManager.notify('app.name');
      toastManager.notify('app.tagline');
    });

    const items = screen.getAllByTestId('toast-item');
    expect(items).toHaveLength(2);
    expect(screen.getByText('WriteFlow')).toBeInTheDocument();
    expect(screen.getByText('Trình soạn thảo Markdown WYSIWYG')).toBeInTheDocument();

    // Dismiss first one manually or through timeout
    act(() => {
      vi.advanceTimersByTime(3600);
    });
    expect(screen.queryByTestId('toast-item')).not.toBeInTheDocument();
  });

  it('createUiBridge delegates notify to toastManager', async () => {
    await act(async () => {
      render(<ToastHost />);
    });
    const bridge = createUiBridge();

    act(() => {
      bridge.notify('app.name');
    });

    expect(screen.getByText('WriteFlow')).toBeInTheDocument();
  });
});
