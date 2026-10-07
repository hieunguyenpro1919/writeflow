import { describe, it, expect } from 'vitest';
import { parse } from '../../../src/core/markdown/parser';
import { serialize } from '../../../src/core/markdown/serializer';
import { sameTree } from './helpers';

describe('Task 2.5a: TD-05 & TD-07 Fixes', () => {
  // =========================================================================
  // TD-05: URL trần có _ (hoặc *, ~)
  // =========================================================================
  describe('TD-05: Bare URLs with special characters (_ * ~ &)', () => {
    it('does not escape _ in bare http URL and re-parses without backslash in text', () => {
      const doc = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'http://a.com/x_y' }],
          },
        ],
      };

      const md = serialize(doc);
      // Đầu ra mong đợi: http://a.com/x_y (không bị escape thành http://a.com/x\_y)
      expect(md).toBe('http://a.com/x_y\n');

      const parsed = parse(md);
      // Khi mở lại, text không chứa dấu \
      const textNode = parsed.doc.content?.[0]?.content?.[0];
      expect(textNode?.text).toBe('http://a.com/x_y');
      expect(textNode?.text).not.toContain('\\');
    });

    it('does not escape characters in see http://a.com/x_y_z?q=1&b=2 ok and preserves & without exposing &amp;', () => {
      const doc = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'see http://a.com/x_y_z?q=1&b=2 ok' }],
          },
        ],
      };

      const md = serialize(doc);
      expect(md).toBe('see http://a.com/x_y_z?q=1&b=2 ok\n');

      const parsed = parse(md);
      // Mở lại: chữ gốc, không có \, không có chữ &amp; lộ ra
      const fullText = parsed.doc.content?.[0]?.content?.map((n) => n.text).join('') ?? '';
      expect(fullText).toContain('http://a.com/x_y_z?q=1&b=2');
      expect(fullText).not.toContain('\\');
      expect(fullText).not.toContain('&amp;');
    });

    it('preserves normal escaping outside bare URL: a_b_c http://x.org/a_b d_e', () => {
      const doc = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'a_b_c http://x.org/a_b d_e' }],
          },
        ],
      };

      const md = serialize(doc);
      // a_b_c và d_e vẫn được escape; URL thì không
      expect(md).toBe('a\\_b\\_c http://x.org/a_b d\\_e\n');

      const parsed = parse(md);
      const text = parsed.doc.content?.[0]?.content?.map((n) => n.text).join('') ?? '';
      expect(text).toContain('a_b_c');
      expect(text).toContain('http://x.org/a_b');
      expect(text).toContain('d_e');
      expect(text).not.toContain('\\');
    });

    it('does not escape _ in bare www URL: www.example.com/a_b', () => {
      const doc = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'www.example.com/a_b' }],
          },
        ],
      };

      const md = serialize(doc);
      expect(md).toBe('www.example.com/a_b\n');

      const parsed = parse(md);
      const textNode = parsed.doc.content?.[0]?.content?.[0];
      expect(textNode?.text).toBe('www.example.com/a_b');
      expect(textNode?.text).not.toContain('\\');
    });
  });

  // =========================================================================
  // TD-07: Trích dẫn chỉ chứa đoạn trống
  // =========================================================================
  describe('TD-07: Blockquote containing only empty paragraph(s)', () => {
    it('serializes blockquote with solitary empty paragraph to empty string directly on first save', () => {
      const doc = {
        type: 'doc',
        content: [
          {
            type: 'blockquote',
            content: [{ type: 'paragraph' }],
          },
        ],
      };

      const md1 = serialize(doc);
      expect(md1).toBe('');

      // Idempotent: lần lưu 1 == lần lưu 2
      const parsed = parse(md1);
      const md2 = serialize(parsed.doc);
      expect(md2).toBe(md1);
    });

    it('serializes blockquote with multiple empty paragraphs to empty string', () => {
      const doc = {
        type: 'doc',
        content: [
          {
            type: 'blockquote',
            content: [{ type: 'paragraph' }, { type: 'paragraph' }],
          },
        ],
      };

      const md1 = serialize(doc);
      expect(md1).toBe('');

      const parsed = parse(md1);
      const md2 = serialize(parsed.doc);
      expect(md2).toBe(md1);
    });

    it('preserves blockquote when it contains meaningful content (quote_e_a)', () => {
      const doc = {
        type: 'doc',
        content: [
          {
            type: 'blockquote',
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: 'Real quote content' }] },
            ],
          },
        ],
      };

      const md = serialize(doc);
      expect(md).toBe('> Real quote content\n');

      const parsed = parse(md);
      expect(sameTree(parsed.doc, doc)).toBe(true);
    });
  });
});
