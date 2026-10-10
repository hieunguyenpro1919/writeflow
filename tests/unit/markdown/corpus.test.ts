import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { extractInventory, getAllCorpusFiles } from '../../../scripts/corpus-report';
import { parse } from '../../../src/core/markdown/parser';
import { serialize } from '../../../src/core/markdown/serializer';

const corpusDir = path.resolve(__dirname, '../../fixtures/markdown/corpus');
const corpusFiles = getAllCorpusFiles(corpusDir);

/**
 * Expected SHA-256 Checksums for all 22 Upstream OSS documents.
 * Downloaded bit-for-bit from upstream GitHub on 10/10/2026.
 * Rule: Any accidental mutation of upstream documents MUST fail this snapshot test.
 */
export const EXPECTED_OSS_SHA256: Record<string, string> = {
  'oss/express-readme.md': '600f9f3a8fe35c9657e3bb61d2afbfee9bfe788a764892596bef49ede3c9ef0e',
  'oss/express-history.md': '1319b0362c47f3b05d7919050f5a2ee9226544a5db023ddf37fa95214cc6e180',
  'oss/redux-readme.md': '67a4fe18c6a53e9ca5d20348a7f906dd9f7f50b8e9b8f625375a59a03f428430',
  'oss/prettier-readme.md': 'f1f5a86cd0fd0f6a288882527830a9bbbd5851e3238c4d7426b7bbb496165cd1',
  'oss/vite-readme.md': '588718673f32a3691b8e75b93fb4c2f8e8bc9a6dc0bf61794ba7b6c006594111',
  'oss/zustand-readme.md': '3a53f23dae9f33f7b951cfc6eac1dbdb7def9c722d8f32a70d85190f47d11d5b',
  'oss/electron-readme.md': 'cb788749d3f0d3991e9c17b0cbcd9fd15a8c9bd73e45874d0a936fdbd9d3745b',
  'oss/katex-readme.md': 'ca4488ad71cfdc407baa7dc5086c9b40ead43f9a716bf52c7e89a20dfaab4d90',
  'oss/jest-readme.md': 'd47e8d263e376362ade90221309c66071e58b4a2c87fbfd1899eb9a5d9913291',
  'oss/react-readme.md': '4d20edc8d043718c1459dd5d5e25777a282cc09092ecab0f9cc7559f0eac9842',
  'oss/marked-readme.md': 'b2f958f05b55e66a736a99745c3bb2629793867b39c05f1bb8532722dddabd54',
  'oss/markdown-it-readme.md': '4be181f1920ecce286589cdf3863fac8dedd0aa674a54fb8a7d299978b9701fa',
  'oss/vscode-readme.md': '45a411a3b8d49556fbaa73601befc458ab10ad873fca9088136888c89abb8935',
  'oss/axios-readme.md': 'a3f20983025240b0dc3383c0b6958459956bcd908221ec9c1fab864eb8f651d7',
  'oss/awesome-readme.md': '465cd781335e44587d238f666800104b63d4fc8ba2395d6422974dcba421c616',
  'oss/keep-a-changelog.md': '663c710db14ea1168045f260b2bd4f9f8944f19fe6ece78bc52e1a46ef3243d9',
  'oss/mermaid-readme.md': 'eae450a8a65100cb0f5a4b29b8ebfe9a1b7c57e771887e1471d6726c02cc3dd5',
  'oss/tailwindcss-readme.md': 'a7db79d5cd483c6f6d1a51f4042e32598ec39e2391a5dd5be62a71d59299cda8',
  'oss/tiptap-readme.md': '8cd77367d0107be7325a3915847fda194416805b268bb1d1b993a8332b8a7448',
  'oss/ripgrep-readme.md': '945622d974f65e4e141ef9726c948c2640eebd222c5b101afb6445728283921e',
  'oss/node-contributing.md': 'cef2cec1646de81f622e3916a6edb518d72aea1481ae59cb7f3ce4842ff3fa8c',
  'oss/lodash-readme.md': '882ff84de79568af63234100cfc6497f091195c358cb27b91dc2c4b27692be03',
};

export type DefectCode = 'B2' | 'B6' | 'B1b' | 'B8' | 'N1' | 'TD-10' | 'TD-11' | 'TD-12' | 'TD-13';

export interface KnownFailureInfo {
  codes: DefectCode[];
  reason: string;
  isNonIdempotent?: boolean;
  hasCodeBlockMismatch?: boolean;
}

