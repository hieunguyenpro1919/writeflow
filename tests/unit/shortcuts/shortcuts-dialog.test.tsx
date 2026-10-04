import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import type { Editor } from '@tiptap/core';
import { ShortcutsDialog } from '../../../src/components/shortcuts/ShortcutsDialog';
import { shortcutsDialogManager } from '../../../src/components/shortcuts/shortcuts-dialog-manager';
import { createCommandRegistry } from '../../../src/core/commands/registry';
import { helpShortcutsCommand } from '../../../src/core/commands/definitions/help';
import { coreCommands } from '../../../src/core/commands/definitions';
import type { CommandDef } from '../../../src/core/commands/types';

function createMockEditor(): Editor {
  return {
    state: {
      doc: {
        content: { size: 0 },
        textBetween: () => '',
      },
    },
    on: vi.fn(),
    off: vi.fn(),
    commands: {
      focus: vi.fn(),
    },
  } as unknown as Editor;
}

describe('Task 1.12: ShortcutsDialog & help.shortcuts Command', () => {
  let mockEditor: Editor;

  beforeEach(() => {
    vi.useFakeTimers();
    mockEditor = createMockEditor();
    shortcutsDialogManager.close();
  });

  afterEach(() => {
    act(() => {
      shortcutsDialogManager.close();
    });
    vi.useRealTimers();
  });

  describe('help.shortcuts command definition', () => {
    it('has id "help.shortcuts" and Mod-/ default shortcut', () => {
      expect(helpShortcutsCommand.id).toBe('help.shortcuts');
      expect(helpShortcutsCommand.category).toBe('help');
      expect(helpShortcutsCommand.defaultShortcut?.win).toBe('Mod-/');
      expect(helpShortcutsCommand.defaultShortcut?.mac).toBe('Mod-/');
    });

    it('triggers ui.openShortcutsDialog when run', () => {
      const openSpy = vi.fn();
      const mockCtx = {
        editor: mockEditor,
        ui: {
          openShortcutsDialog: openSpy,
          notify: vi.fn(),
        },
      };

      const result = helpShortcutsCommand.run(mockCtx);
      expect(result).toBe(true);
      expect(openSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('ShortcutsDialog Component', () => {
    it('renders nothing when closed', () => {
      render(<ShortcutsDialog editor={mockEditor} />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('opens when shortcutsDialogManager.open() is called and has dialog ARIA attributes', () => {
      render(<ShortcutsDialog editor={mockEditor} />);

      act(() => {
        shortcutsDialogManager.open();
        vi.runAllTimers();
      });

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'shortcuts-dialog-title');
      expect(screen.getByTestId('shortcuts-dialog-title')).toHaveTextContent('Phím tắt');
    });

    it('dynamically displays ANY command registered in the CommandRegistry without UI changes (DoD)', () => {
      const customRegistry = createCommandRegistry();
      const customCmd: CommandDef = {
        id: 'custom.specialAction',
        labelKey: 'custom.action.title',
        category: 'format',
        defaultShortcut: { win: 'Mod-Alt-K', mac: 'Mod-Alt-K' },
        run: () => true,
      };
      customRegistry.register(customCmd);

      render(
        <ShortcutsDialog
          editor={mockEditor}
          registry={customRegistry}
          platform="win"
          isOpen={true}
        />
      );

      // The new command row exists automatically
      const row = screen.getByTestId('shortcut-row-custom.specialAction');
      expect(row).toBeInTheDocument();
      expect(screen.getByText('Ctrl+Alt+K')).toBeInTheDocument();
    });

    it('displays platform-specific formatted shortcuts for Windows and macOS', () => {
      const reg = createCommandRegistry();
      for (const cmd of coreCommands) {
        reg.register(cmd);
      }

      // 1. Windows test
      const { unmount } = render(
        <ShortcutsDialog editor={mockEditor} registry={reg} platform="win" isOpen={true} />
      );

      // Bold on Windows should be Ctrl+B
      const boldRowWin = screen.getByTestId('shortcut-row-format.bold');
      expect(boldRowWin).toHaveTextContent('Ctrl+B');

      // Redo on Windows should display both Ctrl+Y and Ctrl+Shift+Z
      const redoRowWin = screen.getByTestId('shortcut-row-edit.redo');
      expect(redoRowWin).toHaveTextContent('Ctrl+Y');
      expect(redoRowWin).toHaveTextContent('Ctrl+Shift+Z');

      unmount();

      // 2. macOS test
      render(
        <ShortcutsDialog editor={mockEditor} registry={reg} platform="mac" isOpen={true} />
      );

      // Bold on macOS should be ⌘B
      const boldRowMac = screen.getByTestId('shortcut-row-format.bold');
      expect(boldRowMac).toHaveTextContent('⌘B');

      // Redo on macOS should display ⌘⇧Z
      const redoRowMac = screen.getByTestId('shortcut-row-edit.redo');
      expect(redoRowMac).toHaveTextContent('⌘⇧Z');
    });

    it('filters commands via the search input by label, id, and shortcut', () => {
      const reg = createCommandRegistry();
      for (const cmd of coreCommands) {
        reg.register(cmd);
      }

      render(
        <ShortcutsDialog editor={mockEditor} registry={reg} platform="win" isOpen={true} />
      );

      const searchInput = screen.getByTestId('shortcuts-search-input');

      // 1. Search by label or id: "In đậm"
      fireEvent.change(searchInput, { target: { value: 'In đậm' } });
      expect(screen.getByTestId('shortcut-row-format.bold')).toBeInTheDocument();
      expect(screen.queryByTestId('shortcut-row-format.italic')).not.toBeInTheDocument();

      // 2. Search by shortcut: "Ctrl+Z"
      fireEvent.change(searchInput, { target: { value: 'Ctrl+Z' } });
      expect(screen.getByTestId('shortcut-row-edit.undo')).toBeInTheDocument();
      expect(screen.queryByTestId('shortcut-row-format.bold')).not.toBeInTheDocument();

      // 3. Search nonexistent term displays empty state
      fireEvent.change(searchInput, { target: { value: 'nonexistent-term-xyz' } });
      expect(screen.getByTestId('shortcuts-empty')).toHaveTextContent(
        'Không tìm thấy phím tắt phù hợp'
      );
    });

    it('traps focus inside the dialog when navigating with Tab and Shift+Tab', () => {
      render(<ShortcutsDialog editor={mockEditor} isOpen={true} />);

      const closeBtn = screen.getByTestId('shortcuts-close-btn');
      const searchInput = screen.getByTestId('shortcuts-search-input');

      // Focusable order in DOM: [closeBtn (first), searchInput (last)]
      // 1. Focus the last element (searchInput)
      searchInput.focus();
      expect(document.activeElement).toBe(searchInput);

      // Pressing Tab on the last element wraps back to the first element (closeBtn)
      fireEvent.keyDown(window, { key: 'Tab' });
      expect(document.activeElement).toBe(closeBtn);

      // 2. Pressing Shift+Tab on the first element (closeBtn) wraps back to the last element (searchInput)
      fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });
      expect(document.activeElement).toBe(searchInput);
    });

    it('closes on Escape key press and returns focus to editor', () => {
      render(<ShortcutsDialog editor={mockEditor} />);

      act(() => {
        shortcutsDialogManager.open();
        vi.runAllTimers();
      });

      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Press Escape
      fireEvent.keyDown(window, { key: 'Escape' });

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(mockEditor.commands.focus).toHaveBeenCalled();
    });

    it('closes on Ctrl+/ or Cmd+/ and returns focus to editor', () => {
      render(<ShortcutsDialog editor={mockEditor} />);

      act(() => {
        shortcutsDialogManager.open();
        vi.runAllTimers();
      });

      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Press Ctrl+/
      fireEvent.keyDown(window, { key: '/', ctrlKey: true });

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(mockEditor.commands.focus).toHaveBeenCalled();
    });

    it('closes when close button is clicked and returns focus to editor', () => {
      render(<ShortcutsDialog editor={mockEditor} />);

      act(() => {
        shortcutsDialogManager.open();
        vi.runAllTimers();
      });

      const closeBtn = screen.getByTestId('shortcuts-close-btn');
      fireEvent.click(closeBtn);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(mockEditor.commands.focus).toHaveBeenCalled();
    });

    it('closes when clicking on the backdrop and returns focus to editor', () => {
      render(<ShortcutsDialog editor={mockEditor} />);

      act(() => {
        shortcutsDialogManager.open();
        vi.runAllTimers();
      });

      const backdrop = screen.getByTestId('shortcuts-backdrop');
      fireEvent.click(backdrop);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(mockEditor.commands.focus).toHaveBeenCalled();
    });

    it('opens dialog when clicking the Shortcuts button in StatusBar', async () => {
      const { StatusBar } = await import('../../../src/components/status/StatusBar');
      render(
        <div>
          <StatusBar editor={mockEditor} />
          <ShortcutsDialog editor={mockEditor} />
        </div>
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      const btn = screen.getByTestId('status-shortcuts-btn');
      fireEvent.click(btn);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
});
