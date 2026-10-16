import { describe, it, expect } from 'vitest';
import { parse } from '../../../src/core/markdown/parser';
import { serialize } from '../../../src/core/markdown/serializer';

describe('Task 2.8: TD-09 Verification - HorizontalRule as First/Only Element in List Item', () => {
  it('confirms TD-09 non-idempotency for AST listItem containing only horizontalRule', () => {
    // Reproduction AST: bulletList > listItem > horizontalRule without preceding anchor paragraph
    const docJson = {
      type: 'doc',
      content: [
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [{ type: 'horizontalRule' }],
            },
          ],
        },
      ],
    };

    // First serialization outputs list bullet followed by hr
    const s1 = serialize(docJson);
    expect(s1).toBe('- ---\n');

    // Marked parses "- ---\n" as a root-level horizontalRule rather than bulletList
    const p2 = parse(s1);
    expect(p2.doc.content?.[0]?.type).toBe('horizontalRule');
    expect(p2.doc.content?.[0]?.type).not.toBe('bulletList');

    // Second serialization outputs root hr "---\n"
    const s2 = serialize(p2.doc);
    expect(s2).toBe('---\n');

    // Test vector verification: TD-09 is RED (non-idempotent without anchor paragraph: s1 !== s2)
    // As instructed by Task 2.8: Result is RED, keep technical debt active, DO NOT edit src/.
    expect(s1).not.toBe(s2);
  });

  it('confirms TD-09 behavior for bullet list `* ---` without anchor paragraph', () => {
    const input = '* ---\n';
    const p1 = parse(input);
    // Marked initially parses '* ---' into bulletList > listItem > horizontalRule
    expect(p1.doc.content?.[0]?.type).toBe('bulletList');

    // Serializer canonicalizes bullet to '-'
    const s1 = serialize(p1.doc);
    expect(s1).toBe('- ---\n');

    // On reparse, marked treats '- ---' as root horizontalRule
    const p2 = parse(s1);
    expect(p2.doc.content?.[0]?.type).toBe('horizontalRule');

    const s2 = serialize(p2.doc);
    expect(s2).toBe('---\n');
    expect(s1).not.toBe(s2);
  });

  it('confirms TD-09 behavior for ordered list `1. \\n   ---` without anchor paragraph', () => {
    const input = '1. \n   ---';
    const p1 = parse(input);
    expect(p1.doc.content?.[0]?.type).toBe('orderedList');

    const s1 = serialize(p1.doc);
    expect(s1).toBe('1. ---\n');

    // Reparse converts to paragraph with text "---"
    const p2 = parse(s1);
    const s2 = serialize(p2.doc);
    expect(s2).toBe('1. \\---\n');
    expect(s1).not.toBe(s2);
  });

  it('preserves list structure when listItem has an anchor paragraph before horizontalRule', () => {
    // When an anchor paragraph is present, list structure is preserved
    const docWithAnchor = {
      type: 'doc',
      content: [
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                { type: 'paragraph', content: [{ type: 'text', text: 'Item' }] },
                { type: 'horizontalRule' },
              ],
            },
          ],
        },
      ],
    };

    const s1 = serialize(docWithAnchor);
    const p2 = parse(s1);
    expect(p2.doc.content?.[0]?.type).toBe('bulletList');
  });
});