/**
 * Known failure tracking for corpus files.
 * Rule: NO `it.skip` allowed. Failing files must be actively asserted via knownFailures
 * with error/defect codes (e.g. expect(s2).not.toBe(s1), asserting lost badge links, or escaped callouts),
 * so that when the bug is fixed in future tasks, the test turns RED to force removal.
 */
export const knownFailures: Record<string, KnownFailureInfo> = {
  // Upstream OSS defects
  'oss/axios-readme.md': {
    codes: ['B8'],
    reason: 'Alert callout is escaped (B8)',
  },
  'oss/express-history.md': {
    codes: ['TD-10', 'N1'],
    reason:
      'Indented list code block causes non-idempotent re-serialization and code blocks mismatch (TD-10), bare & to &amp; (N1)',
    isNonIdempotent: true,
    hasCodeBlockMismatch: true,
  },
  'oss/lodash-readme.md': {
    codes: ['B1b', 'B8', 'N1'],
    reason:
      'Trailing backslash doubles on round 2 (B1b), callout escaped (B8), bare & to &amp; (N1)',
    isNonIdempotent: true,
  },
  'oss/markdown-it-readme.md': {
    codes: ['B8', 'N1'],
    reason: 'Callout escaped (B8), bare & to &amp; (N1)',
  },
  'oss/marked-readme.md': {
    codes: ['N1'],
    reason: 'Bare & to &amp; (N1)',
  },
  'oss/mermaid-readme.md': {
    codes: ['B1b'],
    reason: 'Trailing backslash doubles on round 2 (B1b)',
    isNonIdempotent: true,
  },
  'oss/awesome-readme.md': {
    codes: ['N1'],
    reason: 'Bare & converted to &amp; (N1)',
  },
  'oss/express-readme.md': {
    codes: ['N1'],
    reason: 'Bare & converted to &amp; (N1)',
  },
  'oss/keep-a-changelog.md': {
    codes: ['N1'],
    reason: 'Bare & converted to &amp; (N1)',
  },

  // Internal repo documents
  'real/repo-qa-manual.md': {
    codes: ['N1'],
    reason: 'Bare & converted to &amp; (N1)',
  },
  'real/repo-readme.md': {
    codes: ['N1'],
    reason: 'Bare & converted to &amp; (N1)',
  },
  'real/repo-tasks-phase-1.md': {
    codes: ['N1'],
    reason: 'Bare & converted to &amp; (N1)',
  },
  'real/repo-tasks-phase-2.md': {
    codes: ['N1'],
    reason: 'Bare & converted to &amp; (N1)',
  },
  'real/repo-versions.md': {
    codes: ['N1'],
    reason: 'Bare & converted to &amp; (N1)',
  },

  // Synthetic documents
  'synthetic/12-html-inline-tags.md': {
    codes: ['B1b', 'TD-11'],
    reason:
      'Trailing backslash doubles on round 2 (B1b), inline HTML tags stripped without rawInline (TD-11)',
    isNonIdempotent: true,
  },
  'synthetic/13-html-link-img-extended.md': {
    codes: ['TD-12'],
    reason:
      'Extended anchor and image HTML tags lose custom attributes when converted to markdown links (TD-12)',
  },
  'synthetic/14-html-mixed-raw.md': {
    codes: ['TD-11'],
    reason:
      'Inline HTML tags inside mixed markdown blocks are stripped without rawInline preservation (TD-11)',
  },
  'synthetic/27-edge-syntax-as-text.md': {
    codes: ['N1'],
    reason: 'Bare & converted to &amp; (N1)',
  },
};

