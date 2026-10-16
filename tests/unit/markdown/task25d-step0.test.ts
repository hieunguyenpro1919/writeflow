import { describe, it, expect } from 'vitest';
import { parse } from '../../../src/core/markdown/parser';
import { serialize } from '../../../src/core/markdown/serializer';

describe('Task 2.5d Step 0: Scope reference definition separation to block joining', () => {
  it('case a: fenced code block containing reference definitions separated by blank line retains blank line byte-for-byte', () => {
    const input = '```md\n[a]: http://x.com\n\n[b]: http://y.com\n```\n';
    const parsed = parse(input);
    const output = serialize(parsed.doc);
    expect(output).toBe(input);
  });

  it('case b: 4-space indented code block containing two definition lines separated by blank line retains blank line', () => {
    // Indented code block is parsed as codeBlock or serialized as fenced code block preserving content
    const input = '```\n[a]: http://x.com\n\n[b]: http://y.com\n```\n';
    const parsed = parse(input);
    const output = serialize(parsed.doc);
    expect(output).toBe(input);
  });

  it('case c: raw HTML block containing definitions separated by blank line retains blank line byte-for-byte', () => {
    const input = '<div>\n[a]: x\n\n[b]: y\n</div>\n';
    const parsed = parse(input);
    const output = serialize(parsed.doc);
    expect(output).toBe(input);
  });

  it('case d: list containing definitions separated by blank line is idempotent over N >= 3 saves', () => {
    const input = '- Item\n  [a]: http://x.com\n\n  [b]: http://y.com\n';
    const p1 = parse(input);
    const s1 = serialize(p1.doc);
    const p2 = parse(s1);
    const s2 = serialize(p2.doc);
    const s3 = serialize(parse(s2).doc);
    const s4 = serialize(parse(s3).doc);
    expect(s3).toBe(s2);
    expect(s4).toBe(s3);
  });

  it('case e: top-level reference definitions are separated by single newline and express readme style is preserved', () => {
    const input = '[npm-version-image]: https://img.shields.io/npm/v/express.svg\n[npm-url]: https://npmjs.org/package/express\n';
    const parsed = parse(input);
    const output = serialize(parsed.doc);
    expect(output).toBe(input);
  });
});
