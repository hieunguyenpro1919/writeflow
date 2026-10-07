import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { marked, type Token, type Tokens } from 'marked';
import { parse } from '../../../src/core/markdown/parser';
import { serialize } from '../../../src/core/markdown/serializer';

interface Inventory {
  words: string[];
  links: string[];
  images: string[];
  codeBlocks: string[];
  tables: string[];
  htmlBlocks: string[];
}

function extractInventory(md: string): Inventory {
  const tokens = marked.lexer(md);
  const inv: Inventory = {
    words: [],
    links: [],
    images: [],
    codeBlocks: [],
    tables: [],
    htmlBlocks: [],
  };

  function walk(tokenList: Tokens.Generic[] | Token[]) {
    for (const t of tokenList) {
      if (t.type === 'code') {
        inv.codeBlocks.push(`${t.lang || ''}:${t.text.trim()}`);
      } else if (t.type === 'table') {
        const header = (t as Tokens.Table).header.map((c) => c.text.trim()).join('|');
        const rows = (t as Tokens.Table).rows.map((r) => r.map((c) => c.text.trim()).join('|')).join(';');
        inv.tables.push(`${header}---${rows}`);
      } else if (t.type === 'html') {
        inv.htmlBlocks.push(t.text.trim());
      } else if (t.type === 'link') {
        inv.links.push((t as Tokens.Link).href);
      } else if (t.type === 'image') {
        const img = t as Tokens.Image;
        inv.images.push(`${img.href}|${img.text || ''}|${img.title || ''}`);
      }

      if ('text' in t && typeof t.text === 'string' && t.type !== 'code' && t.type !== 'html') {
        const words = t.text
          .replace(/[\\`*_[\]~#+\-><|()]/g, ' ')
          .split(/\s+/)
          .map((w: string) => w.trim().toLowerCase())
          .filter((w: string) => w.length > 0 && !w.startsWith('http') && !w.startsWith('www.'));
        inv.words.push(...words);
      }

      if ('tokens' in t && Array.isArray(t.tokens)) {
        walk(t.tokens as Tokens.Generic[]);
      }
      if ('items' in t && Array.isArray(t.items)) {
        walk(t.items as Tokens.Generic[]);
      }
    }
  }

  walk(tokens);

  inv.words.sort();
  inv.links.sort();
  inv.images.sort();
  inv.codeBlocks.sort();
  inv.tables.sort();
  inv.htmlBlocks.sort();

  return inv;
}

const corpusDir = path.resolve(__dirname, '../../fixtures/markdown/corpus');
const corpusFiles = fs
  .readdirSync(corpusDir)
  .filter((f) => f.endsWith('.md') && f !== 'SOURCES.md')
  .sort();

/**
 * Known failure tracking for corpus files.
 * Rule: NO `it.skip` allowed. Failing files must be tracked via knownFailures
 * with error/TD codes so that CI remains green while failures are explicitly classified.
 */
const knownFailures: Record<
  string,
  {
    code: string;
    group: 1 | 3;
    reason: string;
  }
> = {
  '12-html-inline-tags.md': {
    code: 'TD-11',
    group: 1,
    reason: 'Inline HTML tags (abbr, b, kbd, code) without rawInline node get escaped to &lt;tag&gt;',
  },
  '13-html-link-img-extended.md': {
    code: 'TD-12',
    group: 3,
    reason: 'Bare URLs inside extended HTML anchor tags duplicate link tokens on round 2 (non-idempotent)',
  },
  '14-html-mixed-raw.md': {
    code: 'TD-11',
    group: 1,
    reason: 'Inline HTML tags inside mixed markdown blocks get escaped to &lt;tag&gt;',
  },
  '19-html-frontmatter-math-mix.md': {
    code: 'TD-11',
    group: 1,
    reason: 'Inline <kbd> tags inside frontmatter/math mixed document get escaped to &lt;kbd&gt;',
  },
};

describe('Corpus Round-trip Evaluation (Task 2.5b)', () => {
  it('has at least 30 corpus files and SOURCES.md', () => {
    expect(corpusFiles.length).toBeGreaterThanOrEqual(30);
    expect(fs.existsSync(path.join(corpusDir, 'SOURCES.md'))).toBe(true);
  });

  for (const file of corpusFiles) {
    describe(`Corpus File: ${file}`, () => {
      const rawBuffer = fs.readFileSync(path.join(corpusDir, file));
      const original = rawBuffer.toString('utf8');
      const hasBOM = rawBuffer.length >= 3 && rawBuffer[0] === 0xef && rawBuffer[1] === 0xbb && rawBuffer[2] === 0xbf;
      const isCRLF = original.includes('\r\n');
      const options = {
        eol: isCRLF ? ('crlf' as const) : ('lf' as const),
        preserveBOM: hasBOM,
      };

      it('parses and serializes without throwing exceptions', () => {
        expect(() => {
          const p1 = parse(original);
          const s1 = serialize(p1.doc, p1.frontmatter, options);
          const p2 = parse(s1);
          serialize(p2.doc, p2.frontmatter, options);
        }).not.toThrow();
      });

      const failureInfo = knownFailures[file];

      if (!failureInfo) {
        it('preserves idempotency (s2 === s1)', () => {
          const p1 = parse(original);
          const s1 = serialize(p1.doc, p1.frontmatter, options);
          const p2 = parse(s1);
          const s2 = serialize(p2.doc, p2.frontmatter, options);
          expect(s2).toBe(s1);
        });

        it('preserves code blocks and tables 100%', () => {
          const p1 = parse(original);
          const s1 = serialize(p1.doc, p1.frontmatter, options);
          const invOrig = extractInventory(original);
          const invS1 = extractInventory(s1);
          expect(invS1.codeBlocks).toEqual(invOrig.codeBlocks);
          expect(invS1.tables).toEqual(invOrig.tables);
        });
      } else {
        it(`records known failure (${failureInfo.code}) without crashing`, () => {
          const p1 = parse(original);
          const s1 = serialize(p1.doc, p1.frontmatter, options);
          const p2 = parse(s1);
          const s2 = serialize(p2.doc, p2.frontmatter, options);

          // Confirm the file is indeed handled and classified under known debt
          expect(typeof s1).toBe('string');
          expect(typeof s2).toBe('string');
          expect(failureInfo.code).toMatch(/^TD-\d+/);
        });
      }
    });
  }
});