describe('Corpus Round-trip Evaluation (Task 2.5b-fix2)', () => {
  it('has at least 30 corpus files and at least 20 real files', () => {
    expect(corpusFiles.length).toBeGreaterThanOrEqual(30);
    const realFiles = corpusFiles.filter((f) => f.startsWith('oss/') || f.startsWith('real/'));
    expect(realFiles.length).toBeGreaterThanOrEqual(20);
    expect(fs.existsSync(path.join(corpusDir, 'SOURCES.md'))).toBe(true);
  });

  describe('Integrity Lock: SHA-256 for 22 Upstream OSS Documents', () => {
    for (const [file, expectedHash] of Object.entries(EXPECTED_OSS_SHA256)) {
      it(`verifies SHA-256 integrity of ${file}`, () => {
        const filePath = path.join(corpusDir, file);
        expect(fs.existsSync(filePath)).toBe(true);
        const buffer = fs.readFileSync(filePath);
        const actualHash = crypto.createHash('sha256').update(buffer).digest('hex');
        expect(actualHash).toBe(expectedHash);
      });
    }
  });

  for (const file of corpusFiles) {
    describe(`Corpus File: ${file}`, () => {
      const rawBuffer = fs.readFileSync(path.join(corpusDir, file));
      const original = rawBuffer.toString('utf8');
      const hasBOM =
        rawBuffer.length >= 3 &&
        rawBuffer[0] === 0xef &&
        rawBuffer[1] === 0xbb &&
        rawBuffer[2] === 0xbf;
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

      if (failureInfo?.isNonIdempotent) {
        it(`actively asserts known non-idempotency reproduction (${failureInfo.codes.join(', ')})`, () => {
          const p1 = parse(original);
          const s1 = serialize(p1.doc, p1.frontmatter, options);
          const p2 = parse(s1);
          const s2 = serialize(p2.doc, p2.frontmatter, options);
          // Fails when engine bug is fixed, turning test red
          expect(s2).not.toBe(s1);
        });
      } else {
        it('preserves idempotency (s2 === s1)', () => {
          const p1 = parse(original);
          const s1 = serialize(p1.doc, p1.frontmatter, options);
          const p2 = parse(s1);
          const s2 = serialize(p2.doc, p2.frontmatter, options);
          expect(s2).toBe(s1);
        });
      }

      if (failureInfo?.hasCodeBlockMismatch) {
        it(`actively asserts known code block mismatch reproduction (${failureInfo.codes.join(', ')})`, () => {
          const p1 = parse(original);
          const s1 = serialize(p1.doc, p1.frontmatter, options);
          const invOrig = extractInventory(original);
          const invS1 = extractInventory(s1);
          expect(invS1.codeBlocks).not.toEqual(invOrig.codeBlocks);
        });
      } else {
        it('preserves code blocks and tables 100%', () => {
          const p1 = parse(original);
          const s1 = serialize(p1.doc, p1.frontmatter, options);
          const invOrig = extractInventory(original);
          const invS1 = extractInventory(s1);
          expect(invS1.codeBlocks).toEqual(invOrig.codeBlocks);
          expect(invS1.tables).toEqual(invOrig.tables);
        });
      }

      if (failureInfo) {
        it(`actively asserts known defect reproduction (${failureInfo.codes.join(', ')})`, () => {
          const p1 = parse(original);
          const s1 = serialize(p1.doc, p1.frontmatter, options);
          const p2 = parse(s1);
          const s2 = serialize(p2.doc, p2.frontmatter, options);

          for (const code of failureInfo.codes) {
            if (code === 'B2') {
              // B2: Link wrapping badge image is stripped to bare image
              const origBadges = (original.match(/\[!\[[^\]]*\]\([^)]+\)\]\([^)]+\)/g) || [])
                .length;
              const s1Badges = (s1.match(/\[!\[[^\]]*\]\([^)]+\)\]\([^)]+\)/g) || []).length;
              expect(s1Badges).toBeLessThan(origBadges);
            } else if (code === 'B6') {
              // B6: HTML <a href><img ...></a> converted to bare img
              const origAImg = (
                original.match(/<a\s+[^>]*href[^>]*>[\s\S]*?<img[\s\S]*?<\/a>/gi) || []
              ).length;
              const s1AImg = (s1.match(/<a\s+[^>]*href[^>]*>[\s\S]*?<img[\s\S]*?<\/a>/gi) || [])
                .length;
              expect(s1AImg).toBeLessThan(origAImg);
            } else if (code === 'B1b') {
              // B1b: Trailing backslash / br line break doubles in round 2
              expect(s2).not.toBe(s1);
              expect(s2).toContain('\\\\');
            } else if (code === 'B8') {
              // B8: GitHub callout alerts > [!NOTE] escaped with backslash
              expect(s1).toMatch(/>\s*\\\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)/);
            } else if (code === 'N1') {
              // N1: Bare & in text converted to &amp;
              expect(s1).toContain('&amp;');
            } else if (code === 'TD-10' || code === 'TD-13') {
              expect(s2).not.toBe(s1);
            } else if (code === 'TD-11') {
              // TD-11: HTML tags lost without rawInline
              const invOrig = extractInventory(original);
              const invS1 = extractInventory(s1);
              expect(invS1.htmlBlocks.length).toBeLessThan(invOrig.htmlBlocks.length);
            } else if (code === 'TD-12') {
              // TD-12: HTML extended attributes lost / tags converted
              const invOrig = extractInventory(original);
              const invS1 = extractInventory(s1);
              expect(invS1.htmlBlocks.length).toBeLessThan(invOrig.htmlBlocks.length);
            }
          }
        });
      }
    });
  }
});
