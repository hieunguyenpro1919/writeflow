import { describe, expect, it } from 'vitest';
import { Editor } from '@tiptap/core';
import fs from 'node:fs';
import path from 'node:path';
import { createExtensions } from '../../../src/core/editor/extensions';
import { parse, serialize, getSharedMarkdownSchema } from '../../../src/core/markdown';
import { isValidLinkHref } from '../../../src/core/markdown/extensions';
import { getAllCorpusFiles } from '../../../scripts/corpus-report';
import type { JSONContent } from '@tiptap/core';

describe('Task 2.6a: Unified Schema & AST Equivalence', () => {
  describe('1. Single Source of Truth Schema Unification', () => {
    it('shares exactly identical nodes and marks between Editor and Markdown Engine', () => {
      const editor = new Editor({ extensions: createExtensions() });
      const engineSchema = getSharedMarkdownSchema();

      const editorNodes = Object.keys(editor.schema.nodes).sort();
      const engineNodes = Object.keys(engineSchema.nodes).sort();
      const editorMarks = Object.keys(editor.schema.marks).sort();
      const engineMarks = Object.keys(engineSchema.marks).sort();

      expect(editorNodes).toEqual(engineNodes);
      expect(editorMarks).toEqual(engineMarks);

      // Explicit verification of Phase 2 required nodes
      const expectedNodes = [
        'blockquote',
        'bulletList',
        'codeBlock',
        'doc',
        'hardBreak',
        'heading',
        'horizontalRule',
        'image',
        'listItem',
        'orderedList',
        'paragraph',
        'rawBlock',
        'rawHtmlTag',
        'rawInlineNode',
        'taskItem',
        'taskList',
        'text',
      ];
      expect(editorNodes).toEqual(expectedNodes);

      // Explicit verification of Phase 2 required marks
      const expectedMarks = ['bold', 'code', 'italic', 'link', 'rawInline', 'strike'];
      expect(editorMarks).toEqual(expectedMarks);

      // Forbidden marks/nodes
      expect(editorMarks).not.toContain('underline');
      expect(editorNodes).not.toContain('trailingNode');

      editor.destroy();
    });
  });

  describe('2. Link Validation Rules', () => {
    it('accepts http, https, mailto, and relative URLs', () => {
      expect(isValidLinkHref('https://writeflow.app')).toBe(true);
      expect(isValidLinkHref('http://example.com/page')).toBe(true);
      expect(isValidLinkHref('mailto:author@writeflow.dev')).toBe(true);
      expect(isValidLinkHref('/docs/guide')).toBe(true);
      expect(isValidLinkHref('./relative-doc.md')).toBe(true);
      expect(isValidLinkHref('../parent-doc.md')).toBe(true);
      expect(isValidLinkHref('#section-heading')).toBe(true);
      expect(isValidLinkHref('?query=search-term')).toBe(true);
      expect(isValidLinkHref('simple-relative.html')).toBe(true);
    });

    it('rejects unsafe schemes and empty inputs', () => {
      expect(isValidLinkHref('javascript:alert(1)')).toBe(false);
      expect(isValidLinkHref('data:text/html,<script>alert(1)</script>')).toBe(false);
      expect(isValidLinkHref('vbscript:msgbox("xss")')).toBe(false);
      expect(isValidLinkHref('file:///C:/passwords.txt')).toBe(false);
      expect(isValidLinkHref('ftp://ftp.example.com')).toBe(false);
      expect(isValidLinkHref('')).toBe(false);
      expect(isValidLinkHref('   ')).toBe(false);
    });

    it('blocks setting unsafe links via Editor commands', () => {
      const editor = new Editor({
        extensions: createExtensions(),
        content: '<p>Click here</p>',
      });

      editor.commands.selectAll();

      // Setting unsafe link is rejected
      const dangerousResult = editor.commands.setLink({ href: 'javascript:alert(1)' });
      expect(dangerousResult).toBe(false);
      expect(editor.isActive('link')).toBe(false);

      // Setting safe link succeeds
      const safeResult = editor.commands.setLink({ href: 'https://writeflow.app' });
      expect(safeResult).toBe(true);
      expect(editor.isActive('link')).toBe(true);

      editor.destroy();
    });
  });

  describe('3. Safe Display of Raw Block and Raw HTML Tag', () => {
    it('renders rawBlock as inert container with contenteditable="false" and monospace styling', () => {
      const editor = new Editor({
        extensions: createExtensions(),
        content: {
          type: 'doc',
          content: [
            {
              type: 'rawBlock',
              attrs: {
                content: '<script>alert("xss")</script>',
                format: 'html',
                inline: false,
              },
            },
          ],
        },
      });

      const html = editor.getHTML();
      expect(html).toContain('class="raw-block-container"');
      expect(html).toContain('contenteditable="false"');
      expect(html).toContain('raw-block-badge');
      expect(html).toContain('Nội dung chưa hỗ trợ chỉnh sửa trực quan');
      expect(html).toContain('&lt;script&gt;alert("xss")&lt;/script&gt;');
      // Never render live executable script tags
      expect(html).not.toMatch(/<script>alert\("xss"\)<\/script>/);

      const nodeType = editor.schema.nodes.rawBlock;
      expect(nodeType.isAtom).toBe(true);
      expect(nodeType.spec.selectable).toBe(true);

      editor.destroy();
    });

    it('renders rawHtmlTag as inert element with contenteditable="false" and monospace border styling', () => {
      const editor = new Editor({
        extensions: createExtensions(),
        content: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'rawHtmlTag',
                  attrs: { source: '<custom-tag attr="1">' },
                },
              ],
            },
          ],
        },
      });

      const html = editor.getHTML();
      expect(html).toContain('class="raw-html-tag"');
      expect(html).toContain('contenteditable="false"');
      expect(html).toContain('title="Nội dung chưa hỗ trợ chỉnh sửa trực quan"');
      expect(html).toContain('font-family: var(--editor-font-mono, monospace)');
      expect(html).toContain('border: 1px solid var(--editor-border-color, #e2e8f0)');

      const nodeType = editor.schema.nodes.rawHtmlTag;
      expect(nodeType.isAtom).toBe(true);
      expect(nodeType.spec.selectable).toBe(true);

      editor.destroy();
    });
  });

  describe('4. Corpus 62-file AST Equivalence (parse -> Editor instance -> serialize == parse -> serialize)', () => {
    const corpusDir = path.resolve(__dirname, '../../fixtures/markdown/corpus');
    const corpusFiles = getAllCorpusFiles(corpusDir);

    it(`verifies exactly 62 corpus files exist`, () => {
      expect(corpusFiles.length).toBe(62);
    });

    // Reuse an Editor instance to efficiently test all 62 corpus files
    it('produces identical serialized markdown across all 62 corpus files', () => {
      const editor = new Editor({
        extensions: createExtensions(),
      });

      try {
        for (const relativePath of corpusFiles) {
          const filePath = path.join(corpusDir, relativePath);
          const rawBuffer = fs.readFileSync(filePath);
          const originalContent = rawBuffer.toString('utf8');
          const hasBOM =
            rawBuffer.length >= 3 &&
            rawBuffer[0] === 0xef &&
            rawBuffer[1] === 0xbb &&
            rawBuffer[2] === 0xbf;
          const isCRLF = originalContent.includes('\r\n');
          const options = {
            preserveBOM: hasBOM,
            eol: isCRLF ? ('crlf' as const) : ('lf' as const),
          };

          // Engine direct path: parse -> serialize
          const parsed = parse(originalContent);
          const engineOutput = serialize(parsed.doc, parsed.frontmatter, options);

          // Editor path: load parsed AST into real Editor instance -> getJSON -> serialize
          editor.commands.setContent(parsed.doc);
          const editorDoc = editor.getJSON();
          const editorOutput = serialize(editorDoc as JSONContent, parsed.frontmatter, options);

          expect(
            editorOutput,
            `Editor instance AST serialization diverged from Engine for: ${relativePath}`,
          ).toBe(engineOutput);
        }
      } finally {
        editor.destroy();
      }
    });
  });
});
