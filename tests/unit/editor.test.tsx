import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Editor } from '@tiptap/core';
import { TiptapEditor } from '../../src/components/editor/TiptapEditor';
import { createExtensions } from '../../src/core/editor/extensions';

describe('TiptapEditor Component', () => {
  it('renders the editor surface without throwing', () => {
    const editor = new Editor({
      extensions: createExtensions(),
      content: { type: 'doc', content: [{ type: 'paragraph' }] },
    });

    render(<TiptapEditor editor={editor} />);
    const editorPaper = screen.getByTestId('editor-paper');
    expect(editorPaper).toBeInTheDocument();

    editor.destroy();
  });

  it('renders text correctly inside ProseMirror', () => {
    const editor = new Editor({
      extensions: createExtensions(),
      content: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Xin chào WriteFlow' }],
          },
        ],
      },
    });

    render(<TiptapEditor editor={editor} />);
    expect(screen.getByText('Xin chào WriteFlow')).toBeInTheDocument();

    editor.destroy();
  });
});
