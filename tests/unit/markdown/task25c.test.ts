import { describe, it, expect } from 'vitest';
import { parse } from '../../../src/core/markdown/parser';
import { serialize } from '../../../src/core/markdown/serializer';
import type { JSONContent } from '@tiptap/core';

describe('TASK 2.5c — B2, B6, B3, B4 Verification', () => {
  describe('B2: Link wrapping image (badges)', () => {
    it('Case 1: Single badge byte-for-byte', () => {
      const input =
        '[![NPM Version](https://img.shields.io/npm/v/express.svg)](https://npmjs.org/package/express)\n';
      const parsed = parse(input);
      const output = serialize(parsed.doc);
      expect(output).toBe(input);
    });

    it('Case 2: Three consecutive badge lines byte-for-byte (Express README style)', () => {
      const input = [
        '[![NPM Version](https://img.shields.io/npm/v/express.svg)](https://npmjs.org/package/express)',
        '[![NPM Downloads](https://img.shields.io/npm/dm/express.svg)](https://npmjs.org/package/express)',
        '[![Linux Build](https://img.shields.io/github/actions/workflow/status/expressjs/express/ci.yml?branch=master&label=linux)](https://github.com/expressjs/express)',
        '',
      ].join('\n');
      const parsed = parse(input);
      const output = serialize(parsed.doc);
      expect(output).toBe(input);
    });

    it('Case 3: Two badges on one line separated by space (Jest README style)', () => {
      const input =
        '[![badge1](https://img.shields.io/1)](https://url1) [![badge2](https://img.shields.io/2)](https://url2)\n';
      const parsed = parse(input);
      const output = serialize(parsed.doc);
      expect(output).toBe(input);
    });

    it('Case 4: Badge with ? and & in URL', () => {
      const input =
        '[![x](https://img.shields.io/badge/a-b-c.svg?logo=jest&labelColor=99424f)](https://github.com/jestjs/jest)\n';
      const parsed = parse(input);
      const output = serialize(parsed.doc);
      expect(output).toBe(input);
    });

    it('Case 5: Link wrapping text and image', () => {
      const input = '[see ![i](a.png) here](http://x.com)\n';
      const parsed = parse(input);
      const output = serialize(parsed.doc);
      expect(output).toBe(input);
    });
  });

  describe('B6: HTML <a><img></a> in paragraph and heading', () => {
    it('Case 1: Contributor link image byte-for-byte', () => {
      const input =
        '<a href="https://github.com/jestjs/jest/graphs/contributors"><img src="https://opencollective.com/jest/contributors.svg?width=890&button=false" /></a>\n';
      const parsed = parse(input);
      const output = serialize(parsed.doc);
      expect(output).toBe(input);
    });

    it('Case 2: Backers link image with target="_blank" byte-for-byte', () => {
      const input =
        '<a href="https://opencollective.com/jest#backers" target="_blank"><img src="https://opencollective.com/jest/backers.svg?width=890"></a>\n';
      const parsed = parse(input);
      const output = serialize(parsed.doc);
      expect(output).toBe(input);
    });

    it('Case 3: Multiple <a><img></a> on same line separated by space', () => {
      const input =
        '<a href="https://url1"><img src="https://img1.svg" /></a> <a href="https://url2"><img src="https://img2.svg" /></a>\n';
      const parsed = parse(input);
      const output = serialize(parsed.doc);
      expect(output).toBe(input);
    });

    it('Case 4: Redux README header with <a><img> inside heading', () => {
      const input = `# <a href='https://redux.js.org'><img src='https://avatars.githubusercontent.com/u/13142323?s=200&v=4' height='60' alt='Redux Logo' aria-label='redux.js.org' style="display: flex;align-items: center;"/>Redux</a>\n`;
      const parsed = parse(input);
      const output = serialize(parsed.doc);
      expect(output).toBe(input);
    });
  });

  describe('B3: Code spans preserve content including leading/trailing whitespace', () => {
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

    it('Preserves code span: type `` `# ` `` then', () => {
      const input = 'type `` `# ` `` then\n';
      const doc1 = parse(input).doc;
      const out1 = serialize(doc1);
      const doc2 = parse(out1).doc;
      expect(findCodeTexts(doc1)).toEqual(['`# `']);
      expect(findCodeTexts(doc2)).toEqual(['`# `']);
      expect(findCodeTexts(doc2)).toEqual(findCodeTexts(doc1));
    });

    it('Preserves code span: use `` ` x` `` here', () => {
      const input = 'use `` ` x` `` here\n';
      const doc1 = parse(input).doc;
      const out1 = serialize(doc1);
      const doc2 = parse(out1).doc;
      expect(findCodeTexts(doc1)).toEqual(['` x`']);
      expect(findCodeTexts(doc2)).toEqual(['` x`']);
      expect(findCodeTexts(doc2)).toEqual(findCodeTexts(doc1));
    });

    it('Preserves code span: `a `', () => {
      const input = '`a `\n';
      const doc1 = parse(input).doc;
      const out1 = serialize(doc1);
      const doc2 = parse(out1).doc;
      expect(findCodeTexts(doc1)).toEqual(['a ']);
      expect(findCodeTexts(doc2)).toEqual(['a ']);
    });

    it('Preserves code span with spaces on both sides: ` x `', () => {
      const input = '` x `\n';
      const doc1 = parse(input).doc;
      const out1 = serialize(doc1);
      const doc2 = parse(out1).doc;
      expect(findCodeTexts(doc1)).toEqual(['x']);
      expect(findCodeTexts(doc2)).toEqual(['x']);
    });
  });

  describe('B4: HTML comments in code span', () => {
    it('byte-for-byte in paragraph without injecting data-raw span', () => {
      const input = 'use `<!-- c -->` here\n';
      const parsed = parse(input);
      const output = serialize(parsed.doc);
      expect(output).toBe(input);
      expect(output).not.toContain('data-raw');
    });

    it('byte-for-byte in table cell without injecting data-raw span', () => {
      const input = '| `<!-- c -->` | x |\n| --- | --- |\n| 1 | 2 |\n';
      const parsed = parse(input);
      const output = serialize(parsed.doc);
      expect(output).toBe(input);
      expect(output).not.toContain('data-raw');
    });
  });
});
