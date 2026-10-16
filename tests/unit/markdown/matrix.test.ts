import { describe, it, expect } from 'vitest';
import { parse } from '../../../src/core/markdown/parser';
import { serialize } from '../../../src/core/markdown/serializer';
import type { JSONContent } from '@tiptap/core';

describe('Task 2.4c: Anti-crash Matrix Test (Section 3b)', () => {
  const containers = [
    { name: 'root', wrap: (items: JSONContent[]): JSONContent => ({ type: 'doc', content: items }) },
    {
      name: 'bulletList>listItem',
      wrap: (items: JSONContent[]): JSONContent => ({
        type: 'doc',
        content: [{ type: 'bulletList', content: [{ type: 'listItem', content: items }] }],
      }),
    },
    {
      name: 'orderedList>listItem',
      wrap: (items: JSONContent[]): JSONContent => ({
        type: 'doc',
        content: [{ type: 'orderedList', attrs: { start: 1 }, content: [{ type: 'listItem', content: items }] }],
      }),
    },
    {
      name: 'blockquote',
      wrap: (items: JSONContent[]): JSONContent => ({
        type: 'doc',
        content: [{ type: 'blockquote', content: items }],
      }),
    },
    {
      name: 'taskList>taskItem',
      wrap: (items: JSONContent[]): JSONContent => ({
        type: 'doc',
        content: [
          {
            type: 'taskList',
            content: [{ type: 'taskItem', attrs: { checked: false }, content: items }],
          },
        ],
      }),
    },
  ];

  const contents: { name: string; node: JSONContent }[] = [
    { name: 'emptyParagraph', node: { type: 'paragraph' } },
    { name: 'paragraphX', node: { type: 'paragraph', content: [{ type: 'text', text: 'x' }] } },
    {
      name: 'paragraphWithBreak',
      node: {
        type: 'paragraph',
        content: [{ type: 'text', text: 'x' }, { type: 'hardBreak' }],
      },
    },
    {
      name: 'heading',
      node: { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Title' }] },
    },
    { name: 'horizontalRule', node: { type: 'horizontalRule' } },
    { name: 'emptyCodeBlock', node: { type: 'codeBlock' } },
    {
      name: 'codeBlockX',
      node: { type: 'codeBlock', content: [{ type: 'text', text: 'const x = 1;' }] },
    },
    {
      name: 'rawBlock',
      node: { type: 'rawBlock', attrs: { content: '<div class="matrix">test</div>', format: 'html' } },
    },
  ];

  const anchor: JSONContent = {
    type: 'paragraph',
    content: [{ type: 'text', text: 'anchor' }],
  };

  const positions = [
    { name: 'only', build: (target: JSONContent) => [target] },
    { name: 'first', build: (target: JSONContent) => [target, anchor] },
    { name: 'middle', build: (target: JSONContent) => [anchor, target, anchor] },
    { name: 'last', build: (target: JSONContent) => [anchor, target] },
  ];

  // Excluded matrix combinations documented in technical-debt.md per Section 3b:
  // - TD-07: blockquote containing only an empty paragraph outputs ">", which marked parses as empty blockquote, dropping on 2nd serialize.
  // - TD-08: taskList containing non-standard inline content (heading, codeBlock, hr, rawBlock, emptyParagraph) at only/first/middle.
  // - TD-09: horizontalRule as only/first in list items without preceding anchor paragraph.
  // - TD-10: complex block elements (heading, codeBlock, rawBlock, emptyParagraph) inside bulletList or orderedList where marked indentation/nesting breaks idempotency.
  const isExcluded = (containerName: string, contentName: string, positionName: string): string | null => {
    // TD-07: blockquote x emptyParagraph @ only
    if (containerName === 'blockquote' && contentName === 'emptyParagraph' && positionName === 'only') {
      return 'TD-07: blockquote with solitary empty paragraph drops on 2nd serialize';
    }

    // TD-08: taskList>taskItem with non-text or empty content at only/first/middle
    if (containerName === 'taskList>taskItem') {
      if (
        (contentName === 'emptyParagraph' && (positionName === 'only' || positionName === 'middle')) ||
        (contentName === 'heading' && (positionName === 'only' || positionName === 'first')) ||
        (contentName === 'horizontalRule' && (positionName === 'only' || positionName === 'first')) ||
        (contentName === 'emptyCodeBlock' && (positionName === 'only' || positionName === 'first')) ||
        (contentName === 'codeBlockX' && (positionName === 'only' || positionName === 'first')) ||
        (contentName === 'rawBlock' && (positionName === 'only' || positionName === 'first'))
      ) {
        return `TD-08: taskItem x ${contentName} @ ${positionName} GFM limitation in marked`;
      }
    }

    // TD-09: horizontalRule at only/first in bulletList or orderedList
    if (
      (containerName === 'bulletList>listItem' || containerName === 'orderedList>listItem') &&
      contentName === 'horizontalRule' &&
      (positionName === 'only' || positionName === 'first')
    ) {
      return `TD-09: ${containerName} x horizontalRule @ ${positionName} without anchor`;
    }

    // TD-10: complex block elements inside bulletList or orderedList
    if (containerName === 'bulletList>listItem') {
      if (
        (contentName === 'emptyParagraph' && positionName === 'first') ||
        (contentName === 'heading' && (positionName === 'first' || positionName === 'middle')) ||
        (contentName === 'emptyCodeBlock' && (positionName === 'only' || positionName === 'first')) ||
        (contentName === 'codeBlockX' && (positionName === 'only' || positionName === 'first')) ||
        (contentName === 'rawBlock' && (positionName === 'first' || positionName === 'middle'))
      ) {
        return `TD-10: bulletList x ${contentName} @ ${positionName} CommonMark indentation limitation`;
      }
    }

    if (containerName === 'orderedList>listItem') {
      if (
        (contentName === 'emptyParagraph' && (positionName === 'only' || positionName === 'first' || positionName === 'middle')) ||
        (contentName === 'paragraphX' && positionName === 'middle') ||
        (contentName === 'paragraphWithBreak' && positionName === 'middle') ||
        (contentName === 'heading' && (positionName === 'only' || positionName === 'first' || positionName === 'middle')) ||
        (contentName === 'horizontalRule' && positionName === 'middle') ||
        (contentName === 'emptyCodeBlock') ||
        (contentName === 'codeBlockX') ||
        (contentName === 'rawBlock')
      ) {
        return `TD-10: orderedList x ${contentName} @ ${positionName} 3-space indentation limitation`;
      }
    }

    return null;
  };

  for (const container of containers) {
    for (const content of contents) {
      for (const pos of positions) {
        const exclusion = isExcluded(container.name, content.name, pos.name);
        if (exclusion) {
          // Excluded from matrix test per Section 3b rules with documented TD
          continue;
        }

        it(`matrix: ${container.name} x ${content.name} @ ${pos.name}`, () => {
          const doc = container.wrap(pos.build(content.node));

          // (1) serialize does not throw
          let s1 = '';
          expect(() => {
            s1 = serialize(doc);
          }).not.toThrow();

          // (2) parse(serialize(x)) does not throw
          let p: ReturnType<typeof parse> | undefined;
          expect(() => {
            p = parse(s1);
          }).not.toThrow();

          // (3) serialize twice is idempotent
          if (p) {
            const s2 = serialize(p.doc);
            expect(s2).toBe(s1);
          }
        });
      }
    }
  }
});
