import type { CommandDef } from '../types';

export const undoCommand: CommandDef = {
  id: 'edit.undo',
  labelKey: 'cmd.edit.undo',
  category: 'edit',
  defaultShortcut: {
    win: 'Mod-z',
    mac: 'Mod-z',
  },
  run(ctx) {
    return ctx.editor.chain().focus().undo().run();
  },
  isEnabled(ctx) {
    return ctx.editor.can().undo();
  },
};

export const redoCommand: CommandDef = {
  id: 'edit.redo',
  labelKey: 'cmd.edit.redo',
  category: 'edit',
  defaultShortcut: {
    win: ['Mod-y', 'Mod-Shift-z'],
    mac: ['Mod-Shift-z'],
  },
  run(ctx) {
    return ctx.editor.chain().focus().redo().run();
  },
  isEnabled(ctx) {
    return ctx.editor.can().redo();
  },
};

export const editCommands: CommandDef[] = [undoCommand, redoCommand];
