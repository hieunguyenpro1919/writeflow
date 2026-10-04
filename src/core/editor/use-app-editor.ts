import { useEditor, type Editor } from '@tiptap/react';
import type { JSONContent } from '@tiptap/core';
import { useTranslation } from 'react-i18next';
import { createExtensions } from './extensions';
import { detectPlatform } from '../keymap/platform';
import { formatShortcut } from '../keymap/format';

export function createWelcomeContent(title: string, hint: string): JSONContent {
  return {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: title }],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: hint }],
      },
    ],
  };
}

export interface UseAppEditorOptions {
  initialContent?: JSONContent;
  onUpdate?: (editor: Editor) => void;
}

export function useAppEditor(options?: UseAppEditorOptions): Editor | null {
  const { t } = useTranslation();
  const platform = detectPlatform();

  const shortcutHint = formatShortcut('Mod-/', platform);
  const defaultContent = createWelcomeContent(
    t('welcome.title'),
    t('welcome.hint', { shortcut: shortcutHint }),
  );

  const editor = useEditor({
    extensions: createExtensions(),
    content: options?.initialContent ?? defaultContent,
    editorProps: {
      attributes: {
        role: 'textbox',
        'aria-multiline': 'true',
        'aria-label': t('editor.ariaLabel'),
      },
    },
    onUpdate: ({ editor: ed }) => {
      options?.onUpdate?.(ed);
    },
  });

  return editor;
}
