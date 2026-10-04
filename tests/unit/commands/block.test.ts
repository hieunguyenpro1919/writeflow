import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Editor } from '@tiptap/core';
import { createExtensions } from '../../../src/core/editor/extensions';
import { createCommandRegistry } from '../../../src/core/commands/registry';
import {
  paragraphCommand,
  heading1Command,
  heading2Command,
  heading3Command,
  bulletListCommand,
  orderedListCommand,
  blockquoteCommand,
  blockCommands,
} from '../../../src/core/commands/definitions/block';
import type { CommandContext, UiBridge } from '../../../src/core/commands/types';

describe('Task 1.6: Block Commands', () => {
  let editor: Editor;
  const mockUi: UiBridge = {
    openShortcutsDialog: vi.fn(),
    notify: vi.fn(),
  };

  beforeEach(() => {
    editor = new Editor({
      extensions: createExtensions(),
      content: '<p>Nội dung đoạn văn đầu tiên</p>',
    });
  });

  afterEach(() => {
    editor.destroy();
  });

  it('registers all block commands into registry without collision', () => {
    const registry = createCommandRegistry();
    for (const cmd of blockCommands) {
      registry.register(cmd);
      expect(registry.get(cmd.id)).toBe(cmd);
    }

    expect(registry.getShortcuts('block.paragraph', 'win')).toEqual(['Mod-Alt-0']);
    expect(registry.getShortcuts('block.heading1', 'win')).toEqual(['Mod-Alt-1']);
    expect(registry.getShortcuts('block.heading2', 'win')).toEqual(['Mod-Alt-2']);
    expect(registry.getShortcuts('block.heading3', 'win')).toEqual(['Mod-Alt-3']);
    expect(registry.getShortcuts('block.bulletList', 'win')).toEqual(['Mod-Shift-8']);
    expect(registry.getShortcuts('block.orderedList', 'win')).toEqual(['Mod-Shift-7']);
    expect(registry.getShortcuts('block.blockquote', 'win')).toEqual(['Mod-Shift-b']);
  });

  describe('Heading 1 command (block.heading1) and P1-D1 toggle', () => {
    it('applies heading 1, verifies undo and redo', () => {
      const registry = createCommandRegistry();
      registry.register(heading1Command);
      const ctx: CommandContext = { editor, ui: mockUi };

      editor.commands.setTextSelection(3);
      expect(registry.isActive('block.heading1', ctx)).toBe(false);

      const success = registry.run('block.heading1', ctx);
      expect(success).toBe(true);
      expect(editor.isActive('heading', { level: 1 })).toBe(true);
      expect(registry.isActive('block.heading1', ctx)).toBe(true);
      expect(editor.getHTML()).toContain('<h1>Nội dung đoạn văn đầu tiên</h1>');

      // Undo
      editor.commands.undo();
      expect(editor.isActive('heading', { level: 1 })).toBe(false);
      expect(editor.getHTML()).toContain('<p>Nội dung đoạn văn đầu tiên</p>');

      // Redo
      editor.commands.redo();
      expect(editor.isActive('heading', { level: 1 })).toBe(true);
      expect(editor.getHTML()).toContain('<h1>Nội dung đoạn văn đầu tiên</h1>');
    });

    it('toggles back to paragraph when heading 1 is pressed again (P1-D1)', () => {
      const registry = createCommandRegistry();
      registry.register(heading1Command);
      const ctx: CommandContext = { editor, ui: mockUi };

      editor.commands.setTextSelection(3);
      registry.run('block.heading1', ctx);
      expect(editor.isActive('heading', { level: 1 })).toBe(true);

      // Second run: toggle back to paragraph
      registry.run('block.heading1', ctx);
      expect(editor.isActive('heading', { level: 1 })).toBe(false);
      expect(editor.isActive('paragraph')).toBe(true);
      expect(editor.getHTML()).toContain('<p>Nội dung đoạn văn đầu tiên</p>');
    });
  });

  describe('Heading 2 and 3 commands', () => {
    it('applies heading 2 and toggles back', () => {
      const registry = createCommandRegistry();
      registry.register(heading2Command);
      const ctx: CommandContext = { editor, ui: mockUi };

      editor.commands.setTextSelection(3);
      registry.run('block.heading2', ctx);
      expect(editor.isActive('heading', { level: 2 })).toBe(true);
      expect(editor.getHTML()).toContain('<h2>Nội dung đoạn văn đầu tiên</h2>');

      registry.run('block.heading2', ctx);
      expect(editor.isActive('heading', { level: 2 })).toBe(false);
      expect(editor.isActive('paragraph')).toBe(true);
    });

    it('applies heading 3 and toggles back', () => {
      const registry = createCommandRegistry();
      registry.register(heading3Command);
      const ctx: CommandContext = { editor, ui: mockUi };

      editor.commands.setTextSelection(3);
      registry.run('block.heading3', ctx);
      expect(editor.isActive('heading', { level: 3 })).toBe(true);
      expect(editor.getHTML()).toContain('<h3>Nội dung đoạn văn đầu tiên</h3>');

      registry.run('block.heading3', ctx);
      expect(editor.isActive('heading', { level: 3 })).toBe(false);
      expect(editor.isActive('paragraph')).toBe(true);
    });
  });

  describe('Lists (bulletList & orderedList)', () => {
    it('applies bulletList, verifies undo and redo', () => {
      const registry = createCommandRegistry();
      registry.register(bulletListCommand);
      const ctx: CommandContext = { editor, ui: mockUi };

      editor.commands.setTextSelection(3);
      registry.run('block.bulletList', ctx);
      expect(editor.isActive('bulletList')).toBe(true);
      expect(editor.getHTML()).toContain('<ul><li><p>Nội dung đoạn văn đầu tiên</p></li></ul>');

      editor.commands.undo();
      expect(editor.isActive('bulletList')).toBe(false);
      expect(editor.getHTML()).toContain('<p>Nội dung đoạn văn đầu tiên</p>');

      editor.commands.redo();
      expect(editor.isActive('bulletList')).toBe(true);
      expect(editor.getHTML()).toContain('<ul><li><p>Nội dung đoạn văn đầu tiên</p></li></ul>');
    });

    it('switches directly between bulletList and orderedList without error', () => {
      const registry = createCommandRegistry();
      registry.register(bulletListCommand);
      registry.register(orderedListCommand);
      const ctx: CommandContext = { editor, ui: mockUi };

      editor.commands.setTextSelection(3);
      registry.run('block.bulletList', ctx);
      expect(editor.isActive('bulletList')).toBe(true);
      expect(editor.isActive('orderedList')).toBe(false);

      // Switch directly to ordered list
      registry.run('block.orderedList', ctx);
      expect(editor.isActive('orderedList')).toBe(true);
      expect(editor.isActive('bulletList')).toBe(false);
      expect(editor.getHTML()).toContain('<ol><li><p>Nội dung đoạn văn đầu tiên</p></li></ol>');

      // Switch back directly to bullet list
      registry.run('block.bulletList', ctx);
      expect(editor.isActive('bulletList')).toBe(true);
      expect(editor.isActive('orderedList')).toBe(false);
      expect(editor.getHTML()).toContain('<ul><li><p>Nội dung đoạn văn đầu tiên</p></li></ul>');
    });

    it('applies list to multiple selected paragraphs creating separate items without merging', () => {
      editor.commands.setContent('<p>Mục thứ nhất</p><p>Mục thứ hai</p><p>Mục thứ ba</p>');
      const registry = createCommandRegistry();
      registry.register(bulletListCommand);
      const ctx: CommandContext = { editor, ui: mockUi };

      // Select across all 3 paragraphs (from position 1 to doc size - 1)
      editor.commands.setTextSelection({ from: 1, to: editor.state.doc.content.size - 1 });
      registry.run('block.bulletList', ctx);

      const html = editor.getHTML();
      expect(html).toContain('<ul>');
      expect(html).toContain('<li><p>Mục thứ nhất</p></li>');
      expect(html).toContain('<li><p>Mục thứ hai</p></li>');
      expect(html).toContain('<li><p>Mục thứ ba</p></li>');
    });
  });

  describe('Blockquote command (block.blockquote)', () => {
    it('applies blockquote, verifies undo and redo', () => {
      const registry = createCommandRegistry();
      registry.register(blockquoteCommand);
      const ctx: CommandContext = { editor, ui: mockUi };

      editor.commands.setTextSelection(3);
      registry.run('block.blockquote', ctx);
      expect(editor.isActive('blockquote')).toBe(true);
      expect(editor.getHTML()).toContain('<blockquote><p>Nội dung đoạn văn đầu tiên</p></blockquote>');

      editor.commands.undo();
      expect(editor.isActive('blockquote')).toBe(false);
      expect(editor.getHTML()).toContain('<p>Nội dung đoạn văn đầu tiên</p>');

      editor.commands.redo();
      expect(editor.isActive('blockquote')).toBe(true);
      expect(editor.getHTML()).toContain('<blockquote><p>Nội dung đoạn văn đầu tiên</p></blockquote>');
    });

    it('supports nesting list inside blockquote', () => {
      const registry = createCommandRegistry();
      registry.register(blockquoteCommand);
      registry.register(bulletListCommand);
      const ctx: CommandContext = { editor, ui: mockUi };

      editor.commands.setTextSelection(3);
      registry.run('block.blockquote', ctx);
      expect(editor.isActive('blockquote')).toBe(true);

      registry.run('block.bulletList', ctx);
      expect(editor.isActive('blockquote')).toBe(true);
      expect(editor.isActive('bulletList')).toBe(true);
      expect(editor.getHTML()).toContain('<blockquote><ul><li><p>Nội dung đoạn văn đầu tiên</p></li></ul></blockquote>');
    });
  });

  describe('Paragraph command (block.paragraph)', () => {
    it('converts heading back to paragraph', () => {
      editor.commands.setContent('<h1>Tiêu đề cần về thường</h1>');
      const registry = createCommandRegistry();
      registry.register(paragraphCommand);
      const ctx: CommandContext = { editor, ui: mockUi };

      editor.commands.setTextSelection(3);
      expect(editor.isActive('heading')).toBe(true);

      registry.run('block.paragraph', ctx);
      expect(editor.isActive('heading')).toBe(false);
      expect(editor.isActive('paragraph')).toBe(true);
      expect(editor.getHTML()).toBe('<p>Tiêu đề cần về thường</p>');
    });

    it('works on an empty paragraph without error', () => {
      editor.commands.setContent('<p></p>');
      const registry = createCommandRegistry();
      registry.register(paragraphCommand);
      const ctx: CommandContext = { editor, ui: mockUi };

      expect(() => registry.run('block.paragraph', ctx)).not.toThrow();
      expect(editor.isActive('paragraph')).toBe(true);
    });
  });
});
