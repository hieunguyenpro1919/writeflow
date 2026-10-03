/**
 * WriteFlow Command System Interface
 * Nguồn sự thật: docs/PLAN.md Section 6.1
 * (Sẽ được hiện thực đầy đủ tại Phase 1)
 */

export interface CommandContext {
  editor?: unknown;
}

export interface CommandDef {
  id: string; // ví dụ "format.bold" — duy nhất, ổn định
  labelKey: string; // khóa i18n
  descriptionKey?: string;
  icon?: string;
  category: 'format' | 'block' | 'insert' | 'file' | 'edit' | 'view' | 'help';
  defaultShortcut?: { win?: string; mac?: string };
  run(ctx: CommandContext, args?: unknown): boolean;
  isEnabled?(ctx: CommandContext): boolean;
  isActive?(ctx: CommandContext): boolean;
  showIn?: Array<'toolbar' | 'bubble' | 'slash' | 'context' | 'menu'>;
  slashAliases?: string[];
}
