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

  selectable: true,

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
 * RawHtmlTag (Task 2.5d-fix)
 * Represents individual inline HTML tags (opening, closing, self-closing, void) as atomic inline nodes.
 * Preserves tags byte-for-byte without creating real or dangerous DOM elements.
 */
export const RawHtmlTag = Node.create({
  name: 'rawHtmlTag',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      source: {
        default: '',
        parseHTML: (el) => el.getAttribute('data-raw-source') || el.textContent || '',
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-raw-html-tag]' }];
  },

  renderHTML({ node }) {
    return [
      'span',
      {
        'data-raw-html-tag': '',
        'data-raw-source': node.attrs.source,
        class: 'raw-html-tag',
        title: 'Nội dung chưa hỗ trợ chỉnh sửa trực quan',
        style:
          'font-family: var(--editor-font-mono, monospace); border: 1px solid var(--editor-border-color, #e2e8f0); border-radius: 3px; padding: 1px 4px; background: var(--editor-bg-code, #f8fafc); user-select: all;',
        contenteditable: 'false',
      },
      node.attrs.source,
    ];
  },

  markdownTokenName: 'rawHtmlTag',

  markdownTokenizer: {
    name: 'rawHtmlTag',
    level: 'inline',
    start(src: string): number {
      return src.indexOf('<');
    },
    tokenize(src: string, tokens: unknown) {
      if (src.startsWith('<!--')) return undefined;
      const match = /^<(\/?)([a-zA-Z][\w:-]*)(?:\s+(?:[^"'<>/]+|"[^"]*"|'[^']*')*)*\s*(\/?)>/.exec(
        src,
      );
      if (!match) return undefined;
      if (match[0].includes('data-raw-comment')) return undefined;
      const isClosing = match[1] === '/';
      const tagName = match[2].toLowerCase();
      if (tagName === 'span' && isClosing) {
        const hasCommentSpan =
          Array.isArray(tokens) &&
          tokens.some(
            (t: { type?: string; raw?: string }) =>
              t.type === 'html' && t.raw?.includes('data-raw-comment'),
          );
        if (hasCommentSpan) return undefined;
      }
      if (tagName === 'br' || tagName === 'a' || tagName === 'img') return undefined;
      if (/^(i|em|strong|del|s|strike)$/.test(tagName)) {
        if (isClosing) {
          const hasOpen =
            Array.isArray(tokens) &&
            tokens.some(
              (t: { type?: string; raw?: string }) =>
                t.type === 'html' && new RegExp(`^<${tagName}(\\s|>|$)`, 'i').test(t.raw || ''),
            );
          if (!hasOpen) return { type: 'rawHtmlTag', raw: match[0], text: match[0] };
        } else {
          const hasClose = new RegExp(`</${tagName}(\\s|>|$)`, 'i').test(src);
          if (!hasClose) return { type: 'rawHtmlTag', raw: match[0], text: match[0] };
        }
        return undefined;
      }
      return { type: 'rawHtmlTag', raw: match[0], text: match[0] };
    },
  },

  parseMarkdown(token) {
    return {
      type: this.name,
      attrs: { source: (token.raw ?? token.text ?? '').toString() },
    };
  },

  renderMarkdown(node) {
    return node.attrs?.source ?? '';
  },
});

/**
 * RawInlineExtension (Task 2.4 - Item 2)
 * Marks inline HTML comments so that they are treated as verbatim comments.
 * Also registers RawHtmlTag extension for full schema synchronization.
 */
export const RawInlineExtension = Mark.create({
  name: 'rawInline',
  priority: 1000,
  excludes: '',
  code: true,

  addExtensions() {
    return [RawHtmlTag];
  },

  addAttributes() {
    return {
      isComment: {
        default: false,
        parseHTML: (element) => element.getAttribute('data-raw-comment') === 'true',
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-raw-comment]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', { 'data-raw-inline': '', 'data-raw-comment': 'true', ...HTMLAttributes }, 0];
  },

  renderMarkdown(node, h) {
    return h.renderChildren(node);
  },
});
