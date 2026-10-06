import { Node, Mark, Extension } from '@tiptap/core';

export interface RawBlockOptions {
  HTMLAttributes: Record<string, unknown>;
}

export interface RawBlockAttributes {
  content: string;
  format?: 'html' | 'table' | 'footnote' | 'reference_def' | 'math' | 'custom' | string;
  inline?: boolean;
}

/**
 * RawBlockExtension (Plan 9.2 / Task 2.3 & 2.4)
 * Protects raw HTML, tables, footnotes, custom containers, and unsupported markdown blocks
 * from being stripped, mutated, or escaped by ProseMirror schema.
 * Operates as an isolating atom block node to guarantee 100% data preservation.
 */
export const RawBlockExtension = Node.create<RawBlockOptions>({
  name: 'rawBlock',

  group: 'block',

  atom: true,

  isolating: true,

  defining: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      content: {
        default: '',
        parseHTML: (element) =>
          element.getAttribute('data-raw-content') || element.textContent || '',
      },
      format: {
        default: 'html',
        parseHTML: (element) => element.getAttribute('data-raw-format') || 'html',
      },
      inline: {
        default: false,
        parseHTML: (element) => element.getAttribute('data-raw-inline') === 'true',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-raw-block]',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const badgeLabel =
      node.attrs.format === 'table'
        ? 'Bảng GFM (Chưa hỗ trợ chỉnh sửa trực quan)'
        : node.attrs.format === 'footnote'
          ? 'Chú thích Footnote (Bảo toàn nguyên vẹn)'
          : node.attrs.format === 'reference_def'
            ? 'Định nghĩa liên kết tham chiếu (Reference Link)'
            : 'Nội dung chưa hỗ trợ chỉnh sửa trực quan';

    return [
      'div',
      {
        'data-raw-block': '',
        'data-raw-format': node.attrs.format ?? 'html',
        'data-raw-inline': String(Boolean(node.attrs.inline)),
        'data-raw-content': node.attrs.content ?? '',
        class: 'raw-block-container',
        ...HTMLAttributes,
      },
      ['div', { class: 'raw-block-badge', contenteditable: 'false' }, badgeLabel],
      [
        'pre',
        { class: 'raw-block-content', contenteditable: 'false' },
        ['code', {}, node.attrs.content ?? ''],
      ],
    ];
  },

  markdownTokenName: 'html',

  parseMarkdown(token) {
    const rawContent = (token.raw ?? token.text ?? '').toString();
    return {
      type: this.name,
      attrs: {
        content: rawContent.trim(),
        format: 'html',
        inline: false,
      },
    };
  },

  renderMarkdown(node) {
    return node.attrs?.content ?? '';
  },
});

/**
 * RawTableExtension (Task 2.4 - Item 1)
 * Hooks into marked's 'table' token and encapsulates raw GFM tables into rawBlock nodes
 * until the visual table editor is introduced in Phase 6.
 */
export const RawTableExtension = Extension.create({
  name: 'rawTable',

  markdownTokenName: 'table',

  parseMarkdown(token) {
    const rawContent = (token.raw ?? token.text ?? '').toString();
    return {
      type: 'rawBlock',
      attrs: {
        content: rawContent.trim(),
        format: 'table',
        inline: false,
      },
    };
  },
});

/**
 * RawDefExtension (Task 2.4 - Item 1)
 * Hooks into marked's 'def' token and encapsulates reference link definitions into rawBlock nodes.
 */
export const RawDefExtension = Extension.create({
  name: 'rawDef',

  markdownTokenName: 'def',

  parseMarkdown(token) {
    const rawContent = (token.raw ?? token.text ?? '').toString();
    return {
      type: 'rawBlock',
      attrs: {
        content: rawContent.trim(),
        format: 'reference_def',
        inline: false,
      },
    };
  },
});

/**
 * RawMathExtension (Task 2.4 - Item 1)
 * Hooks into marked's token stream to capture math blocks ($$ ... $$) into rawBlock nodes.
 */
export const RawMathExtension = Extension.create({
  name: 'rawMath',

  markdownTokenizer: {
    name: 'rawMath',
    level: 'block',
    start(src: string): number {
      const match = src.match(/^\$\$/m);
      return match?.index ?? -1;
    },
    tokenize(src: string) {
      const match = /^\$\$[\s\S]*?\$\$/.exec(src);
      if (match) {
        return {
          type: 'rawMath',
          raw: match[0],
          text: match[0],
        };
      }
      return undefined;
    },
  },

  parseMarkdown(token) {
    const rawContent = (token.raw ?? token.text ?? '').toString();
    return {
      type: 'rawBlock',
      attrs: {
        content: rawContent.trim(),
        format: 'math',
        inline: false,
      },
    };
  },
});

/**
 * RawInlineExtension (Task 2.4 - Item 2)
 * Marks inline HTML tags (like <kbd>, <b>, <span>, <code>) so that they are treated
 * as verbatim raw inline elements, preventing Tiptap from stripping them or converting <b> to **.
 */
export const RawInlineExtension = Mark.create({
  name: 'rawInline',

  priority: 1000,

  code: true, // Crucial: sets codeTypes in MarkdownManager to disable entity escaping

  addAttributes() {
    return {
      tag: {
        default: 'span',
        parseHTML: (element) => element.tagName.toLowerCase(),
      },
      attrs: {
        default: '',
        parseHTML: (element) => {
          const rawAttrs = Array.from(element.attributes)
            .filter((attr) => attr.name !== 'data-raw-inline')
            .map((attr) => `${attr.name}="${attr.value}"`)
            .join(' ');
          return rawAttrs ? ` ${rawAttrs}` : '';
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span' }, { tag: 'kbd' }, { tag: 'b' }, { tag: 'code' }];
  },

  renderHTML({ HTMLAttributes }) {
    const tag = (HTMLAttributes.tag as string) || 'span';
    return [tag, { 'data-raw-inline': '', ...HTMLAttributes }, 0];
  },

  renderMarkdown(node, h) {
    const tag = node.attrs?.tag || 'span';
    const attrs = node.attrs?.attrs || '';
    const content = h.renderChildren(node);
    return `<${tag}${attrs}>${content}</${tag}>`;
  },
});
