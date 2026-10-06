import StarterKit from '@tiptap/starter-kit';
import type { Extensions, AnyExtension } from '@tiptap/core';
import { KeymapExtension } from '../keymap/keymap-extension';
import { SmartKeysExtension } from './smart-keys';
import type { CommandRegistry, Platform, UiBridge } from '../commands/types';
import { defaultCommandRegistry } from '../commands/registry';
import { detectPlatform } from '../keymap/platform';
import { TIPTAP_BLOCKQUOTE_DEFAULT_KEY, TIPTAP_HARDBREAK_DEFAULT_KEY } from '../keymap/shortcuts';
import { defaultUiBridge } from '../../components/ui/toast-manager';

import { CustomLink, CustomCodeBlock, CustomImage } from '../markdown/extensions';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import {
  RawBlockExtension,
  RawTableExtension,
  RawDefExtension,
  RawMathExtension,
  RawInlineExtension,
} from './extensions/raw-block';

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
            delete kept[TIPTAP_BLOCKQUOTE_DEFAULT_KEY];
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
            delete kept[TIPTAP_HARDBREAK_DEFAULT_KEY];
            return kept;
          },
        });
      }

      // Khóa input rules mặc định của horizontalRule (kích hoạt qua Command/Phase 6)
      if (ext.name === 'horizontalRule') {
        return ext.extend({
          addInputRules() {
            return [];
          },
        });
      }

      return ext;
    });
  },
});

export const CustomTaskList = TaskList.extend({
  addKeyboardShortcuts() {
    return {};
  },
});

/**
 * Creates the official core extensions for WriteFlow Editor (Phase 2).
 * Synchronized with Markdown Engine schema to avoid schema mismatches.
 * Pure function: testable in isolation.
 */
export function createExtensions(options?: CreateExtensionsOptions): Extensions {
  return [
    CustomStarterKit.configure({
      // Underline is strictly forbidden in CommonMark / WriteFlow
      underline: false,
      // Handled via CustomLink with angle-bracket preservation
      link: false,
      // Handled via CustomCodeBlock with dynamic backtick fences
      codeBlock: false,
      // Trailing empty paragraph disabled
      trailingNode: false,
      // Horizontal rule enabled in Phase 2
      horizontalRule: {},
      // P1-D2: Schema maintains 6 heading levels
      heading: {
        levels: [1, 2, 3, 4, 5, 6],
      },
    }),
    CustomLink.configure({
      openOnClick: false,
    }),
    CustomCodeBlock,
    CustomImage.configure({
      inline: true,
      allowBase64: true,
    }),
    CustomTaskList,
    TaskItem.configure({
      nested: true,
    }),
    RawBlockExtension,
    RawTableExtension,
    RawDefExtension,
    RawMathExtension,
    RawInlineExtension,
    SmartKeysExtension,
    KeymapExtension.configure({
      registry: options?.registry ?? defaultCommandRegistry,
      platform: options?.platform ?? detectPlatform(),
      ui: options?.ui ?? defaultUiBridge,
    }),
  ];
}
