import { Extension } from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';
import { keydownHandler } from '@tiptap/pm/keymap';
import type { CommandRegistry, CommandContext, Platform, UiBridge } from '../commands/types';
import { defaultCommandRegistry } from '../commands/registry';
import { defaultUiBridge } from '../../components/ui/toast-manager';
import { detectPlatform } from './platform';

export interface KeymapExtensionOptions {
  registry: CommandRegistry;
  platform: Platform;
  ui: UiBridge;
}

export function resolvePlatformKey(shortcut: string, platform: Platform): string {
  if (platform === 'mac') {
    return shortcut.replace(/\bMod\b/g, 'Cmd');
  }
  return shortcut.replace(/\bMod\b/g, 'Ctrl');
}

export const KeymapExtension = Extension.create<KeymapExtensionOptions>({
  name: 'appKeymap',

  addOptions() {
    return {
      registry: defaultCommandRegistry,
      platform: detectPlatform(),
      ui: defaultUiBridge,
    };
  },

  addProseMirrorPlugins() {
    const bindings: Record<string, () => boolean> = {};
    const platform = this.options.platform;
    const registry = this.options.registry;

    // 1. Intercept Ctrl+U (Mod-u): Show unsupported format hint, do not alter document
    const modUKey = resolvePlatformKey('Mod-u', platform);
    bindings[modUKey] = () => {
      this.options.ui.notify('hint.unsupportedFormat');
      return true;
    };

    // 2. Bind all registered commands from registry for the active platform
    const commands = registry.list();
    for (const cmd of commands) {
      const shortcuts = registry.getShortcuts(cmd.id, platform);
      for (const rawShortcut of shortcuts) {
        const platformKey = resolvePlatformKey(rawShortcut, platform);
        bindings[platformKey] = () => {
          const ctx: CommandContext = {
            editor: this.editor,
            ui: this.options.ui,
          };

          if (!registry.isEnabled(cmd.id, ctx)) {
            return false;
          }

          return registry.run(cmd.id, ctx);
        };
      }
    }

    const handler = keydownHandler(bindings);

    return [
      new Plugin({
        props: {
          handleKeyDown: (view, event) => {
            // Khóa khi đang soạn dấu (Plan 8.2)
            if (view.composing || event.isComposing || event.keyCode === 229) {
              return false;
            }

            return handler(view, event);
          },
        },
      }),
    ];
  },
});
