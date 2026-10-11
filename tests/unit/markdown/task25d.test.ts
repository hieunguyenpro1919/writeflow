import { describe, it, expect } from 'vitest';
import { parse } from '../../../src/core/markdown/parser';
import { serialize } from '../../../src/core/markdown/serializer';

describe('Task 2.5d Part 1: Preserve inline HTML tags (B1)', () => {
  it('preserves H<sub>2</sub>O byte-for-byte', () => {
    const input = 'H<sub>2</sub>O\n';
    const output = serialize(parse(input).doc);
    expect(output).toBe(input);
  });

  it('preserves E=mc<sup>2</sup> byte-for-byte', () => {
    const input = 'E=mc<sup>2</sup>\n';
    const output = serialize(parse(input).doc);
    expect(output).toBe(input);
  });

  it('preserves <mark>x</mark> byte-for-byte', () => {
    const input = '<mark>x</mark>\n';
    const output = serialize(parse(input).doc);
    expect(output).toBe(input);
  });

  it('preserves <small>s</small> byte-for-byte', () => {
    const input = '<small>s</small>\n';
    const output = serialize(parse(input).doc);
    expect(output).toBe(input);
  });

  it('preserves <u>x</u> byte-for-byte', () => {
    const input = '<u>x</u>\n';
    const output = serialize(parse(input).doc);
    expect(output).toBe(input);
  });

  it('preserves <abbr title="W3C">W3C</abbr> byte-for-byte', () => {
    const input = '<abbr title="W3C">W3C</abbr>\n';
    const output = serialize(parse(input).doc);
    expect(output).toBe(input);
  });

  it('preserves <span class="a">x</span> byte-for-byte', () => {
    const input = '<span class="a">x</span>\n';
    const output = serialize(parse(input).doc);
    expect(output).toBe(input);
  });

  it('preserves press <kbd>Ctrl</kbd> byte-for-byte', () => {
    const input = 'press <kbd>Ctrl</kbd>\n';
    const output = serialize(parse(input).doc);
    expect(output).toBe(input);
  });

  it('preserves <mark>**b**</mark> byte-for-byte with inner markdown', () => {
    const input = '<mark>**b**</mark>\n';
    const output = serialize(parse(input).doc);
    expect(output).toBe(input);
  });

  it('allows canonical markdown normalization for i, em, strong, del', () => {
    expect(serialize(parse('<i>text</i>\n').doc)).toBe('*text*\n');
    expect(serialize(parse('<em>text</em>\n').doc)).toBe('*text*\n');
    expect(serialize(parse('<strong>text</strong>\n').doc)).toBe('**text**\n');
    expect(serialize(parse('<del>text</del>\n').doc)).toBe('~~text~~\n');
  });
});

describe('Task 2.5d Part 2: <br> and hard breaks normalization (B1b)', () => {
  it('normalizes a<br>b to a\\ newline b', () => {
    const input = 'a<br>b\n';
    const output = serialize(parse(input).doc);
    expect(output).toBe('a\\\nb\n');
  });

  it('normalizes First line<br> newline Second line without blank line or new paragraph', () => {
    const input = 'First line<br>\nSecond line\n';
    const output = serialize(parse(input).doc);
    expect(output).toBe('First line\\\nSecond line\n');
  });

  it('handles Mermaid case: consecutive <br/> tags without extra blank lines or inflating', () => {
    const input = 'Line 1<br/>\n<br/>\nLine 2\n';
    const s1 = serialize(parse(input).doc);
    expect(s1).toBe('Line 1\\\n\\\nLine 2\n');
    const s2 = serialize(parse(s1).doc);
    expect(s2).toBe(s1);
  });

  it('handles Lodash case: environments.<br> newline Review the ... without new paragraph', () => {
    const input = 'environments.<br>\nReview the build differences\n';
    const output = serialize(parse(input).doc);
    expect(output).toBe('environments.\\\nReview the build differences\n');
  });

  it('strips <br> at end of paragraph like trailing hard break without trailing \\', () => {
    const input = 'End of paragraph<br>\n';
    const output = serialize(parse(input).doc);
    expect(output).toBe('End of paragraph\n');
  });

  it('is idempotent over N >= 3 saves and backslash is never doubled to \\\\', () => {
    const input = 'First line<br>\nSecond line\n';
    const s1 = serialize(parse(input).doc);
    const s2 = serialize(parse(s1).doc);
    const s3 = serialize(parse(s2).doc);
    const s4 = serialize(parse(s3).doc);
    expect(s1).toBe('First line\\\nSecond line\n');
    expect(s2).toBe(s1);
    expect(s3).toBe(s2);
    expect(s4).toBe(s3);
    expect(s4).not.toContain('\\\\');
  });
});
