import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Editor } from '@tiptap/core';
import { createExtensions } from '../../../src/core/editor/extensions';
import { createCommandRegistry } from '../../../src/core/commands/registry';
import { undoCommand, redoCommand, editCommands } from '../../../src/core/commands/definitions/edit';
import { formatCommands } from '../../../src/core/commands/definitions/format';
import { blockCommands } from '../../../src/core/commands/definitions/block';
import type { CommandContext, UiBridge } from '../../../src/core/commands/types';

describe('Task 1.7: Edit Commands (Undo & Redo)', () => {
  let editor: Editor;
  const mockUi: UiBridge = {
    openShortcutsDialog: vi.fn(),
    notify: vi.fn(),
  };

  beforeEach(() => {
    vi.useFakeTimers();
    editor = new Editor({
      extensions: createExtensions(),
      content: '<p>Văn bản ban đầu</p>',
    });
  });

  afterEach(() => {
    editor.destroy();
    vi.useRealTimers();
  });

  it('registers undo and redo with proper platform shortcuts', () => {
    const registry = createCommandRegistry();
    for (const cmd of editCommands) {
      registry.register(cmd);
      expect(registry.get(cmd.id)).toBe(cmd);
    }

    expect(registry.getShortcuts('edit.undo', 'win')).toEqual(['Mod-z']);
    expect(registry.getShortcuts('edit.undo', 'mac')).toEqual(['Mod-z']);

    // Redo has multiple shortcuts on Windows, single on Mac
    expect(registry.getShortcuts('edit.redo', 'win')).toEqual(['Mod-y', 'Mod-Shift-z']);
    expect(registry.getShortcuts('edit.redo', 'mac')).toEqual(['Mod-Shift-z']);
  });

  it('reports isEnabled false when history stack is empty', () => {
    const registry = createCommandRegistry();
    registry.register(undoCommand);
    registry.register(redoCommand);
    const ctx: CommandContext = { editor, ui: mockUi };

    expect(registry.isEnabled('edit.undo', ctx)).toBe(false);
    expect(registry.isEnabled('edit.redo', ctx)).toBe(false);

    // Safely returns false without throwing error
    expect(registry.run('edit.undo', ctx)).toBe(false);
    expect(registry.run('edit.redo', ctx)).toBe(false);
  });

  it('performs a chain of 10+ mixed operations, undoes all and redoes all with document matching', () => {
    const registry = createCommandRegistry();
    for (const cmd of [...formatCommands, ...blockCommands, ...editCommands]) {
      registry.register(cmd);
    }
    const ctx: CommandContext = { editor, ui: mockUi };

    const snapshots: string[] = [];
    const record = () => snapshots.push(JSON.stringify(editor.getJSON()));

    // Step 0: Initial
    record();

    // Advance time between steps to ensure distinct history events
    vi.advanceTimersByTime(600);

    // Step 1: Type text at end
    editor.commands.insertContent(' thêm');
    record();
    vi.advanceTimersByTime(600);

    // Step 2: Bold
    editor.commands.setTextSelection({ from: 1, to: 5 });
    registry.run('format.bold', ctx);
    record();
    vi.advanceTimersByTime(600);

    // Step 3: Italic
    editor.commands.setTextSelection({ from: 6, to: 10 });
    registry.run('format.italic', ctx);
    record();
    vi.advanceTimersByTime(600);

    // Step 4: Strike
    editor.commands.setTextSelection({ from: 11, to: 14 });
    registry.run('format.strike', ctx);
    record();
    vi.advanceTimersByTime(600);

    // Step 5: Convert to Heading 1
    editor.commands.setTextSelection(3);
    registry.run('block.heading1', ctx);
    record();
    vi.advanceTimersByTime(600);

    // Step 6: Convert Heading 1 to Heading 2
    registry.run('block.heading2', ctx);
    record();
    vi.advanceTimersByTime(600);

    // Step 7: Convert Heading 2 back to Paragraph
    registry.run('block.paragraph', ctx);
    record();
    vi.advanceTimersByTime(600);

    // Step 8: Convert to Blockquote
    registry.run('block.blockquote', ctx);
    record();
    vi.advanceTimersByTime(600);

    // Step 9: Convert to BulletList
    registry.run('block.bulletList', ctx);
    record();
    vi.advanceTimersByTime(600);

    // Step 10: Toggle Code
    editor.commands.setTextSelection({ from: 2, to: 6 });
    registry.run('format.code', ctx);
    record();
    vi.advanceTimersByTime(600);

    // We recorded initial + 10 steps = 11 snapshots
    expect(snapshots.length).toBe(11);
    expect(registry.isEnabled('edit.undo', ctx)).toBe(true);
    expect(registry.isEnabled('edit.redo', ctx)).toBe(false);

    // Undo 10 times step-by-step
    for (let step = 9; step >= 0; step--) {
      const undoSuccess = registry.run('edit.undo', ctx);
      expect(undoSuccess).toBe(true);
      expect(JSON.stringify(editor.getJSON())).toBe(snapshots[step]);
    }

    // Now undo stack should be empty
    expect(registry.isEnabled('edit.undo', ctx)).toBe(false);
    expect(registry.isEnabled('edit.redo', ctx)).toBe(true);

    // Redo 10 times step-by-step
    for (let step = 1; step <= 10; step++) {
      const redoSuccess = registry.run('edit.redo', ctx);
      expect(redoSuccess).toBe(true);
      expect(JSON.stringify(editor.getJSON())).toBe(snapshots[step]);
    }

    // Now redo stack should be empty again
    expect(registry.isEnabled('edit.undo', ctx)).toBe(true);
    expect(registry.isEnabled('edit.redo', ctx)).toBe(false);
  });

  it('clears redo stack when a new operation occurs after undo', () => {
    const registry = createCommandRegistry();
    for (const cmd of [...formatCommands, ...editCommands]) {
      registry.register(cmd);
    }
    const ctx: CommandContext = { editor, ui: mockUi };

    // Apply bold
    editor.commands.setTextSelection({ from: 1, to: 5 });
    registry.run('format.bold', ctx);
    expect(registry.isEnabled('edit.undo', ctx)).toBe(true);

    // Undo
    registry.run('edit.undo', ctx);
    expect(registry.isEnabled('edit.redo', ctx)).toBe(true);

    // Type new text
    editor.commands.insertContent('nội dung mới phân nhánh');

    // Redo must now be disabled / cleared
    expect(registry.isEnabled('edit.redo', ctx)).toBe(false);
  });
});
