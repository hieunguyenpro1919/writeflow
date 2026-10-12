import { describe, it, expect } from 'vitest';
import { parse, serialize } from '../../../src/core/markdown';

describe('Task 2.5e+g: Minimal escaping for text (N1) & GitHub callout alerts (B8)', () => {
  describe('1. Minimal escaping for plain text (N1)', () => {
    const cases = [
      'R&D',
      'AT&T',
      'Node >= 20',
      'a > b',
      'a < b',
      'x<y',
      '1 < 2 && 3 > 2',
      'C&A',
      'supports & pick one',
    ];

    for (const text of cases) {
      it(`preserves byte-for-byte in round-trip: "${text}"`, () => {
        const md = `${text}\n`;
        const serialized = serialize(parse(md).doc);
        expect(serialized).toBe(md);
      });
    }

    it('preserves existing escapes for tag-like syntax', () => {
      // Golden cases / tag cases must still escape if they would otherwise parse as HTML tags
      const tagDoc = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: '<tag>' }],
          },
        ],
      };
      expect(serialize(tagDoc)).toBe('\\<tag&gt;\n');

      const boldDoc = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: '<b>x</b>' }],
          },
        ],
      };
      expect(serialize(boldDoc)).toBe('\\<b&gt;x&lt;/b&gt;\n');
    });

    it('escapes > at the beginning of a line to avoid mutating into blockquote', () => {
      const quoteDoc = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: '> quote' }],
          },
        ],
      };
      expect(serialize(quoteDoc)).toBe('&gt; quote\n');
    });
  });

  describe('2. GitHub callout alerts (B8)', () => {
    it('preserves > [!IMPORTANT]\\n> Nội dung. byte-for-byte', () => {
      const md = '> [!IMPORTANT]\n> Nội dung.\n';
      expect(serialize(parse(md).doc)).toBe(md);
    });

    it('preserves case-insensitive alerts like [!note], [!TIP], [!warning], [!CAUTION]', () => {
      const types = ['NOTE', 'tip', 'Important', 'WARNING', 'caution'];
      for (const t of types) {
        const md = `> [!${t}]\n> Alert message.\n`;
        expect(serialize(parse(md).doc)).toBe(md);
      }
    });

    it('preserves > [!NOTE] followed by list and code block inside blockquote', () => {
      const md = '> [!NOTE]\n> - item 1\n> - item 2\n>\n> ```ts\n> const x = 1;\n> ```\n';
      expect(serialize(parse(md).doc)).toBe(md);
    });

    it('preserves real-world callout lines from Lodash, Axios, Markdown-it', () => {
      const lodashCallout = '> [!WARNING]\n> Lodash v5 is currently in development.\n';
      expect(serialize(parse(lodashCallout).doc)).toBe(lodashCallout);

      const axiosCallout = '> [!NOTE]\n> Please read the documentation before submitting an issue.\n';
      expect(serialize(parse(axiosCallout).doc)).toBe(axiosCallout);

      const mditCallout = '> [!TIP]\n> Use plugins to extend markdown-it functionality.\n';
      expect(serialize(parse(mditCallout).doc)).toBe(mditCallout);
    });

    it('plain text [x] and [x](y) outside callouts still escape brackets as in golden', () => {
      const doc = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: '[x](y)' }],
          },
        ],
      };
      expect(serialize(doc)).toBe('\\[x\\](y)\n');
    });
  });
});
