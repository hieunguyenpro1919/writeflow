import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Editor } from '@tiptap/core';
import { createExtensions } from '../../../src/core/editor/extensions';
import { StatusBar } from '../../../src/components/status/StatusBar';

describe('Task 1.11: StatusBar Component', () => {
  let editor: Editor;

  beforeEach(() => {
    editor = new Editor({
      extensions: createExtensions(),
      content: '<p>Xin chào Việt Nam</p>',
    });
  });

  afterEach(() => {
    editor.destroy();
  });

  it('renders word count and character count accurately', () => {
    render(<StatusBar editor={editor} />);

    expect(screen.getByTestId('status-bar')).toBeInTheDocument();
    expect(screen.getByTestId('status-bar')).toHaveAttribute('role', 'status');

    // "Xin chào Việt Nam" has 4 words and 17 characters
    expect(screen.getByTestId('status-words')).toHaveTextContent('4 từ');
    expect(screen.getByTestId('status-chars')).toHaveTextContent('17 ký tự');
  });

  it('updates counts dynamically when document content changes', () => {
    render(<StatusBar editor={editor} />);

    expect(screen.getByTestId('status-words')).toHaveTextContent('4 từ');

    // Move to end and insert content
    act(() => {
      editor.commands.setTextSelection(editor.state.doc.content.size - 1);
      editor.commands.insertContent(' mới');
    });

    // "Xin chào Việt Nam mới" has 5 words
    expect(screen.getByTestId('status-words')).toHaveTextContent('5 từ');
  });

  it('calls onOpenShortcuts when clicking the shortcuts button', () => {
    const handleOpen = vi.fn();
    render(<StatusBar editor={editor} onOpenShortcuts={handleOpen} />);

    const btn = screen.getByTestId('status-shortcuts-btn');
    fireEvent.click(btn);

    expect(handleOpen).toHaveBeenCalledTimes(1);
  });

  it('renders gracefully when editor is null', () => {
    render(<StatusBar editor={null} />);

    expect(screen.getByTestId('status-words')).toHaveTextContent('0 từ');
    expect(screen.getByTestId('status-chars')).toHaveTextContent('0 ký tự');
  });
});
