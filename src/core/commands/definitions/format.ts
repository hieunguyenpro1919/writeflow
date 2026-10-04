import type { CommandDef } from '../types';

export const boldCommand: CommandDef = {
  id: 'format.bold',
  labelKey: 'cmd.format.bold',
  category: 'format',
  defaultShortcut: {
    win: 'Mod-b',
    mac: 'Mod-b',
  },
  run(ctx) {
    return ctx.editor.chain().focus().toggleBold().run();
  },
  isActive(ctx) {
    return ctx.editor.isActive('bold');
  },
};

export const italicCommand: CommandDef = {
  id: 'format.italic',
  labelKey: 'cmd.format.italic',
  category: 'format',
  defaultShortcut: {
    win: 'Mod-i',
    mac: 'Mod-i',
  },
  run(ctx) {
    return ctx.editor.chain().focus().toggleItalic().run();
  },
  isActive(ctx) {
    return ctx.editor.isActive('italic');
  },
};

export const strikeCommand: CommandDef = {
  id: 'format.strike',
  labelKey: 'cmd.format.strike',
  category: 'format',
  defaultShortcut: {
    win: 'Mod-Shift-x',
    mac: 'Mod-Shift-x',
  },
  run(ctx) {
    return ctx.editor.chain().focus().toggleStrike().run();
  },
  isActive(ctx) {
    return ctx.editor.isActive('strike');
  },
};

export const codeCommand: CommandDef = {
  id: 'format.code',
  labelKey: 'cmd.format.code',
  category: 'format',
  defaultShortcut: {
    win: 'Mod-e',
    mac: 'Mod-e',
  },
  run(ctx) {
    return ctx.editor.chain().focus().toggleCode().run();
  },
  isActive(ctx) {
    return ctx.editor.isActive('code');
  },
};

export const formatCommands: CommandDef[] = [
  boldCommand,
  italicCommand,
  strikeCommand,
  codeCommand,
];
