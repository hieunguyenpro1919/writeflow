import type { CommandDef, CommandContext, CommandRegistry, Platform } from './types';

const ID_REGEX = /^[a-z]+\.[A-Za-z0-9]+$/;

function normalizeShortcutList(shortcut?: string | string[]): string[] {
  if (!shortcut) return [];
  if (Array.isArray(shortcut)) {
    return shortcut.filter((s) => typeof s === 'string' && s.trim().length > 0);
  }
  return typeof shortcut === 'string' && shortcut.trim().length > 0 ? [shortcut] : [];
}

export function createCommandRegistry(): CommandRegistry {
  const commands = new Map<string, CommandDef>();
  const winShortcuts = new Map<string, string>(); // shortcut -> commandId
  const macShortcuts = new Map<string, string>(); // shortcut -> commandId

  return {
    register(def: CommandDef): void {
      if (!def.id || !ID_REGEX.test(def.id)) {
        throw new Error(
          `Invalid command id "${def.id}". Command id must match format "category.name" (e.g. "format.bold").`,
        );
      }

      if (commands.has(def.id)) {
        throw new Error(`Command with id "${def.id}" is already registered.`);
      }

      if (!def.labelKey || typeof def.labelKey !== 'string' || def.labelKey.trim() === '') {
        throw new Error(`Command "${def.id}" must have a non-empty labelKey.`);
      }

      // Check shortcut collisions on Windows / Linux
      const winList = normalizeShortcutList(def.defaultShortcut?.win);
      for (const sc of winList) {
        const existing = winShortcuts.get(sc);
        if (existing) {
          throw new Error(
            `Shortcut collision on platform "win": shortcut "${sc}" for command "${def.id}" is already assigned to "${existing}".`,
          );
        }
      }

      // Check shortcut collisions on macOS
      const macList = normalizeShortcutList(def.defaultShortcut?.mac);
      for (const sc of macList) {
        const existing = macShortcuts.get(sc);
        if (existing) {
          throw new Error(
            `Shortcut collision on platform "mac": shortcut "${sc}" for command "${def.id}" is already assigned to "${existing}".`,
          );
        }
      }

      // Record shortcuts
      for (const sc of winList) {
        winShortcuts.set(sc, def.id);
      }
      for (const sc of macList) {
        macShortcuts.set(sc, def.id);
      }

      commands.set(def.id, def);
    },

    get(id: string): CommandDef | undefined {
      return commands.get(id);
    },

    list(filter?: (def: CommandDef) => boolean): CommandDef[] {
      const all = Array.from(commands.values());
      return filter ? all.filter(filter) : all;
    },

    run(id: string, ctx: CommandContext, args?: unknown): boolean {
      const def = commands.get(id);
      if (!def) {
        return false;
      }

      if (def.isEnabled && !def.isEnabled(ctx)) {
        return false;
      }

      return def.run(ctx, args);
    },

    isEnabled(id: string, ctx: CommandContext): boolean {
      const def = commands.get(id);
      if (!def) return false;
      return def.isEnabled ? def.isEnabled(ctx) : true;
    },

    isActive(id: string, ctx: CommandContext): boolean {
      const def = commands.get(id);
      if (!def) return false;
      return def.isActive ? def.isActive(ctx) : false;
    },

    getShortcuts(id: string, platform: Platform): string[] {
      const def = commands.get(id);
      if (!def || !def.defaultShortcut) return [];

      const shortcuts = platform === 'mac' ? def.defaultShortcut.mac : def.defaultShortcut.win;
      return normalizeShortcutList(shortcuts);
    },
  };
}

export const defaultCommandRegistry = createCommandRegistry();
export const registry = defaultCommandRegistry;
