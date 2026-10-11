import { describe, it, expect } from 'vitest';
import { parse } from '../../../src/core/markdown/parser';
import { serialize } from '../../../src/core/markdown/serializer';
import type { JSONContent } from '@tiptap/core';

describe('TASK 2.5c-fix — B3, B4, B2b, B2c Verification', () => {
  describe('1. B3: U+E000 in text preserved without fixed placeholder collisions', () => {
    function findCodeTexts(node: JSONContent): string[] {
      const res: string[] = [];
      if (node.type === 'text' && node.marks?.some((m) => m.type === 'code')) {
        res.push(node.text || '');
      }
      if (node.content) {
        for (const child of node.content) {
          res.push(...findCodeTexts(child));
        }
      }
      return res;
    }

    it('roundtrips text containing icon \\uE000 end verbatim', () => {
      const input = 'icon \uE000 end\n';
      const parsed = parse(input);
      const output = serialize(parsed.doc);
      expect(output).toBe(input);
    });

    it('roundtrips paragraph with only \\uE000 verbatim', () => {
      const input = '\uE000\n';
      const parsed = parse(input);
      const output = serialize(parsed.doc);
      expect(output).toBe(input);
    });

    it('roundtrips a\\uE000b verbatim', () => {
      const input = 'a\uE000b\n';
      const parsed = parse(input);
      const output = serialize(parsed.doc);
      expect(output).toBe(input);
    });

    it('roundtrips \\uE0A0 (Nerd Fonts) verbatim', () => {
      const input = 'branch \uE0A0 main\n';
      const parsed = parse(input);
      const output = serialize(parsed.doc);
      expect(output).toBe(input);
    });

    it('roundtrips code span with \\uE000: ` \\uE000 `', () => {
      const input = '` \uE000 `\n';
      const doc1 = parse(input).doc;
      const out1 = serialize(doc1);
      const doc2 = parse(out1).doc;
      expect(findCodeTexts(doc1)).toEqual(['\uE000']);
      expect(findCodeTexts(doc2)).toEqual(['\uE000']);
    });

    it('roundtrips code block containing \\uE000 verbatim', () => {
      const input = '```text\nsymbol: \uE000\n```\n';
      const parsed = parse(input);
      const output = serialize(parsed.doc);
      expect(output).toBe(input);
    });

    it('preserves existing B3 cases (# and x with space)', () => {
      const input1 = 'type `` `# ` `` then\n';
      const doc1 = parse(input1).doc;
      const out1 = serialize(doc1);
      const doc1Re = parse(out1).doc;
      expect(findCodeTexts(doc1Re)).toEqual(findCodeTexts(doc1));

      const input2 = 'use `` ` x` `` here\n';
      const doc2 = parse(input2).doc;
      const out2 = serialize(doc2);
      const doc2Re = parse(out2).doc;
      expect(findCodeTexts(doc2Re)).toEqual(findCodeTexts(doc2));

      const input3 = '`a `\n';
      const doc3 = parse(input3).doc;
      const out3 = serialize(doc3);
      const doc3Re = parse(out3).doc;
      expect(findCodeTexts(doc3Re)).toEqual(findCodeTexts(doc3));
    });
  });

  describe('2. B4: Comment restoration restricted to code spans & tables', () => {
    it('code block containing literal raw comment span is preserved byte-for-byte', () => {
      const input =
        '```html\n<span data-raw-inline="" data-raw-comment="true">&lt;!-- x --&gt;</span>\n```\n';
      const parsed = parse(input);
      const output = serialize(parsed.doc);
      expect(output).toBe(input);
    });

    it('raw HTML block containing literal raw comment span is preserved byte-for-byte', () => {
      const input =
        '<div class="custom">\n<span data-raw-inline="" data-raw-comment="true">&lt;!-- x --&gt;</span>\n</div>\n';
      const parsed = parse(input);
      const output = serialize(parsed.doc);
      expect(output).toBe(input);
    });

    it('B4 old cases: <!-- c --> in paragraph code span is byte-for-byte', () => {
      const input = 'use `<!-- c -->` here\n';
      const parsed = parse(input);
      const output = serialize(parsed.doc);
      expect(output).toBe(input);
      expect(output).not.toContain('data-raw');
    });

    it('B4 old cases: <!-- c --> in table cell is byte-for-byte', () => {
      const input = '| `<!-- c -->` | x |\n| --- | --- |\n| 1 | 2 |\n';
      const parsed = parse(input);
      const output = serialize(parsed.doc);
      expect(output).toBe(input);
      expect(output).not.toContain('data-raw');
    });
  });

  describe('3. B2b, B2c: Reference badges and multiple images in link', () => {
    it('B2b Case 1: [![NPM Version][npm-version-image]][npm-url] + two definition lines', () => {
      const input = [
        '[![NPM Version][npm-version-image]][npm-url]',
        '',
        '[npm-version-image]: https://img.shields.io/npm/v/express.svg',
        '[npm-url]: https://npmjs.org/package/express',
        '',
      ].join('\n');
      const parsed = parse(input);
      const output = serialize(parsed.doc);
      expect(output).toBe(input);
    });

    it('B2b Case 2: [![alt](https://i.com/x.svg)][url] (inline image, ref link)', () => {
      const input = [
        '[![alt](https://i.com/x.svg)][url]',
        '',
        '[url]: https://example.com',
        '',
      ].join('\n');
      const parsed = parse(input);
      const output = serialize(parsed.doc);
      expect(output).toBe(input);
    });

    it('B2b Case 3: [![alt][img]](https://u.com) (ref image, inline link)', () => {
      const input = ['[![alt][img]](https://u.com)', '', '[img]: https://i.com/x.svg', ''].join(
        '\n',
      );
      const parsed = parse(input);
      const output = serialize(parsed.doc);
      expect(output).toBe(input);
    });

    it('B2c Case 4: [![a](1.png)![b](2.png)](https://u.com) (two images in one link)', () => {
      const input = '[![a](1.png)![b](2.png)](https://u.com)\n';
      const parsed = parse(input);
      const output = serialize(parsed.doc);
      expect(output).toBe(input);
    });
  });
});
