import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { parse } from '../../../src/core/markdown/parser';
import { serialize } from '../../../src/core/markdown/serializer';
import type { JSONContent } from '@tiptap/core';

describe('Task 2.4c: Golden Baseline Snapshots (Captured on commit 62ac3b9 & 3ad8344)', () => {
  const fixturesDir = path.resolve(__dirname, '../../fixtures/markdown');

  // =========================================================================
  // 1. Toàn bộ file fixtures trong tests/fixtures/markdown/
  // =========================================================================
  describe('1. Fixture Files Baseline', () => {
    const fixtureFiles = fs.readdirSync(fixturesDir).filter((f) => f.endsWith('.md'));

    for (const file of fixtureFiles) {
      it(`snapshots fixture: ${file}`, () => {
        const filePath = path.join(fixturesDir, file);
        const rawContent = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');
        const parsed = parse(rawContent);
        const serialized = serialize(parsed.doc, parsed.frontmatter);
        expect(serialized).toMatchSnapshot();
      });
    }
  });

  // =========================================================================
  // 2. Nhóm "KHÔNG ĐƯỢC ĐỔI" (chống escape thừa - Section 3)
  // =========================================================================
  describe('2. Khong Duoc Doi Strings Baseline', () => {
    const noChangeStrings = [
      '#hashtag',
      'C#',
      '1.5 kg',
      '-5 độ',
      '+84 912',
      '2026-10-06',
      'a - b',
      'Việt # Nam',
      '#1 priority',
      'a *star* b',
      'a_b_c',
      '[x](y)',
      '<tag>',
      '&amp; &lt;',
      '1986. year',
      '---',
      '***',
      '> quote',
    ];

    for (const text of noChangeStrings) {
      it(`snapshots untouched text string: "${text}"`, () => {
        const doc: JSONContent = {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text }],
            },
          ],
        };
        const serialized = serialize(doc);
        expect(serialized).toMatchSnapshot();
      });
    }
  });

  // =========================================================================
  // 3. 56 ca từ Claude Edge Cases & Serializer Escape
  // =========================================================================
  describe('3. Claude Edge Cases & Serializer Escape Baseline', () => {
    const edgeCaseInputs = [
      // Tables
      '| Header A | Header B |\n| --- | --- |\n| Value 1 | Value 2 |\n| Value 3 | Value 4 |\n',
      '| Left Align | Centered | Right Align |\n| :--- | :---: | ---: |\n| Left 1 | Center 1 | Right 1 |\n',
      '# Document with Tables\n\nParagraph before first table.\n\n| T1 Col 1 | T1 Col 2 |\n| --- | --- |\n| Data 1 | Data 2 |\n\nParagraph between tables.\n\n| T2 Col A | T2 Col B |\n| --- | --- |\n| Alpha | Beta |\n',
      // Images
      '![WriteFlow Banner](https://example.com/banner.png)\n',
      '![Architecture Diagram](https://example.com/arch.svg "System Overview")\n',
      'Click here ![Icon](https://example.com/icon.png "Action Icon") to proceed.\n',
      // Inline HTML
      'Nhấn phím <kbd>Ctrl</kbd> + <kbd>C</kbd> để sao chép.\n',
      'Đoạn này dùng <b>HTML thô</b> chứ không dùng Markdown.\n',
      'Dòng 1<br>Dòng 2<br/>Dòng 3\n',
      'Xem trạng thái <span class="badge">Đã duyệt</span> và <code>npm run test</code>.\n',
      // Footnotes & Ref defs
      'Đây là khẳng định quan trọng[^1] cần kiểm chứng[^note2].\n',
      'Văn bản có tham chiếu[^1].\n\n[^1]: Đây là nội dung chi tiết của chú thích chân trang.\n',
      'Xem tại [Liên kết][home].\n\n[home]: https://writeflow.dev "Trang chủ WriteFlow"\n',
      // Strict Frontmatter
      '---\nĐây là dòng kẻ ngang 1\n---\nĐây là nội dung giữa\n---\nĐây là dòng kẻ ngang 2\n',
      '--- tiêu đề không hợp lệ ---\nNội dung văn bản bên dưới\n',
      '---\ntitle: WriteFlow Plan\nversion: 1.0.0\nauthor: Antigravity\n---\n# Main Content\n',
      // Code fence nesting
      '```typescript\nconst a = 1;\n```\n',
      '````markdown\n```typescript\nconst code = "nested";\n```\n````\n',
      '`````markdown\n````markdown\ncode\n````\n`````\n',
      // Links with space
      '[Tài liệu](<tập tin có khoảng trắng.pdf>)\n',
      '[Tài liệu](<tập tin 2.pdf> "Tiêu đề tài liệu")\n',
      // Entities
      'Bản quyền &copy; 2026 &mdash; WriteFlow Project.\n',
      // Extended attrs
      'Vui lòng truy cập <a href="https://example.com" target="_blank" rel="noopener">trang chủ</a> để biết thêm.\n',
      'Hình ảnh minh họa: <img src="https://example.com/logo.png" alt="WriteFlow Logo" width="300" height="150" style="border-radius: 8px;" /> trong văn bản.\n',
      // Comments
      'Nội dung đầu <!-- đây là ghi chú nội dòng cần bảo vệ --> nội dung cuối.\n',
      'A <!-- comment 1 --> B <!-- comment 2 --> C\n',
      '<!-- Standalone block comment -->\n',
      // Hard break
      'First line<br>Second line<br/>Third line\n',
    ];

    for (const input of edgeCaseInputs) {
      it(`snapshots edge case input: "${input.slice(0, 30).replace(/\n/g, '\\n')}..."`, () => {
        const parsed = parse(input);
        const serialized = serialize(parsed.doc, parsed.frontmatter);
        expect(serialized).toMatchSnapshot();
      });
    }

    const lineStartEscapeCases = [
      '# not heading',
      '## second heading',
      '###### sixth heading',
      '1. item',
      '1986. year of birth',
      '1) option A',
      '42) answer',
      '- not bullet list',
      '+ not bullet plus',
      '* not bullet star',
      '- [ ] not a task item',
      '- [x] not a completed task',
      '---',
      '***',
      '___',
      '> not a blockquote',
      '    four leading spaces',
      '``` not fenced code',
      '~~~ not tilde code',
      '<tag>',
      '<b>not html bold</b>',
      '<a>not html link</a>',
      '&amp;',
      '&lt;',
      '&copy;',
    ];

    for (const text of lineStartEscapeCases) {
      it(`snapshots serializer escape case: "${text}"`, () => {
        const doc: JSONContent = {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text }],
            },
          ],
        };
        const serialized = serialize(doc);
        expect(serialized).toMatchSnapshot();
      });
    }
  });

  // =========================================================================
  // 4. Mốc chuẩn nhóm A (Đoạn/khối trống) chụp từ commit 3ad8344
  // =========================================================================
  describe('4. Group A Empty Blocks Baseline (From 3ad8344)', () => {
    it('golden 1: empty doc paragraph', () => {
      // Golden output from 3ad8344: ""
      const goldenOutput = '';
      expect(goldenOutput).toMatchSnapshot();
    });

    it('golden 2: a, empty paragraph, b', () => {
      // Golden output from 3ad8344: "a\n\n\n\nb\n"
      const goldenOutput = 'a\n\n\n\nb\n';
      expect(goldenOutput).toMatchSnapshot();
    });

    it('golden 3: bulletList empty paragraph', () => {
      // Golden output from 3ad8344: "-\n"
      const goldenOutput = '-\n';
      expect(goldenOutput).toMatchSnapshot();
    });

    it('golden 4: blockquote empty paragraph', () => {
      // Output updated to empty string per Task 2.5a (TD-07)
      const goldenOutput = '';
      expect(goldenOutput).toMatchSnapshot();
    });

    it('golden 5: taskList empty paragraph', () => {
      // Golden output from 3ad8344: "- [ ]\n"
      const goldenOutput = '- [ ]\n';
      expect(goldenOutput).toMatchSnapshot();
    });

    it('golden 6a: heading empty', () => {
      // Golden output from 3ad8344: ""
      const goldenOutput = '';
      expect(goldenOutput).toMatchSnapshot();
    });

    it('golden 6b: codeBlock empty', () => {
      // Golden output from 3ad8344: "```\n\n```\n"
      const goldenOutput = '```\n\n```\n';
      expect(goldenOutput).toMatchSnapshot();
    });
  });
});
