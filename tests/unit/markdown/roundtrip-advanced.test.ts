import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { parse } from '../../../src/core/markdown/parser';
import { serialize } from '../../../src/core/markdown/serializer';
import type { JSONContent } from '@tiptap/core';

describe('Advanced Markdown Round-trip Test Suite (Task 2.2 / Plan 9.1-9.4)', () => {
  const fixturesDir = path.resolve(__dirname, '../../fixtures/markdown');

  describe('1. Nested Bullet & Ordered Lists', () => {
    it('should parse and serialize multi-level nested bullet lists', () => {
      const input = '- Item 1\n  - Item 1.1\n  - Item 1.2\n    - Item 1.2.1\n- Item 2\n';
      const result = parse(input);

      expect(result.doc.content?.[0].type).toBe('bulletList');

      const serialized = serialize(result.doc);
      expect(serialized).toBe(input);
    });

    it('should parse and serialize multi-level nested ordered lists', () => {
      const input = '1. First\n   1. First child\n   2. Second child\n2. Second\n';
      const result = parse(input);

      expect(result.doc.content?.[0].type).toBe('orderedList');

      const serialized = serialize(result.doc);
      expect(serialized).toBe(input);
    });

    it('should parse mixed bullet and ordered nested lists', () => {
      const input = '- Main bullet\n  1. Sub ordered 1\n  2. Sub ordered 2\n- Next bullet\n';
      const result = parse(input);

      expect(result.doc.content?.[0].type).toBe('bulletList');

      const serialized = serialize(result.doc);
      expect(serialized).toBe(input);
    });
  });

  describe('2. Task Lists & Task Items ([ ] và [x])', () => {
    it('should parse and serialize uncompleted and completed task items', () => {
      const input = '- [ ] Uncompleted task\n- [x] Completed task\n';
      const result = parse(input);

      expect(result.doc.content?.[0].type).toBe('taskList');
      const items = result.doc.content?.[0].content ?? [];
      expect(items[0].type).toBe('taskItem');
      expect(items[0].attrs?.checked).toBe(false);
      expect(items[1].type).toBe('taskItem');
      expect(items[1].attrs?.checked).toBe(true);

      const serialized = serialize(result.doc);
      expect(serialized).toBe(input);
    });

    it('should parse and serialize nested task items', () => {
      const input = '- [ ] Project alpha\n  - [x] Subtask 1 completed\n  - [ ] Subtask 2 pending\n';
      const result = parse(input);

      expect(result.doc.content?.[0].type).toBe('taskList');

      const serialized = serialize(result.doc);
      expect(serialized).toBe(input);
    });
  });

  describe('3. Nested Blockquotes (> > quote)', () => {
    it('should parse and serialize single and multi-level blockquotes', () => {
      const input = '> Level 1 quote\n>\n> > Level 2 nested quote\n';
      const result = parse(input);

      expect(result.doc.content?.[0].type).toBe('blockquote');

      const serialized = serialize(result.doc);
      expect(serialized).toBe(input);
    });

    it('should parse and serialize 3-level deeply nested blockquotes', () => {
      const input = '> Level 1\n>\n> > Level 2\n> >\n> > > Level 3\n';
      const result = parse(input);

      expect(result.doc.content?.[0].type).toBe('blockquote');

      const serialized = serialize(result.doc);
      expect(serialized).toBe(input);
    });
  });

  describe('4. Fenced Code Blocks with Language declaration', () => {
    it('should parse code block with language attribute and preserve indentation', () => {
      const input =
        '```typescript\nfunction add(a: number, b: number): number {\n  return a + b;\n}\n```\n';
      const result = parse(input);

      const codeBlock = result.doc.content?.[0];
      expect(codeBlock?.type).toBe('codeBlock');
      expect(codeBlock?.attrs?.language).toBe('typescript');
      expect(codeBlock?.content?.[0].text).toContain('return a + b;');

      const serialized = serialize(result.doc);
      expect(serialized).toBe(input);
    });

    it('should parse code block without language attribute', () => {
      const input = '```\nplain text code block\n```\n';
      const result = parse(input);

      const codeBlock = result.doc.content?.[0];
      expect(codeBlock?.type).toBe('codeBlock');

      const serialized = serialize(result.doc);
      expect(serialized).toBe(input);
    });
  });

  describe('5. Horizontal Rules (--- / ***)', () => {
    it('should parse and serialize horizontal rules separating paragraphs', () => {
      const input = 'Above content\n\n---\n\nBelow content\n';
      const result = parse(input);

      const types = result.doc.content?.map((n) => n.type);
      expect(types).toEqual(['paragraph', 'horizontalRule', 'paragraph']);

      const serialized = serialize(result.doc);
      expect(serialized).toBe(input);
    });

    it('should normalize alternative horizontal rule syntax (***) to canonical --- (Plan 9.3)', () => {
      const input = 'Above content\n\n***\n\nBelow content\n';
      const result = parse(input);

      expect(result.doc.content?.[1].type).toBe('horizontalRule');

      const serialized = serialize(result.doc);
      expect(serialized).toBe('Above content\n\n---\n\nBelow content\n');
    });
  });

  describe('6. Strikethrough and URLs/Links', () => {
    it('should parse and serialize strikethrough (~~text~~)', () => {
      const input = 'This is ~~strikethrough text~~ in a paragraph.\n';
      const result = parse(input);

      const paragraph = result.doc.content?.[0];
      const hasStrike = paragraph?.content?.some((n: JSONContent) =>
        n.marks?.some((m) => m.type === 'strike'),
      );
      expect(hasStrike).toBe(true);

      const serialized = serialize(result.doc);
      expect(serialized).toBe(input);
    });

    it('should parse and serialize markdown links ([text](url))', () => {
      const input = 'Visit [WriteFlow](https://github.com/hieunguyenpro1919/writeflow) today.\n';
      const result = parse(input);

      const paragraph = result.doc.content?.[0];
      const linkNode = paragraph?.content?.find((n: JSONContent) =>
        n.marks?.some((m) => m.type === 'link'),
      );
      expect(linkNode).toBeDefined();
      const linkMark = linkNode?.marks?.find((m) => m.type === 'link');
      expect(linkMark?.attrs?.href).toBe('https://github.com/hieunguyenpro1919/writeflow');

      const serialized = serialize(result.doc);
      expect(serialized).toBe(input);
    });

    it('should parse and serialize links combined with bold and italic', () => {
      const input =
        'Check [**Bold Link**](https://example.com/bold) and [*Italic Link*](https://example.com/italic).\n';
      const result = parse(input);

      const serialized = serialize(result.doc);
      expect(serialized).toBe(input);
    });
  });

  describe('7. Round-trip validation on all 4 Fixture Files', () => {
    it('should round-trip lists-nested.md fixture losslessly', () => {
      const fixturePath = path.join(fixturesDir, 'lists-nested.md');
      const input = fs.readFileSync(fixturePath, 'utf8').replace(/\r\n/g, '\n');

      const result = parse(input);
      expect(result.pmNode).toBeDefined();

      const output = serialize(result.doc);
      expect(output).toBe(input);
    });

    it('should round-trip blockquotes-nested.md fixture losslessly', () => {
      const fixturePath = path.join(fixturesDir, 'blockquotes-nested.md');
      const input = fs.readFileSync(fixturePath, 'utf8').replace(/\r\n/g, '\n');

      const result = parse(input);
      expect(result.pmNode).toBeDefined();

      const output = serialize(result.doc);
      expect(output).toBe(input);
    });

    it('should round-trip code-blocks.md fixture losslessly', () => {
      const fixturePath = path.join(fixturesDir, 'code-blocks.md');
      const input = fs.readFileSync(fixturePath, 'utf8').replace(/\r\n/g, '\n');

      const result = parse(input);
      expect(result.pmNode).toBeDefined();

      const output = serialize(result.doc);
      expect(output).toBe(input);
    });

    it('should round-trip advanced-inline.md fixture losslessly', () => {
      const fixturePath = path.join(fixturesDir, 'advanced-inline.md');
      const input = fs.readFileSync(fixturePath, 'utf8').replace(/\r\n/g, '\n');

      const result = parse(input);
      expect(result.pmNode).toBeDefined();

      const output = serialize(result.doc);
      expect(output).toBe(input);
    });
  });

  describe('8. Engine Idempotency on Advanced Structures (Plan 9.7 Rule 2)', () => {
    it('should satisfy serialize(parse(serialize(parse(md)))) === serialize(parse(md)) for all complex fixtures', () => {
      const fixtureNames = [
        'lists-nested.md',
        'blockquotes-nested.md',
        'code-blocks.md',
        'advanced-inline.md',
      ];

      for (const name of fixtureNames) {
        const fixturePath = path.join(fixturesDir, name);
        const md = fs.readFileSync(fixturePath, 'utf8').replace(/\r\n/g, '\n');

        const pass1 = parse(md);
        const serialized1 = serialize(pass1.doc, pass1.frontmatter);

        const pass2 = parse(serialized1);
        const serialized2 = serialize(pass2.doc, pass2.frontmatter);

        expect(serialized2, `Idempotency failed for fixture: ${name}`).toBe(serialized1);
      }
    });
  });

  describe('9. ProseMirror Node bidirectional translation', () => {
    it('should serialize from result.pmNode identically to result.doc for all complex structures', () => {
      const complexDoc = `
# Title

- [ ] Task
  - [x] Subtask

\`\`\`typescript
const x = 10;
\`\`\`

> > Nested quote

---

Check [Link](https://writeflow.app) and ~~strike~~.
`.trim() + '\n';

      const result = parse(complexDoc);
      expect(result.pmNode).toBeDefined();

      const fromJson = serialize(result.doc);
      const fromPm = serialize(result.pmNode!);

      expect(fromPm).toBe(fromJson);
      expect(fromPm).toBe(complexDoc);
    });
  });
});
