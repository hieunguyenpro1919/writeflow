import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { parse } from '../../../src/core/markdown/parser';
import { serialize } from '../../../src/core/markdown/serializer';
import { markdownParser, markdownSerializer } from '../../../src/core/markdown';
import type { JSONContent } from '@tiptap/core';

describe('Base Round-trip Test Harness (Task 2.1 / Plan 9.7)', () => {
  const fixturesDir = path.resolve(__dirname, '../../fixtures/markdown');

  describe('1. Paragraph (Văn bản thường)', () => {
    it('should parse and serialize a single paragraph cleanly', () => {
      const input = 'This is a single paragraph in WriteFlow.\n';
      const result = parse(input);

      expect(result.doc.type).toBe('doc');
      expect(result.doc.content).toBeDefined();
      expect(result.doc.content?.[0].type).toBe('paragraph');

      // Verify ProseMirror Node generation
      expect(result.pmNode).toBeDefined();
      expect(result.pmNode?.type.name).toBe('doc');

      // Round-trip from ProseMirror Node
      const serializedFromPm = serialize(result.pmNode!);
      expect(serializedFromPm).toBe(input);

      // Round-trip from JSONContent
      const serializedFromJson = serialize(result.doc);
      expect(serializedFromJson).toBe(input);
    });

    it('should round-trip multiple paragraphs from fixture', () => {
      const fixturePath = path.join(fixturesDir, 'paragraph.md');
      const input = fs.readFileSync(fixturePath, 'utf8').replace(/\r\n/g, '\n');

      const result = parse(input);
      expect(result.doc.content?.length).toBe(2);

      const serialized = serialize(result.doc);
      expect(serialized).toBe(input);
    });
  });

  describe('2. Inline formatting (In đậm, In nghiêng, Mã nội dòng)', () => {
    it('should preserve bold (**text**), italic (*text*), and code (`text`) marks', () => {
      const input = 'Here is **bold text**, *italic text*, and `inline code`.\n';
      const result = parse(input);

      const paragraph = result.doc.content?.[0];
      expect(paragraph?.type).toBe('paragraph');

      // Verify mark types in AST
      const textNodes = paragraph?.content ?? [];
      const hasBold = textNodes.some((n: JSONContent) =>
        n.marks?.some((m) => m.type === 'bold'),
      );
      const hasItalic = textNodes.some((n: JSONContent) =>
        n.marks?.some((m) => m.type === 'italic'),
      );
      const hasCode = textNodes.some((n: JSONContent) =>
        n.marks?.some((m) => m.type === 'code'),
      );

      expect(hasBold).toBe(true);
      expect(hasItalic).toBe(true);
      expect(hasCode).toBe(true);

      // Round-trip test from ProseMirror Node
      const serialized = serialize(result.pmNode!);
      expect(serialized).toBe(input);
    });

    it('should round-trip inline formatting fixture with 100% fidelity', () => {
      const fixturePath = path.join(fixturesDir, 'inline-formatting.md');
      const input = fs.readFileSync(fixturePath, 'utf8').replace(/\r\n/g, '\n');

      const result = parse(input);
      const output = serialize(result.doc);
      expect(output).toBe(input);
    });
  });

  describe('3. Headings (Tiêu đề H1, H2, H3)', () => {
    it('should parse and serialize H1, H2, and H3 correctly', () => {
      const input = '# Heading 1\n\n## Heading 2\n\n### Heading 3\n';
      const result = parse(input);

      expect(result.doc.content?.length).toBe(3);

      const [h1, h2, h3] = result.doc.content!;
      expect(h1.type).toBe('heading');
      expect(h1.attrs?.level).toBe(1);

      expect(h2.type).toBe('heading');
      expect(h2.attrs?.level).toBe(2);

      expect(h3.type).toBe('heading');
      expect(h3.attrs?.level).toBe(3);

      // Round-trip from ProseMirror Node
      const serialized = serialize(result.pmNode!);
      expect(serialized).toBe(input);
    });

    it('should round-trip headings fixture', () => {
      const fixturePath = path.join(fixturesDir, 'headings.md');
      const input = fs.readFileSync(fixturePath, 'utf8').replace(/\r\n/g, '\n');

      const result = parse(input);
      const output = serialize(result.doc);
      expect(output).toBe(input);
    });
  });

  describe('4. YAML Frontmatter separation & preservation', () => {
    it('should cleanly extract and preserve standard frontmatter', () => {
      const input =
        '---\ntitle: Test\n---\n\n# Document Title\n\nBody content goes here.\n';
      const result = parse(input);

      // Frontmatter must be cleanly isolated
      expect(result.frontmatter).toBeDefined();
      expect(result.frontmatter?.raw).toBe('title: Test');
      expect(result.frontmatter?.attributes?.title).toBe('Test');

      // Spike S2 guard: Ensure doc does NOT falsely contain horizontal_rule or fake heading
      const nodeTypes = result.doc.content?.map((n) => n.type) ?? [];
      expect(nodeTypes).not.toContain('horizontalRule');
      expect(result.doc.content?.[0].type).toBe('heading');
      expect(result.doc.content?.[0].content?.[0].text).toBe('Document Title');

      // Serializing with frontmatter produces valid standard YAML frontmatter header
      const serialized = serialize(result.doc, result.frontmatter);
      expect(serialized).toContain('---\ntitle: Test\n---');
      expect(serialized).toContain('# Document Title');
      expect(serialized).toContain('Body content goes here.');
    });

    it('should round-trip standard multi-line YAML frontmatter fixture', () => {
      const fixturePath = path.join(fixturesDir, 'frontmatter.md');
      const input = fs.readFileSync(fixturePath, 'utf8').replace(/\r\n/g, '\n');

      const result = parse(input);
      expect(result.frontmatter).toBeDefined();
      expect(result.frontmatter?.attributes?.title).toBe('Test');

      const output = serialize(result.doc, result.frontmatter);
      expect(output).toBe(input);
    });

    it('should parse multi-attribute frontmatter correctly', () => {
      const input =
        '---\ntitle: "WriteFlow Engine"\nauthor: PO\nversion: 2\ndraft: true\n---\n\n# Welcome\n';
      const result = parse(input);

      expect(result.frontmatter).toBeDefined();
      expect(result.frontmatter?.attributes).toEqual({
        title: 'WriteFlow Engine',
        author: 'PO',
        version: 2,
        draft: true,
      });

      const output = serialize(result.doc, result.frontmatter);
      expect(output).toBe(input);
    });
  });

  describe('5. Engine Idempotency (Plan 9.7 Rule 2)', () => {
    it('should satisfy serialize(parse(serialize(parse(x)))) == serialize(parse(x))', () => {
      const input =
        '---\ntitle: Idempotent\n---\n\n# Main Heading\n\nThis is **bold** text and `inline code`.\n';

      const pass1 = parse(input);
      const serialized1 = serialize(pass1.doc, pass1.frontmatter);

      const pass2 = parse(serialized1);
      const serialized2 = serialize(pass2.doc, pass2.frontmatter);

      expect(serialized2).toBe(serialized1);
    });
  });

  describe('6. Parser and Serializer Class Instances', () => {
    it('should support markdownParser and markdownSerializer exported objects', () => {
      const input = '# Hello World\n\nSimple text paragraph.\n';
      const parsed = markdownParser.parse(input);
      expect(parsed.doc.type).toBe('doc');

      const output = markdownSerializer.serialize(parsed.doc);
      expect(output).toBe(input);
    });
  });

  describe('7. Line Ending & BOM Support (Plan 9.6)', () => {
    it('should detect and serialize CRLF when requested', () => {
      const input = '# Heading\r\n\r\nParagraph text.\r\n';
      const parsed = parse(input);
      expect(parsed.detectedEol).toBe('crlf');

      const output = serialize(parsed.doc, undefined, { eol: 'crlf' });
      expect(output).toBe('# Heading\r\n\r\nParagraph text.\r\n');
    });

    it('should detect UTF-8 BOM and preserve it if requested in options', () => {
      const input = '\ufeff# Heading with BOM\n\nParagraph text.\n';
      const parsed = parse(input);
      expect(parsed.hasBOM).toBe(true);

      const output = serialize(parsed.doc, undefined, { preserveBOM: true });
      expect(output.charCodeAt(0)).toBe(0xfeff);
      expect(output.slice(1)).toBe('# Heading with BOM\n\nParagraph text.\n');
    });
  });
});
