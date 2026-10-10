import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { extractInventory, getAllCorpusFiles } from '../../../scripts/corpus-report';
import { parse } from '../../../src/core/markdown/parser';
import { serialize } from '../../../src/core/markdown/serializer';

const corpusDir = path.resolve(__dirname, '../../fixtures/markdown/corpus');
const corpusFiles = getAllCorpusFiles(corpusDir);

/**
 * Known failure tracking for corpus files.
 * Rule: NO `it.skip` allowed. Failing files must be actively asserted via knownFailures
 * with error/TD codes (e.g. expect(s2).not.toBe(s1) or asserting lost tags),
 * so that when the bug is fixed in future tasks, the test turns RED to force removal.
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
    group: 3,
    reason: 'Inline HTML tags without rawInline cause unindented/unstable re-serialization across rounds (non-idempotent)',
  },
  '13-html-link-img-extended.md': {
    code: 'TD-12',
    group: 1,
    reason: 'Extended anchor and image HTML tags lose custom attributes when converted to markdown links',
  },
  '14-html-mixed-raw.md': {
    code: 'TD-11',
    group: 1,
    reason: 'Inline HTML tags inside mixed markdown blocks are stripped without rawInline preservation',
  },
  'real/oss-github-cheatsheet.md': {
    code: 'TD-11',
    group: 1,
    reason: 'Inline HTML tags (<kbd>, <mark>, <abbr>) lose tags without rawInline preservation',
  },
  'real/oss-katex-readme.md': {
    code: 'TD-11',
    group: 1,
    reason: 'Inline HTML tags (<sup>, <sub>) lose tags without rawInline preservation',
  },
  'real/oss-redux-readme.md': {
    code: 'TD-11',
    group: 1,
    reason: 'Inline HTML tags (<kbd>, <sub>, <sup>, <mark>, <abbr>) lose tags without rawInline preservation',
  },
  'real/oss-jest-guide.md': {
    code: 'TD-10',
    group: 3,
    reason: 'Fenced code blocks inside ordered list items are unindented on round 2 (non-idempotent)',
  },
  'real/oss-react-tutorial.md': {
    code: 'TD-10',
    group: 3,
    reason: 'Fenced code blocks inside ordered list items are unindented on round 2 (non-idempotent)',
  },
  'real/oss-rust-cli-guide.md': {
    code: 'TD-10',
    group: 3,
    reason: 'Fenced code blocks inside ordered list items are unindented on round 2 (non-idempotent)',
  },
  'real/repo-markdown-normalizations.md': {
    code: 'TD-13',
    group: 3,
    reason: 'Code span with escaped delimiter \\~~~ mutates backtick delimiters on round 2 (non-idempotent)',
  },
};

describe('Corpus Round-trip Evaluation (Task 2.5b & 2.5b-fix)', () => {
  it('has at least 30 corpus files and at least 20 real files', () => {
    expect(corpusFiles.length).toBeGreaterThanOrEqual(30);
    const realFiles = corpusFiles.filter((f) => f.startsWith('real/repo-') || f.startsWith('real/oss-'));
    expect(realFiles.length).toBeGreaterThanOrEqual(20);
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
        it(`actively asserts known failure reproduction (${failureInfo.code})`, () => {
          const p1 = parse(original);
          const s1 = serialize(p1.doc, p1.frontmatter, options);
          const p2 = parse(s1);
          const s2 = serialize(p2.doc, p2.frontmatter, options);

          if (failureInfo.group === 3) {
            // Must actively assert non-idempotency: fails if the engine bug is fixed
            expect(s2).not.toBe(s1);
          } else if (failureInfo.group === 1) {
            // Must actively assert HTML tags data loss: fails if rawInline is implemented
            const invOrig = extractInventory(original);
            const invS1 = extractInventory(s1);
            expect(invS1.htmlBlocks.length).toBeLessThan(invOrig.htmlBlocks.length);
          }
        });
      }
    });
  }
});
