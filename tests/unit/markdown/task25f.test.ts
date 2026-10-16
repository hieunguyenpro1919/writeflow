import fs from 'node:fs';
import path from 'node:path';
import { marked, type Token, type Tokens } from 'marked';
import { describe, expect, it } from 'vitest';
import { parse } from '../../../src/core/markdown/parser';
import { serialize } from '../../../src/core/markdown/serializer';

describe('Task 2.5f: Idempotency, PLAN.md strong preservation, Alert with code block', () => {
  describe('Mục 1: express-history.md Idempotency (3 passes)', () => {
    it('achieves s1 === s2 === s3 on minimal isolated snippet of consecutive bullet lists', () => {
      // Minimal reproduction snippet: consecutive bullet list items that parse as separate lists or loose/tight lists
      // causing 3 byte newline discrepancy in original express-history.md
      const minimalSnippet = `- item 1\n\n- item 2\n- item 3\n`;
      const p1 = parse(minimalSnippet);
      const s1 = serialize(p1.doc);
      const p2 = parse(s1);
      const s2 = serialize(p2.doc);
      const p3 = parse(s2);
      const s3 = serialize(p3.doc);

      expect(s2).toBe(s1);
      expect(s3).toBe(s2);
    });

    it('achieves full 3-pass idempotency (s1 === s2 === s3) on oss/express-history.md', () => {
      const filePath = path.resolve(__dirname, '../../fixtures/markdown/corpus/oss/express-history.md');
      const content = fs.readFileSync(filePath, 'utf8');

      const p1 = parse(content);
      const s1 = serialize(p1.doc, p1.frontmatter);
      const p2 = parse(s1);
      const s2 = serialize(p2.doc, p2.frontmatter);
      const p3 = parse(s2);
      const s3 = serialize(p3.doc, p3.frontmatter);

      expect(s1).toBe(s2);
      expect(s2).toBe(s3);
    });
  });

  describe('Mục 2: B5 - Bold preservation in docs/PLAN.md', () => {
    it('preserves **escape** in minimal isolated snippet with code spans and backslash', () => {
      const minimalSnippet = '`\\`, `<` serializer phải **escape** (ví dụ `\\*`) để';
      const p1 = parse(minimalSnippet);
      const s1 = serialize(p1.doc);

      expect(s1).toContain('**escape**');
      expect(s1).not.toContain('\\*\\*escape\\*\\*');

      const tokens = marked.lexer(s1)[0] as Tokens.Paragraph;
      const strongTokens = (tokens?.tokens || []).filter(
        (t): t is Tokens.Strong => t.type === 'strong',
      );
      expect(strongTokens.length).toBeGreaterThanOrEqual(1);
      expect(strongTokens.some((t) => t.text === 'escape')).toBe(true);
    });

    it('preserves **escape** on line 383 of docs/PLAN.md', () => {
      const line383 =
        'Khi người dùng **gõ chữ** `*`, `_`, `#`, `>`, `-`, `1.`, `[`, `` ` ``, `|`, `\\`, `<` ở vị trí mà Markdown sẽ hiểu là cú pháp, serializer phải **escape** (ví dụ `\\*`) để mở lại file vẫn ra đúng chữ ban đầu.';
      const p1 = parse(line383);
      const s1 = serialize(p1.doc);

      expect(s1).toContain('**escape**');
      expect(s1).not.toContain('\\*\\*escape\\*\\*');

      const tokens = marked.lexer(s1)[0] as Tokens.Paragraph;
      const strongTokens = (tokens?.tokens || []).filter(
        (t): t is Tokens.Strong => t.type === 'strong',
      );
      expect(strongTokens.length).toBe(2);
      expect(strongTokens.map((t) => t.text)).toEqual(['gõ chữ', 'escape']);
    });

    it('matches strong and em token counts between original and roundtrip docs/PLAN.md', () => {
      const planPath = path.resolve(process.cwd(), 'docs/PLAN.md');
      const planContent = fs.readFileSync(planPath, 'utf8');

      function countStrongAndEm(text: string) {
        const tokens = marked.lexer(text);
        let strongCount = 0;
        let emCount = 0;
        function walk(t: Token) {
          if (t.type === 'strong') strongCount++;
          if (t.type === 'em') emCount++;
          if ('tokens' in t && Array.isArray(t.tokens)) (t.tokens as Token[]).forEach(walk);
          if ('items' in t && Array.isArray(t.items)) (t.items as Token[]).forEach(walk);
        }
        tokens.forEach(walk);
        return { strongCount, emCount };
      }

      const origCounts = countStrongAndEm(planContent);
      const p1 = parse(planContent);
      const s1 = serialize(p1.doc, p1.frontmatter);
      const s1Counts = countStrongAndEm(s1);

      expect(s1Counts.strongCount).toBe(origCounts.strongCount);
      expect(s1Counts.emCount).toBe(origCounts.emCount);
    });
  });

  describe('Mục 3: GitHub Alert containing code block', () => {
    it('preserves alert with code block without inserting an empty > line', () => {
      const alertWithCode = '> [!WARNING]\n> ```js\n> code()\n> ```\n';
      const p1 = parse(alertWithCode);
      const s1 = serialize(p1.doc);

      expect(s1).toBe(alertWithCode);
    });

    it('preserves alert with list items and normal blockquotes with empty lines', () => {
      const alertWithList = '> [!NOTE]\n> - item 1\n> - item 2\n';
      const p1 = parse(alertWithList);
      const s1 = serialize(p1.doc);
      expect(s1).toBe(alertWithList);

      const alertWithParagraphs = '> [!NOTE]\n>\n> Second paragraph\n';
      const p2 = parse(alertWithParagraphs);
      const s2 = serialize(p2.doc);
      expect(s2).toBe(alertWithParagraphs);
    });
  });
});
