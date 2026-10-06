import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import CodeBlock from '@tiptap/extension-code-block';
import Image from '@tiptap/extension-image';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import type { AnyExtension } from '@tiptap/core';
import {
  RawBlockExtension,
  RawTableExtension,
  RawDefExtension,
  RawMathExtension,
  RawInlineExtension,
} from '../editor/extensions/raw-block';

/**
 * Custom CodeBlock that calculates backtick length dynamically (Plan 9.3).
 * If code content contains 3 backticks, it uses 4 backticks (````), etc.
 */
export const CustomCodeBlock = CodeBlock.extend({
  addKeyboardShortcuts() {
    return {};
  },

  addInputRules() {
    return [];
  },

  renderMarkdown(node, h) {
    const language = node.attrs?.language || '';
    const content = node.content ? h.renderChildren(node.content) : '';

    const match = content.match(/`{3,}/g);
    let maxBackticks = 2;
    if (match) {
      for (const m of match) {
        if (m.length > maxBackticks) {
          maxBackticks = m.length;
        }
      }
    }
    const fenceLength = Math.max(3, maxBackticks + 1);
    const fence = '`'.repeat(fenceLength);

    return `${fence}${language}\n${content}\n${fence}`;
  },
});

/**
 * Custom Link that wraps URLs with spaces in angle brackets <path with space>
 * adhering to CommonMark specification and preserving link destinations.
 */
export const CustomLink = Link.extend({
  renderMarkdown(node, h) {
    const rawHref = node.attrs?.href ?? '';
    const title = node.attrs?.title ?? '';
    const text = h.renderChildren(node);
    const formattedHref =
      rawHref.includes(' ') && !rawHref.startsWith('<') && !rawHref.endsWith('>')
        ? `<${rawHref}>`
        : rawHref;

    return title ? `[${text}](${formattedHref} "${title}")` : `[${text}](${formattedHref})`;
  },
});

/**
 * Custom Image that preserves alt, src, and title attributes losslessly.
 */
export const CustomImage = Image.extend({
  markdownTokenName: 'image',

  parseMarkdown(token) {
    const t = token as { href?: string; text?: string; title?: string };
    return {
      type: this.name,
      attrs: {
        src: t.href || '',
        alt: t.text || '',
        title: t.title || null,
      },
    };
  },

  renderMarkdown(node) {
    const src = node.attrs?.src ?? '';
    const alt = node.attrs?.alt ?? '';
    const title = node.attrs?.title;
    return title ? `![${alt}](${src} "${title}")` : `![${alt}](${src})`;
  },
});

/**
 * Creates the official extensions for WriteFlow Markdown Engine (Phase 2).
 * Supports standard GFM and CommonMark block & inline structures:
 * - Nested bullet and ordered lists
 * - Task lists & task items ([ ] and [x])
 * - Nested blockquotes (> and > >)
 * - Fenced code blocks with language and dynamic backtick fences
 * - Horizontal rules (---)
 * - Headings H1-H6
 * - Inline marks: Bold (**), Italic (*), Strike (~~), Inline Code (`), Links ([text](url))
 * - Images with alt, src, title (![alt](url "title"))
 * - Raw HTML, Tables, Footnotes, Reference definitions, Math blocks (RawBlock & RawInline)
 */
export function createMarkdownEngineExtensions(): AnyExtension[] {
  return [
    StarterKit.configure({
      link: false,
      codeBlock: false,
      underline: false,
      horizontalRule: {},
      strike: {},
      heading: {
        levels: [1, 2, 3, 4, 5, 6],
      },
      trailingNode: false,
    }),
    CustomLink.configure({
      openOnClick: false,
    }),
    CustomCodeBlock,
    CustomImage.configure({
      inline: true,
      allowBase64: true,
    }),
    TaskList,
    TaskItem.configure({
      nested: true,
    }),
    RawBlockExtension,
    RawTableExtension,
    RawDefExtension,
    RawMathExtension,
    RawInlineExtension,
  ];
}
