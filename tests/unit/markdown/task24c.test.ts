import { describe, it, expect } from 'vitest';
import { Editor } from '@tiptap/core';
import { parse } from '../../../src/core/markdown/parser';
import { serialize } from '../../../src/core/markdown/serializer';
import { createMarkdownEngineExtensions } from '../../../src/core/markdown/extensions';
import { sameTree } from './helpers';
import type { JSONContent } from '@tiptap/core';

describe('TASK 2.4c — Dứt điểm lỗi serializer (Phase 2)', () => {
  // =========================================================================
  // Nhóm A: Đoạn/khối trống làm serialize crash (RangeError)
  // =========================================================================
  describe('Nhóm A: Empty paragraphs / blocks serialization', () => {
    it('A1: single empty paragraph serializes without crash to empty string', () => {
      const json: JSONContent = {
        type: 'doc',
        content: [{ type: 'paragraph' }],
      };
      const output = serialize(json);
      expect(output).toBe('');
      const reparsed = parse(output);
      expect(serialize(reparsed.doc)).toBe('');
    });

    it('A2: paragraph a, empty paragraph, paragraph b -> exactly "a\\n\\n\\n\\nb\\n"', () => {
      const json: JSONContent = {
        type: 'doc',
        content: [
          { type: 'paragraph', content: [{ type: 'text', text: 'a' }] },
          { type: 'paragraph' },
          { type: 'paragraph', content: [{ type: 'text', text: 'b' }] },
        ],
      };
      const output = serialize(json);
      expect(output).toBe('a\n\n\n\nb\n');
      const reparsed = parse(output);
      expect(serialize(reparsed.doc)).toBe(output);
      expect(sameTree(reparsed.doc, json)).toBe(true);
    });

    it('A3: bulletList > listItem > empty paragraph', () => {
      const json: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [{ type: 'paragraph' }],
              },
            ],
          },
        ],
      };
      const output = serialize(json);
      expect(output).toBe('-\n');
      const reparsed = parse(output);
      expect(serialize(reparsed.doc)).toBe(output);
      expect(sameTree(reparsed.doc, json)).toBe(true);
    });

    it('A4: blockquote > empty paragraph', () => {
      const json: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'blockquote',
            content: [{ type: 'paragraph' }],
          },
        ],
      };
      const output = serialize(json);
      expect(output).toBe('');
    });

    it('A5: taskList > taskItem(checked:false) > empty paragraph', () => {
      const json: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'taskList',
            content: [
              {
                type: 'taskItem',
                attrs: { checked: false },
                content: [{ type: 'paragraph' }],
              },
            ],
          },
        ],
      };
      const output = serialize(json);
      expect(output).toBe('- [ ]\n');
    });

    it('A6: empty heading and empty codeBlock', () => {
      const headingJson: JSONContent = {
        type: 'doc',
        content: [{ type: 'heading', attrs: { level: 1 } }],
      };
      expect(serialize(headingJson)).toBe('');

      const codeBlockJson: JSONContent = {
        type: 'doc',
        content: [{ type: 'codeBlock' }],
      };
      const codeOutput = serialize(codeBlockJson);
      expect(codeOutput).toBe('```\n\n```\n');
      const reparsed = parse(codeOutput);
      expect(serialize(reparsed.doc)).toBe(codeOutput);
      expect(sameTree(reparsed.doc, codeBlockJson)).toBe(true);
    });

    it('A7: Real Tiptap Editor getJSON() with empty paragraph serializes without crash', () => {
      const editor = new Editor({
        extensions: createMarkdownEngineExtensions(),
        content: '<p>a</p><p></p><p>b</p>',
      });
      const json = editor.getJSON();
      const output = serialize(json);
      expect(output).toBe('a\n\n\n\nb\n');
      editor.destroy();
    });
  });

  // =========================================================================
  // Nhóm B: Ngắt dòng cứng ở CUỐI khối (Trailing hardBreak)
  // =========================================================================
  describe('Nhóm B: Trailing hardBreak at block boundary', () => {
    it('B1: paragraph[text a, hardBreak] drops trailing hardBreak -> "a\\n"', () => {
      const json: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'a' }, { type: 'hardBreak' }],
          },
        ],
      };
      expect(serialize(json)).toBe('a\n');
    });

    it('B2: paragraph[text a, hardBreak, hardBreak] drops all trailing hardBreaks -> "a\\n"', () => {
      const json: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'a' },
              { type: 'hardBreak' },
              { type: 'hardBreak' },
            ],
          },
        ],
      };
      expect(serialize(json)).toBe('a\n');
    });

    it('B3: listItem > paragraph[text a, hardBreak] drops trailing hardBreak -> "- a\\n"', () => {
      const json: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'a' }, { type: 'hardBreak' }],
                  },
                ],
              },
            ],
          },
        ],
      };
      expect(serialize(json)).toBe('- a\n');
    });

    it('B4 (KHÔNG ĐƯỢC ĐỔI): paragraph[text a, hardBreak, text b] retains hardBreak -> "a\\\\\\nb\\n"', () => {
      const json: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'a' },
              { type: 'hardBreak' },
              { type: 'text', text: 'b' },
            ],
          },
        ],
      };
      expect(serialize(json)).toBe('a\\\nb\n');
    });
  });

  // =========================================================================
  // Nhóm C: Đường kẻ ngang --- ngay sau paragraph trong container (list, blockquote)
  // =========================================================================
  describe('Nhóm C: Horizontal rule after paragraph in containers', () => {
    it('C1: bulletList > listItem[paragraph a, horizontalRule] prevents Setext heading', () => {
      const json: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [
                  { type: 'paragraph', content: [{ type: 'text', text: 'a' }] },
                  { type: 'horizontalRule' },
                ],
              },
              {
                type: 'listItem',
                content: [
                  { type: 'paragraph', content: [{ type: 'text', text: 'b' }] },
                ],
              },
            ],
          },
        ],
      };
      const output = serialize(json);
      const reparsed = parse(output);
      expect(sameTree(reparsed.doc, json)).toBe(true);
      expect(serialize(reparsed.doc)).toBe(output);
    });

    it('C2: orderedList > listItem[paragraph a, horizontalRule] prevents Setext heading', () => {
      const json: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'orderedList',
            attrs: { start: 1 },
            content: [
              {
                type: 'listItem',
                content: [
                  { type: 'paragraph', content: [{ type: 'text', text: 'a' }] },
                  { type: 'horizontalRule' },
                ],
              },
            ],
          },
        ],
      };
      const output = serialize(json);
      const reparsed = parse(output);
      expect(sameTree(reparsed.doc, json)).toBe(true);
      expect(serialize(reparsed.doc)).toBe(output);
    });

    it('C3: blockquote[paragraph a, horizontalRule] prevents Setext heading', () => {
      const json: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'blockquote',
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: 'a' }] },
              { type: 'horizontalRule' },
            ],
          },
        ],
      };
      const output = serialize(json);
      const reparsed = parse(output);
      expect(sameTree(reparsed.doc, json)).toBe(true);
      expect(serialize(reparsed.doc)).toBe(output);
    });
  });

  // =========================================================================
  // Nhóm D: Dòng chỉ có ký hiệu và định nghĩa tham chiếu
  // =========================================================================
  describe('Nhóm D: Standalone symbols and reference definitions escaping', () => {
    const symbolCases = [
      { text: '#', expected: '\\#\n' },
      { text: '######', expected: '\\######\n' },
      { text: '1.', expected: '1\\.\n' },
      { text: '1)', expected: '1\\)\n' },
      { text: '+', expected: '\\+\n' },
      { text: '[ref]: http://x', expected: '\\[ref]: http://x\n' },
    ];

    for (const { text, expected } of symbolCases) {
      it(`D: paragraph with standalone symbol "${text}" -> "${expected.replace(/\n/g, '\\n')}"`, () => {
        const json: JSONContent = {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text }],
            },
          ],
        };
        const output = serialize(json);
        expect(output).toBe(expected);

        const reparsed = parse(output);
        expect(sameTree(reparsed.doc, json)).toBe(true);
      });
    }

    it('D: [a, hardBreak, "1."] -> "a\\\\\\n1\\.\\n"', () => {
      const json: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'a' },
              { type: 'hardBreak' },
              { type: 'text', text: '1.' },
            ],
          },
        ],
      };
      const output = serialize(json);
      expect(output).toBe('a\\\n1\\.\n');
      const reparsed = parse(output);
      expect(sameTree(reparsed.doc, json)).toBe(true);
    });
  });
});
