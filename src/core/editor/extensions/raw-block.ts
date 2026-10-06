import { Node } from '@tiptap/core';

export interface RawBlockOptions {
  HTMLAttributes: Record<string, unknown>;
}

export interface RawBlockAttributes {
  content: string;
  format?: 'html' | 'custom' | string;
  inline?: boolean;
}

/**
 * RawBlockExtension (Plan 9.2 / Task 2.3)
 * Protects raw HTML, comments, custom containers, and unsupported markdown blocks
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
      [
        'div',
        { class: 'raw-block-badge', contenteditable: 'false' },
        'Nội dung chưa hỗ trợ chỉnh sửa trực quan',
      ],
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
