import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TiptapEditor } from '../../src/components/editor/TiptapEditor';

describe('TiptapEditor (Phase 0 Minimal Shell)', () => {
  it('renders the editor surface without throwing', () => {
    render(<TiptapEditor initialContent="<p>Test content</p>" />);
    const editorPaper = screen.getByTestId('editor-paper');
    expect(editorPaper).toBeInTheDocument();
  });

  it('renders initial text correctly inside ProseMirror', () => {
    render(<TiptapEditor initialContent="<p>Xin chào WriteFlow</p>" />);
    expect(screen.getByText('Xin chào WriteFlow')).toBeInTheDocument();
  });
});
