import type { Extensions } from '@tiptap/core';
import { KeymapExtension } from '../keymap/keymap-extension';
import { SmartKeysExtension } from './smart-keys';
import type { CommandRegistry, Platform, UiBridge } from '../commands/types';
import { defaultCommandRegistry } from '../commands/registry';
import { detectPlatform } from '../keymap/platform';
import { defaultUiBridge } from '../../components/ui/toast-manager';

import {
  createCoreSchemaExtensions,
  CustomStarterKit,
  CustomTaskList,
  CustomLink,
  CustomCodeBlock,
  CustomImage,
} from '../markdown/extensions';
import {
  RawBlockExtension,
  RawTableExtension,
  RawDefExtension,
  RawMathExtension,
  RawInlineExtension,
  RawHtmlTag,
} from './extensions/raw-block';

export interface CreateExtensionsOptions {
  registry?: CommandRegistry;
  platform?: Platform;
  ui?: UiBridge;
}

export {
  CustomStarterKit,
  CustomTaskList,
  CustomLink,
  CustomCodeBlock,
  CustomImage,
  RawBlockExtension,
  RawTableExtension,
  RawDefExtension,
  RawMathExtension,
  RawInlineExtension,
  RawHtmlTag,
};

/**
 * Creates the official core extensions for WriteFlow Editor (Phase 2).
 * Synchronized with Markdown Engine schema to avoid schema mismatches.
 * Pure function: testable in isolation.
 */
export function createExtensions(options?: CreateExtensionsOptions): Extensions {
  return [
    ...createCoreSchemaExtensions(),
    SmartKeysExtension,
    KeymapExtension.configure({
      registry: options?.registry ?? defaultCommandRegistry,
      platform: options?.platform ?? detectPlatform(),
      ui: options?.ui ?? defaultUiBridge,
    }),
  ];
}
