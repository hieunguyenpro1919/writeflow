import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { parse } from '../../../src/core/markdown/parser';
import { serialize } from '../../../src/core/markdown/serializer';
import { RawBlockExtension } from '../../../src/core/editor/extensions/raw-block';
import type { JSONContent } from '@tiptap/core';

describe('Raw Block Data Safety Test Suite (Task 2.3 / Plan 9.2 & Spike S2)', () => {
  const fixturesDir = path.resolve(__dirname, '../../fixtures/markdown');

  describe('1. Individual Raw HTML Block Parsing & Preservation', () => {
    it('should parse <div> blocks into rawBlock nodes without escaping characters', () => {
      const input = '<div class="alert-box" id="unique-box">\n  <p>Alert message</p>\n</div>\n';
      const result = parse(input);

      expect(result.doc.content?.length).toBe(1);
      const node = result.doc.content?.[0];
      expect(node?.type).toBe('rawBlock');
      expect(node?.attrs?.content).toBe(input.trim());
      expect(node?.attrs?.format).toBe('html');

      // Spike S2 check: MUST NOT be escaped into &lt;div&gt;
      const serialized = serialize(result.doc);
      expect(serialized).not.toContain('&lt;div');
      expect(serialized).toBe(input);
    });

    it('should parse <details> and <summary> tags into rawBlock', () => {
      const input = '<details>\n  <summary>Click to view</summary>\n  <p>Detail body</p>\n</details>\n';
      const result = parse(input);

      const node = result.doc.content?.[0];
      expect(node?.type).toBe('rawBlock');
      expect(node?.attrs?.content).toBe(input.trim());

      const serialized = serialize(result.doc);
      expect(serialized).toBe(input);
    });

    it('should parse HTML comments (<!-- comment -->) into rawBlock verbatim', () => {
      const input = '<!-- Note: This comment must remain intact -->\n';
      const result = parse(input);

      const node = result.doc.content?.[0];
      expect(node?.type).toBe('rawBlock');
      expect(node?.attrs?.content).toBe(input.trim());

      const serialized = serialize(result.doc);
      expect(serialized).toBe(input);
    });

    it('should parse self-closing <img> tags into rawBlock', () => {
      const input = '<img src="https://example.com/asset.png" alt="Custom asset" />\n';
      const result = parse(input);

      const node = result.doc.content?.[0];
      expect(node?.type).toBe('rawBlock');
      expect(node?.attrs?.content).toBe(input.trim());

      const serialized = serialize(result.doc);
      expect(serialized).toBe(input);
    });

    it('should parse <style> blocks into rawBlock', () => {
      const input = '<style>\n  .btn { padding: 4px 8px; }\n</style>\n';
      const result = parse(input);

      const node = result.doc.content?.[0];
      expect(node?.type).toBe('rawBlock');
      expect(node?.attrs?.content).toBe(input.trim());

      const serialized = serialize(result.doc);
      expect(serialized).toBe(input);
    });
  });

  describe('2. Interleaved Markdown and Raw HTML Round-trip', () => {
    it('should preserve both standard Markdown nodes and rawBlock nodes in harmony', () => {
      const input = [
        '# Section Header',
        '',
        'A normal paragraph with **bold** text.',
        '',
        '<div class="widget">',
        '  <span>Raw widget</span>',
        '</div>',
        '',
        'Another paragraph after the raw block.',
        '',
      ].join('\n');

      const result = parse(input);
      const types = result.doc.content?.map((n: JSONContent) => n.type);
      expect(types).toEqual(['heading', 'paragraph', 'rawBlock', 'paragraph']);

      const serialized = serialize(result.doc);
      expect(serialized).toBe(input);
    });

    it('should round-trip raw-html-and-custom.md fixture with 100% fidelity', () => {
      const fixturePath = path.join(fixturesDir, 'raw-html-and-custom.md');
      const input = fs.readFileSync(fixturePath, 'utf8').replace(/\r\n/g, '\n');

      const result = parse(input);
      expect(result.pmNode).toBeDefined();

      const output = serialize(result.doc);
      expect(output).toBe(input);
    });
  });

  describe('3. Idempotency on Raw HTML Structures (Plan 9.7 Rule 2)', () => {
    it('should satisfy serialize(parse(serialize(parse(x)))) === serialize(parse(x))', () => {
      const fixturePath = path.join(fixturesDir, 'raw-html-and-custom.md');
      const input = fs.readFileSync(fixturePath, 'utf8').replace(/\r\n/g, '\n');

      const pass1 = parse(input);
      const serialized1 = serialize(pass1.doc, pass1.frontmatter);

      const pass2 = parse(serialized1);
      const serialized2 = serialize(pass2.doc, pass2.frontmatter);

      expect(serialized2).toBe(serialized1);
      expect(serialized2).toBe(input);
    });
  });

  describe('4. RawBlock Extension Spec & DOM Rendering (Plan 9.2)', () => {
    it('should configure atom, isolating, and defining attributes correctly', () => {
      expect(RawBlockExtension.config.atom).toBe(true);
      expect(RawBlockExtension.config.isolating).toBe(true);
      expect(RawBlockExtension.config.defining).toBe(true);
    });

    it('should render HTML with safety container, badge, and pre/code block', () => {
      const renderFn = RawBlockExtension.config.renderHTML;
      expect(renderFn).toBeDefined();

      if (renderFn) {
        const dummyNode = {
          attrs: {
            content: '<div class="test">Hello</div>',
            format: 'html',
            inline: false,
          },
        };

        type RenderProps = Parameters<typeof renderFn>[0];
        const rendered = (
          renderFn as (props: RenderProps) => [
            string,
            Record<string, unknown>,
            ...unknown[],
          ]
        )({
          node: dummyNode,
          HTMLAttributes: {},
        } as unknown as RenderProps);

        expect(Array.isArray(rendered)).toBe(true);
        expect(rendered[0]).toBe('div');
        const attrs = rendered[1];
        expect(attrs['data-raw-block']).toBe('');
        expect(attrs['data-raw-content']).toBe('<div class="test">Hello</div>');
        expect(String(attrs['class'])).toContain('raw-block-container');
      }
    });
  });
});
