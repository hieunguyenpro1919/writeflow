import { describe, it, expect } from 'vitest';
import { parse } from '../../../src/core/markdown/parser';
import { serialize } from '../../../src/core/markdown/serializer';
import type { JSONContent } from '@tiptap/core';

describe('Task 2.4b: Serializer Line-Start Escaping & Inline Attributes Preservation', () => {
  // =========================================================================
  // Nhóm 1: Escape đầu dòng tại Serializer (Plan 9.5 P0 - Round-trip Tree Comparison)
  // =========================================================================
  describe('Nhóm 1: Line-start syntax escaping (Round-trip doc -> serialize -> parse -> doc)', () => {
    const lineStartCases = [
      { name: 'heading H1 (# )', text: '# not heading' },
      { name: 'heading H2 (## )', text: '## second heading' },
      { name: 'heading H6 (###### )', text: '###### sixth heading' },
      { name: 'ordered list (1. )', text: '1. item' },
      { name: 'ordered list (1986. )', text: '1986. year of birth' },
      { name: 'ordered list with paren (1) )', text: '1) option A' },
      { name: 'ordered list with paren (42) )', text: '42) answer' },
      { name: 'bullet list (- )', text: '- not bullet list' },
      { name: 'bullet list (+ )', text: '+ not bullet plus' },
      { name: 'bullet list (* )', text: '* not bullet star' },
      { name: 'task list unchecked (- [ ] )', text: '- [ ] not a task item' },
      { name: 'task list checked (- [x] )', text: '- [x] not a completed task' },
      { name: 'thematic break dashes (---)', text: '---' },
      { name: 'thematic break stars (***)', text: '***' },
      { name: 'thematic break underscores (___)', text: '___' },
      { name: 'blockquote (> )', text: '> not a blockquote' },
      { name: 'indented code 4 spaces (    )', text: '    four leading spaces' },
      { name: 'fenced code backticks (``` )', text: '``` not fenced code' },
      { name: 'fenced code tildes (~~~ )', text: '~~~ not tilde code' },
      { name: 'plain text tag (<tag>)', text: '<tag>' },
      { name: 'plain text bold tag (<b>)', text: '<b>not html bold</b>' },
      { name: 'plain text link tag (<a>)', text: '<a>not html link</a>' },
      { name: 'plain text html entity (&amp;)', text: '&amp;' },
      { name: 'plain text html entity (&lt;)', text: '&lt;' },
      { name: 'plain text html entity (&copy;)', text: '&copy;' },
    ];

    for (const { name, text } of lineStartCases) {
      it(`preserves plain text as paragraph without mutating into block structure: ${name}`, () => {
        const initialDoc: JSONContent = {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text,
                },
              ],
            },
          ],
        };

        // 1. Serialize
        const serialized = serialize(initialDoc);

        // Verify that escaping happened in serialized markdown
        expect(serialized).not.toBe('');

        // 2. Parse back
        const parseResult = parse(serialized);

        // 3. Round-trip tree comparison: Node structure MUST match initial document 100%
        expect(parseResult.doc.content?.length).toBe(1);
        const paragraphNode = parseResult.doc.content?.[0];
        expect(paragraphNode?.type).toBe('paragraph');

        // Check text content integrity
        expect(paragraphNode?.content?.[0]?.type).toBe('text');
        expect(paragraphNode?.content?.[0]?.text).toBe(text);

        // Exact AST JSON comparison
        expect(parseResult.doc).toEqual(initialDoc);
      });
    }

    it('escapes syntax after internal hardBreak within the same paragraph', () => {
      const initialDoc: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Line 1 text' },
              { type: 'hardBreak' },
              { type: 'text', text: '- not bullet list on second line' },
              { type: 'hardBreak' },
              { type: 'text', text: '# not heading on third line' },
            ],
          },
        ],
      };

      const serialized = serialize(initialDoc);
      expect(serialized).toContain(
        'Line 1 text\\\n\\- not bullet list on second line\\\n\\# not heading on third line',
      );

      const parseResult = parse(serialized);
      expect(parseResult.doc.content?.length).toBe(1);
      expect(parseResult.doc.content?.[0]?.type).toBe('paragraph');
      expect(parseResult.doc).toEqual(initialDoc);
    });
  });

  // =========================================================================
  // Nhóm 2: Bảo toàn thẻ <br> ngắt dòng cứng bằng dấu \ cuối dòng (Plan 9.3)
  // =========================================================================
  describe('Nhóm 2: Hard break normalization to trailing backslash (Plan 9.3)', () => {
    it('serializes hardBreak nodes with trailing backslash (\\\n)', () => {
      const doc: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'First line' },
              { type: 'hardBreak' },
              { type: 'text', text: 'Second line' },
            ],
          },
        ],
      };

      const serialized = serialize(doc);
      expect(serialized).toBe('First line\\\nSecond line\n');

      const parsed = parse(serialized);
      expect(parsed.doc).toEqual(doc);
    });

    it('parses input containing <br> and re-serializes as backslash line break', () => {
      const input = 'First line<br>Second line<br/>Third line\n';
      const parsed = parse(input);

      expect(parsed.doc.content?.length).toBe(1);
      const p = parsed.doc.content?.[0];
      expect(p?.type).toBe('paragraph');

      const serialized = serialize(parsed.doc);
      expect(serialized).toBe('First line\\\nSecond line\\\nThird line\n');

      const reparsed = parse(serialized);
      expect(reparsed.doc).toEqual(parsed.doc);
    });
  });

  // =========================================================================
  // Nhóm 3: Bảo toàn thuộc tính mở rộng cho <a> và <img>
  // =========================================================================
  describe('Nhóm 3: Extended HTML attributes preservation for <a> and <img>', () => {
    it('preserves <a> tag with target="_blank" and rel="noopener" without downgrading to markdown link', () => {
      const input =
        'Vui lòng truy cập <a href="https://example.com" target="_blank" rel="noopener">trang chủ</a> để biết thêm.\n';
      const parsed = parse(input);

      const linkMark = parsed.doc.content?.[0]?.content?.[1]?.marks?.find((m) => m.type === 'link');
      expect(linkMark?.attrs?.target).toBe('_blank');
      expect(linkMark?.attrs?.rel).toBe('noopener');

      const serialized = serialize(parsed.doc);
      expect(serialized).toContain(
        '<a href="https://example.com" target="_blank" rel="noopener">trang chủ</a>',
      );
      expect(serialized).not.toContain('[trang chủ](https://example.com)');
      expect(serialized).toBe(input);

      const reparsed = parse(serialized);
      expect(reparsed.doc).toEqual(parsed.doc);
    });

    it('preserves <img> tag with width, height, and style attributes', () => {
      const input =
        'Hình ảnh minh họa: <img src="https://example.com/logo.png" alt="WriteFlow Logo" width="300" height="150" style="border-radius: 8px;" /> trong văn bản.\n';
      const parsed = parse(input);

      const imgNode = parsed.doc.content?.[0]?.content?.find((n) => n.type === 'image');
      expect(imgNode?.attrs?.width).toBe('300');
      expect(imgNode?.attrs?.height).toBe('150');
      expect(imgNode?.attrs?.style).toBe('border-radius: 8px;');

      const serialized = serialize(parsed.doc);
      expect(serialized).toContain('width="300"');
      expect(serialized).toContain('height="150"');
      expect(serialized).toContain('style="border-radius: 8px;"');
      expect(serialized).not.toContain('![WriteFlow Logo](https://example.com/logo.png)');
      expect(serialized).toBe(input);

      const reparsed = parse(serialized);
      expect(reparsed.doc).toEqual(parsed.doc);
    });
  });

  // =========================================================================
  // Nhóm 4: Bảo toàn Comment HTML nội dòng (Inline Comments)
  // =========================================================================
  describe('Nhóm 4: Inline HTML comments preservation (100% Data Preservation)', () => {
    it('preserves inline HTML comments without deletion or corruption', () => {
      const input = 'Nội dung đầu <!-- đây là ghi chú nội dòng cần bảo vệ --> nội dung cuối.\n';
      const parsed = parse(input);

      expect(parsed.doc.content?.length).toBe(1);
      const p = parsed.doc.content?.[0];
      expect(p?.type).toBe('paragraph');

      const serialized = serialize(parsed.doc);
      expect(serialized).toContain('<!-- đây là ghi chú nội dòng cần bảo vệ -->');
      expect(serialized).toBe(input);

      const reparsed = parse(serialized);
      expect(reparsed.doc).toEqual(parsed.doc);
    });

    it('preserves multiple inline comments in the same paragraph', () => {
      const input = 'A <!-- comment 1 --> B <!-- comment 2 --> C\n';
      const parsed = parse(input);

      const serialized = serialize(parsed.doc);
      expect(serialized).toBe(input);

      const reparsed = parse(serialized);
      expect(reparsed.doc).toEqual(parsed.doc);
    });

    it('does not disturb standalone block HTML comments', () => {
      const input = '<!-- Standalone block comment -->\n';
      const parsed = parse(input);

      expect(parsed.doc.content?.[0]?.type).toBe('rawBlock');
      const serialized = serialize(parsed.doc);
      expect(serialized).toBe(input);
    });
  });
});
