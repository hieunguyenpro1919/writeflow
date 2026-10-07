import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import CodeBlock from '@tiptap/extension-code-block';
import Image from '@tiptap/extension-image';
import Paragraph from '@tiptap/extension-paragraph';
import HardBreak from '@tiptap/extension-hard-break';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import type { AnyExtension } from '@tiptap/core';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import {
  RawBlockExtension,
  RawTableExtension,
  RawDefExtension,
  RawMathExtension,
  RawInlineExtension,
} from '../editor/extensions/raw-block';

/**
 * Escapes characters at the start of a paragraph or internal hard-break lines
 * to prevent plain text from mutating into markdown block structures on re-parsing (Plan 9.5 P0).
 */
export function escapeParagraphLineStarts(content: string): string {
  const lines = content.split('\n');
  const escapedLines = lines.map((line) => {
    // 1. Heading # or ## etc. followed by space or end of line (Task 2.4c Group D)
    let l = line.replace(/^(#{1,6})(\s+|$)/, '\\$1$2');
    // 2. Ordered list: 1. or 1986. or 1) followed by space or end of line (Task 2.4c Group D)
    l = l.replace(/^([0-9]+)([.)])(\s+|$)/, '$1\\$2$3');
    // 3. Task list: - [ ] or - [x]
    l = l.replace(/^([-+*])\s+\[([ xX])\](\s+)/, '\\$1 \\[$2\\]$3');
    // 4. Bullet list: - or + or * followed by space or end of line (Task 2.4c Group D)
    l = l.replace(/^([-+*])(\s+|$)/, '\\$1$2');
    // 5. Horizontal rule: --- or *** or ___
    l = l.replace(/^([-*_]{3,})(\s*)$/, '\\$1$2');
    // 6. Blockquote: >
    l = l.replace(/^(>\s*)/, '\\$1');
    // 7. Indented code: 4 spaces at line start
    l = l.replace(/^ {4}/, '&#32;   ');
    // 8. Fenced code: ``` or ~~~
    l = l.replace(/^(`{3,}|~{3,})/, '\\$1');
    // 9. Plain text reference definition line: [ref]: http (Task 2.4c Group D)
    l = l.replace(/^(\[[^\]]+\]:)/, '\\$1');
    // 10. Plain text tags &lt;tag&gt; or <tag> -> \<tag>
    l = l.replace(/^&lt;(\/?(?:[a-zA-Z][\w-]*))/, '\\<$1');
    return l;
  });
  return escapedLines.join('\n');
}

/**
 * Custom Paragraph extension that avoids infinite recursion on empty content (Task 2.4c Group A),
 * trims trailing hardBreaks at block boundaries (Task 2.4c Group B),
 * and automatically escapes syntax at line starts (Plan 9.5 P0).
 */
export const CustomParagraph = Paragraph.extend({
  renderMarkdown(node, h, ctx) {
    if (!node) {
      return '';
    }

    const content = Array.isArray(node.content) ? node.content : [];

    // Trim trailing hardBreak nodes at block boundary (Task 2.4c Group B)
    let end = content.length;
    while (end > 0 && content[end - 1]?.type === 'hardBreak') {
      end--;
    }
    const trimmed = end < content.length ? content.slice(0, end) : content;

    if (trimmed.length === 0) {
      // Emit &nbsp; for consecutive empty paragraphs to preserve blank lines
      const prevContent = Array.isArray(ctx?.previousNode?.content) ? ctx.previousNode.content : [];
      const prevIsEmpty = ctx?.previousNode?.type === 'paragraph' && prevContent.length === 0;
      return prevIsEmpty ? '&nbsp;' : '';
    }

    const raw = h.renderChildren(trimmed);
    return escapeParagraphLineStarts(raw);
  },
});

/**
 * Custom HardBreak extension that outputs hard breaks with trailing backslash (Plan 9.3).
 */
export const CustomHardBreak = HardBreak.extend({
  renderMarkdown() {
    return '\\\n';
  },
});

/**
 * Custom HorizontalRule extension that ensures a blank line between paragraph and hr
 * in list containers to prevent CommonMark Setext heading collision (Task 2.4c Group C).
 */
export const CustomHorizontalRule = HorizontalRule.extend({
  renderMarkdown(_node, _h, ctx) {
    if (ctx?.previousNode?.type === 'paragraph' && ctx?.parentType === 'listItem') {
      return '\n---';
    }
    return '---';
  },
});

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
 * and preserves extended HTML attributes (target, rel, class, style, id) as raw HTML <a> tags.
 */
export const CustomLink = Link.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      target: {
        default: null,
        parseHTML: (el) => el.getAttribute('target'),
      },
      rel: {
        default: null,
        parseHTML: (el) => el.getAttribute('rel'),
      },
      class: {
        default: null,
        parseHTML: (el) => el.getAttribute('class'),
      },
      style: {
        default: null,
        parseHTML: (el) => el.getAttribute('style'),
      },
      id: {
        default: null,
        parseHTML: (el) => el.getAttribute('id'),
      },
    };
  },

  renderMarkdown(node, h) {
    const rawHref = node.attrs?.href ?? '';
    const title = node.attrs?.title ?? '';
    const target = node.attrs?.target;
    const rel = node.attrs?.rel;
    const className = node.attrs?.class;
    const style = node.attrs?.style;
    const id = node.attrs?.id;
    const text = h.renderChildren(node);

    // If extended attributes are present, output verbatim raw HTML <a> tag
    if (target || rel || className || style || id) {
      const parts = [`href="${rawHref}"`];
      if (target) parts.push(`target="${target}"`);
      if (rel) parts.push(`rel="${rel}"`);
      if (title) parts.push(`title="${title}"`);
      if (className) parts.push(`class="${className}"`);
      if (style) parts.push(`style="${style}"`);
      if (id) parts.push(`id="${id}"`);
      return `<a ${parts.join(' ')}>${text}</a>`;
    }

    const formattedHref =
      rawHref.includes(' ') && !rawHref.startsWith('<') && !rawHref.endsWith('>')
        ? `<${rawHref}>`
        : rawHref;

    return title ? `[${text}](${formattedHref} "${title}")` : `[${text}](${formattedHref})`;
  },
});

/**
 * Custom Image that preserves alt, src, title attributes,
 * and preserves extended attributes (width, height, style, class, id) as raw HTML <img> tags.
 */
export const CustomImage = Image.extend({
  markdownTokenName: 'image',

  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (el) => el.getAttribute('width'),
      },
      height: {
        default: null,
        parseHTML: (el) => el.getAttribute('height'),
      },
      style: {
        default: null,
        parseHTML: (el) => el.getAttribute('style'),
      },
      class: {
        default: null,
        parseHTML: (el) => el.getAttribute('class'),
      },
      id: {
        default: null,
        parseHTML: (el) => el.getAttribute('id'),
      },
    };
  },

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
    const width = node.attrs?.width;
    const height = node.attrs?.height;
    const style = node.attrs?.style;
    const className = node.attrs?.class;
    const id = node.attrs?.id;

    // If extended attributes are present, output verbatim raw HTML <img> tag
    if (width || height || style || className || id) {
      const parts = [`src="${src}"`];
      if (alt) parts.push(`alt="${alt}"`);
      if (title) parts.push(`title="${title}"`);
      if (width) parts.push(`width="${width}"`);
      if (height) parts.push(`height="${height}"`);
      if (style) parts.push(`style="${style}"`);
      if (className) parts.push(`class="${className}"`);
      if (id) parts.push(`id="${id}"`);
      return `<img ${parts.join(' ')} />`;
    }

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
 * - CustomParagraph with line-start syntax escaping (Plan 9.5 P0)
 * - CustomHardBreak with backslash newline (Plan 9.3)
 * - Inline marks: Bold (**), Italic (*), Strike (~~), Inline Code (`), Links ([text](url))
 * - Images with alt, src, title (![alt](url "title"))
 * - Extended attribute preservation for <a> and <img>
 * - Raw HTML, Tables, Footnotes, Reference definitions, Math blocks (RawBlock & RawInline)
 */
export function createMarkdownEngineExtensions(): AnyExtension[] {
  return [
    StarterKit.configure({
      link: false,
      codeBlock: false,
      underline: false,
      horizontalRule: false,
      strike: {},
      heading: {
        levels: [1, 2, 3, 4, 5, 6],
      },
      trailingNode: false,
      hardBreak: false,
      paragraph: false,
    }),
    CustomParagraph,
    CustomHardBreak,
    CustomHorizontalRule,
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
