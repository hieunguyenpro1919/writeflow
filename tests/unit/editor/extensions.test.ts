import { describe, it, expect } from 'vitest';
import { Editor } from '@tiptap/core';
import { createExtensions } from '../../../src/core/editor/extensions';
import { createWelcomeContent } from '../../../src/core/editor/use-app-editor';

describe('Task 1.3: Editor Configuration & Schema Guard', () => {
  it('creates an editor without forbidden marks (underline, link)', () => {
    const editor = new Editor({
      extensions: createExtensions(),
      content: { type: 'doc', content: [{ type: 'paragraph' }] },
    });

    const marks = Object.keys(editor.schema.marks);
    expect(marks).not.toContain('underline');
    expect(marks).not.toContain('link');

    // Expected Phase 1 marks
    expect(marks).toContain('bold');
    expect(marks).toContain('italic');
    expect(marks).toContain('strike');
    expect(marks).toContain('code');

    editor.destroy();
  });

  it('creates an editor without forbidden nodes (codeBlock, horizontalRule, trailingNode)', () => {
    const editor = new Editor({
      extensions: createExtensions(),
      content: { type: 'doc', content: [{ type: 'paragraph' }] },
    });

    const nodes = Object.keys(editor.schema.nodes);
    expect(nodes).not.toContain('codeBlock');
    expect(nodes).not.toContain('horizontalRule');

    // Expected Phase 1 nodes
    expect(nodes).toContain('paragraph');
    expect(nodes).toContain('heading');
    expect(nodes).toContain('blockquote');
    expect(nodes).toContain('bulletList');
    expect(nodes).toContain('orderedList');
    expect(nodes).toContain('listItem');
    expect(nodes).toContain('hardBreak');
    expect(nodes).toContain('doc');
    expect(nodes).toContain('text');

    editor.destroy();
  });

  it('supports 6 heading levels (P1-D2)', () => {
    const editor = new Editor({
      extensions: createExtensions(),
      content: { type: 'doc', content: [{ type: 'paragraph' }] },
    });

    const headingNode = editor.schema.nodes.heading;
    expect(headingNode).toBeDefined();

    // Verify levels 1 through 6 can be created in the doc
    for (const level of [1, 2, 3, 4, 5, 6]) {
      const node = editor.schema.nodes.heading.create({ level });
      expect(node.attrs.level).toBe(level);
    }

    editor.destroy();
  });

  it('does not append an automatic trailing empty paragraph after a heading (no trailingNode)', () => {
    const editor = new Editor({
      extensions: createExtensions(),
      content: {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: 'Document Ending With Heading' }],
          },
        ],
      },
    });

    expect(editor.state.doc.childCount).toBe(1);
    expect(editor.state.doc.lastChild?.type.name).toBe('heading');

    editor.destroy();
  });

  it('builds initial content as valid Tiptap JSON (P1-D7)', () => {
    const content = createWelcomeContent('Chào mừng', 'Nhấn Ctrl+/ để mở phím tắt');

    expect(content.type).toBe('doc');
    expect(content.content).toHaveLength(2);
    expect(content.content?.[0].type).toBe('heading');
    expect(content.content?.[0].attrs?.level).toBe(1);
    expect(content.content?.[1].type).toBe('paragraph');

    // Verify it loads into an editor without error
    const editor = new Editor({
      extensions: createExtensions(),
      content,
    });

    expect(editor.state.doc.childCount).toBe(2);
    expect(editor.getText()).toContain('Chào mừng');
    expect(editor.getText()).toContain('Nhấn Ctrl+/');

    editor.destroy();
  });
});
