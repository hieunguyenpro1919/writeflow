import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from '../../src/App';
import { defaultCommandRegistry } from '../../src/core/commands/registry';
import { shortcutsDialogManager } from '../../src/components/shortcuts/shortcuts-dialog-manager';

describe('App Shell & Command System Integration', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    shortcutsDialogManager.close();
  });

  afterEach(() => {
    act(() => {
      shortcutsDialogManager.close();
    });
    vi.useRealTimers();
  });

  it('renders application header with localized title and tagline', () => {
    render(<App />);
    expect(screen.getByText('WriteFlow')).toBeInTheDocument();
    expect(screen.getByText('Trình soạn thảo Markdown WYSIWYG')).toBeInTheDocument();
  });

  it('renders the editor paper inside the main viewport', () => {
    render(<App />);
    expect(screen.getByTestId('editor-paper')).toBeInTheDocument();
  });

  it('initializes CommandRegistry with exactly 14 core commands on App load', () => {
    render(<App />);

    const commands = defaultCommandRegistry.list();
    expect(commands).toHaveLength(14);

    const expectedIds = [
      'format.bold',
      'format.italic',
      'format.strike',
      'format.code',
      'block.paragraph',
      'block.heading1',
      'block.heading2',
      'block.heading3',
      'block.bulletList',
      'block.orderedList',
      'block.blockquote',
      'edit.undo',
      'edit.redo',
      'help.shortcuts',
    ];

    for (const id of expectedIds) {
      expect(defaultCommandRegistry.get(id), `Missing command: ${id}`).toBeDefined();
    }
  });

  it('opens ShortcutsDialog from StatusBar button and populates all 14 commands without being empty', () => {
    render(<App />);

    // Initially dialog is not mounted
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Click shortcuts button in StatusBar
    const shortcutsBtn = screen.getByTestId('status-shortcuts-btn');
    fireEvent.click(shortcutsBtn);

    act(() => {
      vi.runAllTimers();
    });

    // Dialog is visible
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.queryByTestId('shortcuts-empty')).not.toBeInTheDocument();

    // All 14 commands are rendered
    const rows = screen.getAllByRole('listitem');
    expect(rows).toHaveLength(14);
  });
});
