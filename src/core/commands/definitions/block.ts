import type { CommandDef } from '../types';

export const paragraphCommand: CommandDef = {
  id: 'block.paragraph',
  labelKey: 'cmd.block.paragraph',
  category: 'block',
  defaultShortcut: {
    win: 'Mod-Alt-0',
    mac: 'Mod-Alt-0',
  },
  run(ctx) {
    return ctx.editor.chain().focus().setParagraph().run();
  },
  isActive(ctx) {
    return ctx.editor.isActive('paragraph');
  },
};

export const heading1Command: CommandDef = {
  id: 'block.heading1',
  labelKey: 'cmd.block.heading1',
  category: 'block',
  defaultShortcut: {
    win: 'Mod-Alt-1',
    mac: 'Mod-Alt-1',
  },
  run(ctx) {
    return ctx.editor.chain().focus().toggleHeading({ level: 1 }).run();
  },
  isActive(ctx) {
    return ctx.editor.isActive('heading', { level: 1 });
  },
};

export const heading2Command: CommandDef = {
  id: 'block.heading2',
  labelKey: 'cmd.block.heading2',
  category: 'block',
  defaultShortcut: {
    win: 'Mod-Alt-2',
    mac: 'Mod-Alt-2',
  },
  run(ctx) {
    return ctx.editor.chain().focus().toggleHeading({ level: 2 }).run();
  },
  isActive(ctx) {
    return ctx.editor.isActive('heading', { level: 2 });
  },
};

export const heading3Command: CommandDef = {
  id: 'block.heading3',
  labelKey: 'cmd.block.heading3',
  category: 'block',
  defaultShortcut: {
    win: 'Mod-Alt-3',
    mac: 'Mod-Alt-3',
  },
  run(ctx) {
    return ctx.editor.chain().focus().toggleHeading({ level: 3 }).run();
  },
  isActive(ctx) {
    return ctx.editor.isActive('heading', { level: 3 });
  },
};

export const bulletListCommand: CommandDef = {
  id: 'block.bulletList',
  labelKey: 'cmd.block.bulletList',
  category: 'block',
  defaultShortcut: {
    win: 'Mod-Shift-8',
    mac: 'Mod-Shift-8',
  },
  run(ctx) {
    return ctx.editor.chain().focus().toggleBulletList().run();
  },
  isActive(ctx) {
    return ctx.editor.isActive('bulletList');
  },
};

export const orderedListCommand: CommandDef = {
  id: 'block.orderedList',
  labelKey: 'cmd.block.orderedList',
  category: 'block',
  defaultShortcut: {
    win: 'Mod-Shift-7',
    mac: 'Mod-Shift-7',
  },
  run(ctx) {
    return ctx.editor.chain().focus().toggleOrderedList().run();
  },
  isActive(ctx) {
    return ctx.editor.isActive('orderedList');
  },
};

export const blockquoteCommand: CommandDef = {
  id: 'block.blockquote',
  labelKey: 'cmd.block.blockquote',
  category: 'block',
  defaultShortcut: {
    win: 'Mod-Shift-b',
    mac: 'Mod-Shift-b',
  },
  run(ctx) {
    return ctx.editor.chain().focus().toggleBlockquote().run();
  },
  isActive(ctx) {
    return ctx.editor.isActive('blockquote');
  },
};

export const blockCommands: CommandDef[] = [
  paragraphCommand,
  heading1Command,
  heading2Command,
  heading3Command,
  bulletListCommand,
  orderedListCommand,
  blockquoteCommand,
];
