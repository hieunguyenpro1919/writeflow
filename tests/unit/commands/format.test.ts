import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Editor } from '@tiptap/core';
import { createExtensions } from '../../../src/core/editor/extensions';
import { createCommandRegistry } from '../../../src/core/commands/registry';
import {
  boldCommand,
  italicCommand,
  strikeCommand,
  codeCommand,
  formatCommands,
} from '../../../src/core/commands/definitions/format';
import type { CommandContext, UiBridge } from '../../../src/core/commands/types';

describe('Task 1.5: Format Commands', () => {
  let editor: Editor;
  const mockUi: UiBridge = {
    openShortcutsDialog: vi.fn(),
    notify: vi.fn(),
  };

  beforeEach(() => {
    editor = new Editor({
      extensions: createExtensions(),
      content: '<p>Viết văn bản tiếng Việt mẫu</p>',
    });
  });

  afterEach(() => {
    editor.destroy();
  });

  it('registers all format commands into registry without collision', () => {
    const registry = createCommandRegistry();
    for (const cmd of formatCommands) {
      registry.register(cmd);
      expect(registry.get(cmd.id)).toBe(cmd);
    }

    expect(registry.getShortcuts('format.bold', 'win')).toEqual(['Mod-b']);
    expect(registry.getShortcuts('format.italic', 'win')).toEqual(['Mod-i']);
    expect(registry.getShortcuts('format.strike', 'win')).toEqual(['Mod-Shift-x']);
    expect(registry.getShortcuts('format.code', 'win')).toEqual(['Mod-e']);
  });

  describe('Bold command (format.bold)', () => {
    it('applies bold to selected text, verifies undo and redo', () => {
      const registry = createCommandRegistry();
      registry.register(boldCommand);
      const ctx: CommandContext = { editor, ui: mockUi };

      // Select "tiếng Việt" (characters 14 to 24 in document text)
      editor.commands.setTextSelection({ from: 14, to: 24 });
      expect(registry.isActive('format.bold', ctx)).toBe(false);

      // Run bold
      const success = registry.run('format.bold', ctx);
      expect(success).toBe(true);
      expect(editor.isActive('bold')).toBe(true);
      expect(registry.isActive('format.bold', ctx)).toBe(true);
      expect(editor.getHTML()).toContain('<strong>tiếng Việt</strong>');

      // Undo
      editor.commands.undo();
      expect(editor.isActive('bold')).toBe(false);
      expect(registry.isActive('format.bold', ctx)).toBe(false);
      expect(editor.getHTML()).not.toContain('<strong>');

      // Redo
      editor.commands.redo();
      expect(editor.isActive('bold')).toBe(true);
      expect(registry.isActive('format.bold', ctx)).toBe(true);
      expect(editor.getHTML()).toContain('<strong>tiếng Việt</strong>');
    });

    it('toggles bold off when run twice on the same selection', () => {
      const registry = createCommandRegistry();
      registry.register(boldCommand);
      const ctx: CommandContext = { editor, ui: mockUi };

      editor.commands.setTextSelection({ from: 1, to: 5 });
      registry.run('format.bold', ctx);
      expect(editor.isActive('bold')).toBe(true);

      registry.run('format.bold', ctx);
      expect(editor.isActive('bold')).toBe(false);
    });
  });

  describe('Italic command (format.italic)', () => {
    it('applies italic to selected text, verifies undo and redo', () => {
      const registry = createCommandRegistry();
      registry.register(italicCommand);
      const ctx: CommandContext = { editor, ui: mockUi };

      editor.commands.setTextSelection({ from: 1, to: 5 });
      expect(registry.isActive('format.italic', ctx)).toBe(false);

      const success = registry.run('format.italic', ctx);
      expect(success).toBe(true);
      expect(editor.isActive('italic')).toBe(true);
      expect(editor.getHTML()).toContain('<em>Viết</em>');

      editor.commands.undo();
      expect(editor.isActive('italic')).toBe(false);
      expect(editor.getHTML()).not.toContain('<em>');

      editor.commands.redo();
      expect(editor.isActive('italic')).toBe(true);
      expect(editor.getHTML()).toContain('<em>Viết</em>');
    });
  });

  describe('Strike command (format.strike)', () => {
    it('applies strike to selected text, verifies undo and redo', () => {
      const registry = createCommandRegistry();
      registry.register(strikeCommand);
      const ctx: CommandContext = { editor, ui: mockUi };

      editor.commands.setTextSelection({ from: 6, to: 13 });
      expect(registry.isActive('format.strike', ctx)).toBe(false);

      const success = registry.run('format.strike', ctx);
      expect(success).toBe(true);
      expect(editor.isActive('strike')).toBe(true);
      expect(editor.getHTML()).toContain('<s>văn bản</s>');

      editor.commands.undo();
      expect(editor.isActive('strike')).toBe(false);
      expect(editor.getHTML()).not.toContain('<s>');

      editor.commands.redo();
      expect(editor.isActive('strike')).toBe(true);
      expect(editor.getHTML()).toContain('<s>văn bản</s>');
    });
  });

  describe('Code command (format.code)', () => {
    it('applies inline code to selected text, verifies undo and redo', () => {
      const registry = createCommandRegistry();
      registry.register(codeCommand);
      const ctx: CommandContext = { editor, ui: mockUi };

      editor.commands.setTextSelection({ from: 1, to: 5 });
      expect(registry.isActive('format.code', ctx)).toBe(false);

      const success = registry.run('format.code', ctx);
      expect(success).toBe(true);
      expect(editor.isActive('code')).toBe(true);
      expect(editor.getHTML()).toContain('<code>Viết</code>');

      editor.commands.undo();
      expect(editor.isActive('code')).toBe(false);
      expect(editor.getHTML()).not.toContain('<code>');

      editor.commands.redo();
      expect(editor.isActive('code')).toBe(true);
      expect(editor.getHTML()).toContain('<code>Viết</code>');
    });

    it('recording Section 3 point 6 behavior: code mark excludes other marks (bold)', () => {
      const registry = createCommandRegistry();
      registry.register(boldCommand);
      registry.register(codeCommand);
      const ctx: CommandContext = { editor, ui: mockUi };

      // Apply bold first
      editor.commands.setTextSelection({ from: 1, to: 5 });
      registry.run('format.bold', ctx);
      expect(editor.isActive('bold')).toBe(true);

      // Now apply code on the same selection: CommonMark / ProseMirror excludes bold
      registry.run('format.code', ctx);
      expect(editor.isActive('code')).toBe(true);
      expect(editor.isActive('bold')).toBe(false);
      expect(editor.getHTML()).toContain('<code>Viết</code>');
      expect(editor.getHTML()).not.toContain('<strong><code>');
    });
  });

  describe('Edge cases', () => {
    it('does not throw when cursor is collapsed in empty line or between words', () => {
      const emptyEditor = new Editor({
        extensions: createExtensions(),
        content: '<p></p>',
      });
      const ctx: CommandContext = { editor: emptyEditor, ui: mockUi };

      expect(() => boldCommand.run(ctx)).not.toThrow();
      expect(() => italicCommand.run(ctx)).not.toThrow();
      expect(() => strikeCommand.run(ctx)).not.toThrow();
      expect(() => codeCommand.run(ctx)).not.toThrow();

      emptyEditor.destroy();
    });

    it('works flawlessly on complex Vietnamese characters with tone marks and vowels', () => {
      editor.commands.setContent('<p>Nguyện vọng được chuyển ngữ mượt mà: ươ, ê, ô, ắ, ặ, ỗ, ỷ</p>');
      const ctx: CommandContext = { editor, ui: mockUi };

      // Dynamically locate "chuyển ngữ"
      const text = editor.getText();
      const from = text.indexOf('chuyển ngữ') + 1;
      const to = from + 'chuyển ngữ'.length;
      editor.commands.setTextSelection({ from, to });
      boldCommand.run(ctx);
      italicCommand.run(ctx);

      expect(editor.isActive('bold')).toBe(true);
      expect(editor.isActive('italic')).toBe(true);
      expect(editor.getHTML()).toContain('chuyển ngữ');
    });
  });
});
