import StarterKit from '@tiptap/starter-kit';
import type { Extensions, AnyExtension } from '@tiptap/core';
import { KeymapExtension } from '../keymap/keymap-extension';
import type { CommandRegistry, Platform, UiBridge } from '../commands/types';
import { defaultCommandRegistry } from '../commands/registry';
import { detectPlatform } from '../keymap/platform';
import { defaultUiBridge } from '../../components/ui/toast-manager';

export interface CreateExtensionsOptions {
  registry?: CommandRegistry;
  platform?: Platform;
  ui?: UiBridge;
}

export const CustomStarterKit = StarterKit.extend({
  addExtensions() {
    const parentExtensions: AnyExtension[] = this.parent ? this.parent() : [];

    return parentExtensions.map((ext) => {
      // Gỡ phím tắt định dạng mặc định (Task 1.3 / Phụ lục A)
      if (
        ['bold', 'italic', 'strike', 'code', 'heading', 'bulletList', 'orderedList'].includes(
          ext.name,
        )
      ) {
        return ext.extend({
          addKeyboardShortcuts() {
            return {};
          },
        });
      }

      // Giữ Backspace (structural), gỡ Mod-Shift-b (formatting)
      if (ext.name === 'blockquote') {
        return ext.extend({
          addKeyboardShortcuts() {
            const parent = this.parent ? this.parent() : {};
            const kept = { ...parent };
            delete kept['Mod-Shift-b'];
            return kept;
          },
        });
      }

      // P1-D6: Chỉ giữ Shift-Enter, gỡ Mod-Enter khỏi ngắt dòng cứng
      if (ext.name === 'hardBreak') {
        return ext.extend({
          addKeyboardShortcuts() {
            const parent = this.parent ? this.parent() : {};
            const kept = { ...parent };
            delete kept['Mod-Enter'];
            return kept;
          },
        });
      }

      return ext;
    });
  },
});

/**
 * Creates the official core extensions for WriteFlow Phase 1.
 * Pure function: testable in isolation.
 */
export function createExtensions(options?: CreateExtensionsOptions): Extensions {
  return [
    CustomStarterKit.configure({
      // P1-D5: Tắt các extension chưa thuộc Phase 1
      underline: false,
      link: false,
      codeBlock: false,
      horizontalRule: false,
      trailingNode: false,

      // P1-D2: Schema giữ 6 cấp heading
      heading: {
        levels: [1, 2, 3, 4, 5, 6],
      },
    }),
    KeymapExtension.configure({
      registry: options?.registry ?? defaultCommandRegistry,
      platform: options?.platform ?? detectPlatform(),
      ui: options?.ui ?? defaultUiBridge,
    }),
  ];
}
