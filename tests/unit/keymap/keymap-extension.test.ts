import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Editor } from '@tiptap/core';
import { createExtensions } from '../../../src/core/editor/extensions';
import { createCommandRegistry } from '../../../src/core/commands/registry';
import { coreCommands } from '../../../src/core/commands/definitions';
import type { UiBridge } from '../../../src/core/commands/types';

describe('Task 1.8: Keymap Extension & IME Protection', () => {
  let editor: Editor;
  let mockUi: UiBridge;

  beforeEach(() => {
    mockUi = {
      openShortcutsDialog: vi.fn(),
      notify: vi.fn(),
    };

    const registry = createCommandRegistry();
    for (const cmd of coreCommands) {
      registry.register(cmd);
    }

    editor = new Editor({
      extensions: createExtensions({
        registry,
        platform: 'win',
        ui: mockUi,
      }),
      content: '<p>Nội dung thử nghiệm phím tắt</p>',
    });
  });

  afterEach(() => {
    editor.destroy();
  });

  function dispatchKeydown(target: HTMLElement, init: KeyboardEventInit): boolean {
    const event = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      ...init,
    });
    return target.dispatchEvent(event);
  }

  describe('Phím định dạng cơ bản', () => {
    it('executes Mod-b to toggle bold on selection', () => {
      // "Nội dung" is 8 characters long, positions 1 to 9
      editor.commands.setTextSelection({ from: 1, to: 9 });
      expect(editor.isActive('bold')).toBe(false);

      dispatchKeydown(editor.view.dom, {
        key: 'b',
        ctrlKey: true,
      });

      expect(editor.isActive('bold')).toBe(true);
      expect(editor.getHTML()).toContain('<strong>Nội dung</strong>');
    });

    it('executes Mod-i to toggle italic on selection', () => {
      editor.commands.setTextSelection({ from: 1, to: 9 });
      expect(editor.isActive('italic')).toBe(false);

      dispatchKeydown(editor.view.dom, {
        key: 'i',
        ctrlKey: true,
      });

      expect(editor.isActive('italic')).toBe(true);
      expect(editor.getHTML()).toContain('<em>Nội dung</em>');
    });

    it('executes Mod-Shift-x to toggle strike on selection', () => {
      editor.commands.setTextSelection({ from: 1, to: 9 });
      expect(editor.isActive('strike')).toBe(false);

      dispatchKeydown(editor.view.dom, {
        key: 'x',
        code: 'KeyX',
        ctrlKey: true,
        shiftKey: true,
      });

      expect(editor.isActive('strike')).toBe(true);
      expect(editor.getHTML()).toContain('<s>Nội dung</s>');
    });

    it('Ctrl+Shift+S (Mod-Shift-s) does NOT strike text (default removed)', () => {
      editor.commands.setTextSelection({ from: 1, to: 9 });
      expect(editor.isActive('strike')).toBe(false);

      dispatchKeydown(editor.view.dom, {
        key: 's',
        code: 'KeyS',
        ctrlKey: true,
        shiftKey: true,
      });

      // Must remain false
      expect(editor.isActive('strike')).toBe(false);
      expect(editor.getHTML()).not.toContain('<s>');
    });

    it('unsupported shortcuts (Ctrl+Alt+C, Ctrl+Enter, Ctrl+Shift+9) do not alter document', () => {
      const initialHtml = editor.getHTML();

      // Ctrl+Alt+C
      dispatchKeydown(editor.view.dom, { key: 'c', ctrlKey: true, altKey: true });
      expect(editor.getHTML()).toBe(initialHtml);

      // Ctrl+Enter
      dispatchKeydown(editor.view.dom, { key: 'Enter', ctrlKey: true });
      expect(editor.getHTML()).toBe(initialHtml);

      // Ctrl+Shift+9
      dispatchKeydown(editor.view.dom, { key: '9', ctrlKey: true, shiftKey: true });
      expect(editor.getHTML()).toBe(initialHtml);
    });
  });

  describe('Ctrl+U (Mod-u) notification', () => {
    it('intercepts Ctrl+U without modifying document and triggers ui.notify toast', () => {
      editor.commands.setTextSelection({ from: 1, to: 9 });
      const initialHtml = editor.getHTML();

      dispatchKeydown(editor.view.dom, {
        key: 'u',
        ctrlKey: true,
      });

      // Document is strictly unmodified
      expect(editor.getHTML()).toBe(initialHtml);
      expect(editor.isActive('underline')).toBe(false);

      // UI Toast was triggered with unsupported format hint
      expect(mockUi.notify).toHaveBeenCalledTimes(1);
      expect(mockUi.notify).toHaveBeenCalledWith('hint.unsupportedFormat');
    });
  });

  describe('IME Composition Protection (Quan trọng nhất)', () => {
    it('blocks shortcut execution when view.composing is true', () => {
      editor.commands.setTextSelection({ from: 1, to: 9 });

      // Simulate IME composing state in ProseMirror EditorView
      Object.defineProperty(editor.view, 'composing', {
        value: true,
        configurable: true,
        writable: true,
      });

      try {
        dispatchKeydown(editor.view.dom, {
          key: 'b',
          ctrlKey: true,
        });

        // Command must NOT have executed
        expect(editor.isActive('bold')).toBe(false);
      } finally {
        Object.defineProperty(editor.view, 'composing', {
          value: false,
          configurable: true,
          writable: true,
        });
      }
    });

    it('blocks shortcut execution when event.isComposing is true', () => {
      editor.commands.setTextSelection({ from: 1, to: 9 });

      dispatchKeydown(editor.view.dom, {
        key: 'b',
        ctrlKey: true,
        isComposing: true,
      });

      expect(editor.isActive('bold')).toBe(false);
    });

    it('blocks shortcut execution when event.keyCode is 229 (IME Composition keycode)', () => {
      editor.commands.setTextSelection({ from: 1, to: 9 });

      const event = new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        key: 'b',
        ctrlKey: true,
      });
      Object.defineProperty(event, 'keyCode', { value: 229 });

      editor.view.dom.dispatchEvent(event);

      expect(editor.isActive('bold')).toBe(false);
    });

    it('blocks Ctrl+U notification when IME is composing', () => {
      dispatchKeydown(editor.view.dom, {
        key: 'u',
        ctrlKey: true,
        isComposing: true,
      });

      expect(mockUi.notify).not.toHaveBeenCalled();
    });
  });

  describe('Platform-specific bindings', () => {
    it('binds Windows redo to both Mod-y and Mod-Shift-z', () => {
      // 1. Make a change to create undo/redo history
      editor.commands.setTextSelection({ from: 1, to: 9 });
      dispatchKeydown(editor.view.dom, { key: 'b', ctrlKey: true });
      expect(editor.isActive('bold')).toBe(true);

      // 2. Undo with Mod-z
      dispatchKeydown(editor.view.dom, { key: 'z', ctrlKey: true });
      expect(editor.isActive('bold')).toBe(false);

      // 3. Redo with Mod-y
      dispatchKeydown(editor.view.dom, { key: 'y', ctrlKey: true });
      expect(editor.isActive('bold')).toBe(true);

      // Undo again
      dispatchKeydown(editor.view.dom, { key: 'z', ctrlKey: true });
      expect(editor.isActive('bold')).toBe(false);

      // 4. Redo with Mod-Shift-z
      dispatchKeydown(editor.view.dom, { key: 'z', ctrlKey: true, shiftKey: true });
      expect(editor.isActive('bold')).toBe(true);
    });

    it('macOS platform uses Cmd shortcuts and does not bind Mod-y for redo', () => {
      const macRegistry = createCommandRegistry();
      for (const cmd of coreCommands) {
        macRegistry.register(cmd);
      }

      const macEditor = new Editor({
        extensions: createExtensions({
          registry: macRegistry,
          platform: 'mac',
          ui: mockUi,
        }),
        content: '<p>Nội dung macOS</p>',
      });

      // Mod on Mac is Meta (Command)
      macEditor.commands.setTextSelection({ from: 1, to: 9 });
      dispatchKeydown(macEditor.view.dom, { key: 'b', metaKey: true });
      expect(macEditor.isActive('bold')).toBe(true);

      // Undo with Cmd-z
      dispatchKeydown(macEditor.view.dom, { key: 'z', metaKey: true });
      expect(macEditor.isActive('bold')).toBe(false);

      // Mod-y should NOT trigger redo on Mac (only Cmd-Shift-z)
      dispatchKeydown(macEditor.view.dom, { key: 'y', metaKey: true });
      expect(macEditor.isActive('bold')).toBe(false);

      // Redo with Cmd-Shift-z
      dispatchKeydown(macEditor.view.dom, { key: 'z', metaKey: true, shiftKey: true });
      expect(macEditor.isActive('bold')).toBe(true);

      macEditor.destroy();
    });
  });
});
