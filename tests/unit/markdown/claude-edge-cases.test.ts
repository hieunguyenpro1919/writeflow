import { describe, it, expect } from 'vitest';
import { parse } from '../../../src/core/markdown/parser';
import { serialize } from '../../../src/core/markdown/serializer';
import type { JSONContent } from '@tiptap/core';

describe('Task 2.4: Claude 48-Case Review Regression Test Suite', () => {
  // =========================================================================
  // Nhóm 1: GFM Tables (Bảo toàn 100% qua rawBlock)
  // =========================================================================
  describe('Nhóm 1: GFM Tables Data Loss Prevention', () => {
    it('encapsulates standard GFM table into rawBlock and does not swallow into empty string', () => {
      const input = [
        '| Header A | Header B |',
        '| --- | --- |',
        '| Value 1 | Value 2 |',
        '| Value 3 | Value 4 |',
        '',
      ].join('\n');

      const result = parse(input);
      expect(result.doc.content).toBeDefined();
      expect(result.doc.content?.length).toBe(1);

      const tableNode = result.doc.content?.[0];
      expect(tableNode?.type).toBe('rawBlock');
      expect(tableNode?.attrs?.format).toBe('table');
      expect(tableNode?.attrs?.content).toContain('| Header A | Header B |');
      expect(tableNode?.attrs?.content).toContain('| Value 1 | Value 2 |');

      const serialized = serialize(result.doc);
      expect(serialized).toBe(input);
    });

    it('preserves alignment colons in GFM table headers', () => {
      const input = [
        '| Left Align | Centered | Right Align |',
        '| :--- | :---: | ---: |',
        '| Left 1 | Center 1 | Right 1 |',
        '',
      ].join('\n');

      const result = parse(input);
      const tableNode = result.doc.content?.[0];
      expect(tableNode?.type).toBe('rawBlock');
      expect(tableNode?.attrs?.content).toBe(input.trim());

      const serialized = serialize(result.doc);
      expect(serialized).toBe(input);
    });

    it('preserves multiple tables interleaved with paragraphs', () => {
      const input = [
        '# Document with Tables',
        '',
        'Paragraph before first table.',
        '',
        '| T1 Col 1 | T1 Col 2 |',
        '| --- | --- |',
        '| Data 1 | Data 2 |',
        '',
        'Paragraph between tables.',
        '',
        '| T2 Col A | T2 Col B |',
        '| --- | --- |',
        '| Alpha | Beta |',
        '',
      ].join('\n');

      const result = parse(input);
      const types = result.doc.content?.map((n: JSONContent) => n.type);
      expect(types).toEqual(['heading', 'paragraph', 'rawBlock', 'paragraph', 'rawBlock']);

      const serialized = serialize(result.doc);
      expect(serialized).toBe(input);
    });
  });

  // =========================================================================
  // Nhóm 2: Image URLs (Cấu trúc ảnh alt, src, title)
  // =========================================================================
  describe('Nhóm 2: Image Structure & URL Preservation', () => {
    it('preserves image src and alt without dropping the image node', () => {
      const input = '![WriteFlow Banner](https://example.com/banner.png)\n';
      const result = parse(input);

      expect(result.doc.content?.length).toBe(1);
      const imageNode = result.doc.content?.[0];
      // May be parsed as top-level image or wrapped in paragraph
      const node =
        imageNode?.type === 'image'
          ? imageNode
          : imageNode?.content?.find((c: JSONContent) => c.type === 'image');

      expect(node).toBeDefined();
      expect(node?.attrs?.src).toBe('https://example.com/banner.png');
      expect(node?.attrs?.alt).toBe('WriteFlow Banner');

      const serialized = serialize(result.doc);
      expect(serialized).toBe(input);
    });

    it('preserves image with title attribute ![alt](url "title")', () => {
      const input = '![Architecture Diagram](https://example.com/arch.svg "System Overview")\n';
      const result = parse(input);

      const serialized = serialize(result.doc);
      expect(serialized).toBe(input);
    });

    it('preserves inline image within a text paragraph', () => {
      const input = 'Click here ![Icon](https://example.com/icon.png "Action Icon") to proceed.\n';
      const result = parse(input);

      const serialized = serialize(result.doc);
      expect(serialized).toBe(input);
    });
  });

  // =========================================================================
  // Nhóm 3: Inline HTML (Bảo toàn thẻ nội dòng rawInline)
  // =========================================================================
  describe('Nhóm 3: Inline HTML & rawInline Protection', () => {
    it('preserves <kbd> tags without escaping to &lt;kbd&gt;', () => {
      const input = 'Nhấn phím <kbd>Ctrl</kbd> + <kbd>C</kbd> để sao chép.\n';
      const result = parse(input);

      const serialized = serialize(result.doc);
      expect(serialized).not.toContain('&lt;kbd&gt;');
      expect(serialized).not.toContain('&lt;/kbd&gt;');
      expect(serialized).toBe(input);
    });

    it('preserves raw <b> tag without stripping or forcibly converting to markdown **', () => {
      const input = 'Đoạn này dùng <b>HTML thô</b> chứ không dùng Markdown.\n';
      const result = parse(input);

      const serialized = serialize(result.doc);
      expect(serialized).toContain('<b>HTML thô</b>');
      expect(serialized).toBe(input);
    });

    it('preserves <br> line break tags or normalizes to CommonMark hard breaks without escaping', () => {
      const input = 'Dòng 1<br>Dòng 2<br/>Dòng 3\n';
      const result = parse(input);

      const serialized = serialize(result.doc);
      expect(serialized).not.toContain('&lt;br&gt;');
      expect(serialized).not.toContain('&lt;br/&gt;');
      // CommonMark / WriteFlow Plan 9.3 allows <br>, 2 spaces, or backslash line breaks
      expect(serialized).toMatch(/Dòng 1(?:<br>| {2}\n|\\\n)Dòng 2(?:<br\/?>| {2}\n|\\\n)Dòng 3/);
    });

    it('preserves <span> with attributes and <code> in HTML form', () => {
      const input =
        'Xem trạng thái <span class="badge">Đã duyệt</span> và <code>npm run test</code>.\n';
      const result = parse(input);

      const serialized = serialize(result.doc);
      expect(serialized).toContain('<span class="badge">Đã duyệt</span>');
      expect(serialized).toContain('<code>npm run test</code>');
      expect(serialized).toBe(input);
    });
  });

  // =========================================================================
  // Nhóm 4: Footnotes (Bảo toàn [^1] và [^1]: ...)
  // =========================================================================
  describe('Nhóm 4: Footnotes Preservation', () => {
    it('preserves inline footnote references without escaping to \\[^1\\]', () => {
      const input = 'Đây là khẳng định quan trọng[^1] cần kiểm chứng[^note2].\n';
      const result = parse(input);

      const serialized = serialize(result.doc);
      expect(serialized).not.toContain('\\[^1\\]');
      expect(serialized).not.toContain('\\[^note2\\]');
      expect(serialized).toContain('[^1]');
      expect(serialized).toContain('[^note2]');
      expect(serialized).toBe(input);
    });

    it('preserves footnote definition blocks without escaping', () => {
      const input = [
        'Văn bản có tham chiếu[^1].',
        '',
        '[^1]: Đây là nội dung chi tiết của chú thích chân trang.',
        '',
      ].join('\n');

      const result = parse(input);
      const serialized = serialize(result.doc);

      expect(serialized).not.toContain('\\[^1\\]:');
      expect(serialized).toContain('[^1]:');
      expect(serialized).toBe(input);
    });

    it('preserves reference link definitions [ref]: url', () => {
      const input = [
        'Xem tại [Liên kết][home].',
        '',
        '[home]: https://writeflow.dev "Trang chủ WriteFlow"',
        '',
      ].join('\n');

      const result = parse(input);
      const defNode = result.doc.content?.find(
        (n: JSONContent) => n.attrs?.format === 'reference_def',
      );
      expect(defNode).toBeDefined();

      const serialized = serialize(result.doc);
      expect(serialized).toContain('[home]: https://writeflow.dev');
    });
  });

  // =========================================================================
  // Nhóm 5: Frontmatter False-Positives
  // =========================================================================
  describe('Nhóm 5: Frontmatter False-Positives & Strict Delimiters', () => {
    it('does NOT swallow plain text between two horizontal rules as frontmatter', () => {
      const input = [
        '---',
        'Đây là một đoạn văn bản thường nằm giữa hai đường kẻ ngang.',
        'Nó không chứa cú pháp key-value của YAML.',
        '---',
        '',
        'Đoạn văn tiếp theo ngoài kẻ ngang.',
        '',
      ].join('\n');

      const result = parse(input);

      // Must NOT be extracted as frontmatter
      expect(result.frontmatter).toBeUndefined();

      // Must be parsed as content in editor
      const allText = JSON.stringify(result.doc);
      expect(allText).toContain('Đây là một đoạn văn bản thường nằm giữa hai đường kẻ ngang.');

      const serialized = serialize(result.doc);
      expect(serialized).toContain('Đây là một đoạn văn bản thường nằm giữa hai đường kẻ ngang.');
    });

    it('does NOT match single-line delimiter (--- text ---) as frontmatter', () => {
      const input = '--- tiêu đề một dòng ---\n\nNội dung chính.\n';
      const result = parse(input);

      // Single line match is eliminated
      expect(result.frontmatter).toBeUndefined();
    });

    it('cleanly extracts genuine multi-line YAML frontmatter', () => {
      const input = [
        '---',
        'title: "Tài liệu kỹ thuật"',
        'author: WriteFlow Team',
        'version: 2.4',
        'tags:',
        '  - markdown',
        '  - editor',
        '---',
        '',
        '# Nội dung chính',
        '',
        'Văn bản thân bài.',
        '',
      ].join('\n');

      const result = parse(input);
      expect(result.frontmatter).toBeDefined();
      expect(result.frontmatter?.attributes?.title).toBe('Tài liệu kỹ thuật');
      expect(result.frontmatter?.attributes?.author).toBe('WriteFlow Team');

      const serialized = serialize(result.doc, result.frontmatter);
      expect(serialized).toBe(input);
    });
  });

  // =========================================================================
  // Nhóm 6: Code Fence Nesting, Link Spaces, HTML Entities
  // =========================================================================
  describe('Nhóm 6: Code Fence Nesting, Links with Spaces, HTML Entities', () => {
    it('dynamically increases backticks to 4 (````) when code block contains 3 backticks (```)', () => {
      const codeInside = [
        'Ví dụ cú pháp Markdown:',
        '```javascript',
        'console.log("hello world");',
        '```',
      ].join('\n');

      const input = `\`\`\`\`markdown\n${codeInside}\n\`\`\`\`\n`;

      const result = parse(input);
      const codeBlock = result.doc.content?.[0];
      expect(codeBlock?.type).toBe('codeBlock');

      const serialized = serialize(result.doc);
      expect(serialized).toBe(input);
      // Ensure outer fence is 4 backticks, preserving inner 3 backticks
      expect(serialized.startsWith('````markdown\n')).toBe(true);
      expect(serialized.endsWith('\n````\n')).toBe(true);
    });

    it('dynamically increases backticks to 5 (`````) when code block contains 4 backticks', () => {
      const codeInside = '````markdown\ninner code\n````';
      const input = `\`\`\`\`\`\n${codeInside}\n\`\`\`\`\`\n`;

      const result = parse(input);
      const serialized = serialize(result.doc);
      expect(serialized).toBe(input);
      expect(serialized.startsWith('`````\n')).toBe(true);
    });

    it('wraps link destination containing spaces in angle brackets <path with space>', () => {
      const input = '[Tài liệu đính kèm](<thư mục/tập tin có dấu cách.pdf>)\n';
      const result = parse(input);

      const serialized = serialize(result.doc);
      expect(serialized).toBe(input);
    });

    it('wraps link destination with spaces and title in angle brackets', () => {
      const input = '[Tài liệu](<tập tin 2.pdf> "Tiêu đề tài liệu")\n';
      const result = parse(input);

      const serialized = serialize(result.doc);
      expect(serialized).toBe(input);
    });

    it('preserves HTML entities (&copy;, &mdash;) without turning into &amp;copy;', () => {
      const input = 'Bản quyền &copy; 2026 &mdash; WriteFlow Project.\n';
      const result = parse(input);

      const serialized = serialize(result.doc);
      expect(serialized).not.toContain('&amp;copy;');
      expect(serialized).not.toContain('&amp;mdash;');
      expect(serialized).toContain('&copy;');
      expect(serialized).toContain('&mdash;');
      expect(serialized).toBe(input);
    });
  });
});
