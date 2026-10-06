import StarterKit from '@tiptap/starter-kit';
import { Link } from '@tiptap/extension-link';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import type { AnyExtension } from '@tiptap/core';

/**
 * Creates the official extensions for WriteFlow Markdown Engine (Phase 2).
 * Supports standard GFM and CommonMark block & inline structures:
 * - Nested bullet and ordered lists
 * - Task lists & task items ([ ] and [x])
 * - Nested blockquotes (> and > >)
 * - Fenced code blocks with language syntax highlighting
 * - Horizontal rules (---)
 * - Headings H1-H6
 * - Inline marks: Bold (**), Italic (*), Strike (~~), Inline Code (`), Links ([text](url))
 */
export function createMarkdownEngineExtensions(): AnyExtension[] {
  return [
    StarterKit.configure({
      link: false,
      underline: false,
      codeBlock: {},
      horizontalRule: {},
      strike: {},
      heading: {
        levels: [1, 2, 3, 4, 5, 6],
      },
      trailingNode: false,
    }),
    Link.configure({
      openOnClick: false,
    }),
    TaskList,
    TaskItem.configure({
      nested: true,
    }),
  ];
}
