import { describe, it, expect } from 'vitest';
import { parse } from '../../../src/core/markdown/parser';
import { serialize } from '../../../src/core/markdown/serializer';

describe('Task 2.7: TD-17 Verification - Multiline Code Span Ending with Backslash', () => {
  it('preserves **bold** after a multiline code span ending with a backslash', () => {
    const input = '`multi\nline\\` and **bold**\n';
    const parsed = parse(input);
    const output = serialize(parsed.doc, parsed.frontmatter);

    // Verify AST structure contains a text node with code mark and another text node with bold mark
    const paragraph = parsed.doc.content?.[0];
    expect(paragraph?.type).toBe('paragraph');

    const codeNode = paragraph?.content?.[0];
    expect(codeNode?.text).toBe('multi line\\');
    expect(codeNode?.marks?.some((m) => m.type === 'code')).toBe(true);

    const boldNode = paragraph?.content?.[2];
    expect(boldNode?.text).toBe('bold');
    expect(boldNode?.marks?.some((m) => m.type === 'bold')).toBe(true);

    // Serialized output must contain clean bold markup and roundtrip idempotently
    expect(output).toContain('**bold**');
    expect(output).not.toContain('\\*\\*bold\\*\\*');

    const roundtrip = serialize(parse(output).doc);
    expect(roundtrip).toBe(output);
  });

  it('preserves text after a minimal multiline code span ending with backslash: `a\\n\\` x', () => {
    const input = '`a\n\\` x\n';
    const parsed = parse(input);
    const output = serialize(parsed.doc, parsed.frontmatter);

    expect(output).toContain('x');
    expect(output).not.toContain('\\x');

    const paragraph = parsed.doc.content?.[0];
    const codeNode = paragraph?.content?.[0];
    expect(codeNode?.text).toBe('a \\');
    expect(codeNode?.marks?.some((m) => m.type === 'code')).toBe(true);
  });

  it('preserves multiline code span ending with backslash across 3+ lines with following **bold**', () => {
    const input = '`line1\nline2\nline3\\` and **bold**\n';
    const parsed = parse(input);
    const output = serialize(parsed.doc, parsed.frontmatter);

    expect(output).toContain('**bold**');
    expect(output).not.toContain('\\*\\*bold\\*\\*');

    const paragraph = parsed.doc.content?.[0];
    const codeNode = paragraph?.content?.[0];
    expect(codeNode?.text).toBe('line1 line2 line3\\');
    expect(codeNode?.marks?.some((m) => m.type === 'code')).toBe(true);
  });

  it('preserves multiline code span ending with backslash inside bullet lists', () => {
    const input = '- item 1\n- `multi\nline\\` and **bold**\n- item 3\n';
    const parsed = parse(input);
    const output = serialize(parsed.doc, parsed.frontmatter);

    expect(output).toContain('**bold**');
    expect(output).not.toContain('\\*\\*bold\\*\\*');

    const secondItem = parsed.doc.content?.[0]?.content?.[1];
    expect(secondItem?.type).toBe('listItem');
  });

  it('preserves multiline code span ending with backslash inside ordered lists', () => {
    const input = '1. step 1\n2. `multi\nline\\` and **bold**\n3. step 3\n';
    const parsed = parse(input);
    const output = serialize(parsed.doc, parsed.frontmatter);

    expect(output).toContain('**bold**');
    expect(output).not.toContain('\\*\\*bold\\*\\*');

    const secondItem = parsed.doc.content?.[0]?.content?.[1];
    expect(secondItem?.type).toBe('listItem');
  });
});
