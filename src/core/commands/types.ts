import type { Editor } from '@tiptap/core';

export type Platform = 'win' | 'mac';

export type CommandCategory = 'format' | 'block' | 'insert' | 'file' | 'edit' | 'view' | 'help';

export interface UiBridge {
  openShortcutsDialog(): void;
  notify(messageKey: string, opts?: Record<string, unknown>): void;
}

export interface CommandContext {
  editor: Editor;
  ui: UiBridge;
}

export interface CommandDef {
  id: string; // e.g. "format.bold" — duy nhất, ổn định, định dạng: nhóm.tên
  labelKey: string; // i18n key, e.g. "cmd.format.bold"
  descriptionKey?: string;
  icon?: string;
  category: CommandCategory;
  defaultShortcut?: {
    win?: string | string[];
    mac?: string | string[];
  };
  run(ctx: CommandContext, args?: unknown): boolean;
  isEnabled?(ctx: CommandContext): boolean;
  isActive?(ctx: CommandContext): boolean;
  showIn?: Array<'toolbar' | 'bubble' | 'slash' | 'context' | 'menu'>;
  slashAliases?: string[];
}

export interface CommandRegistry {
  register(def: CommandDef): void;
  get(id: string): CommandDef | undefined;
  list(filter?: (def: CommandDef) => boolean): CommandDef[];
  run(id: string, ctx: CommandContext, args?: unknown): boolean;
  isEnabled(id: string, ctx: CommandContext): boolean;
  isActive(id: string, ctx: CommandContext): boolean;
  getShortcuts(id: string, platform: Platform): string[];
}
