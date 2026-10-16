import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Editor } from '@tiptap/core';
import { createExtensions } from '../../../src/core/editor/extensions';
import { DevPanel } from '../../../src/components/dev/DevPanel';
import { isDevMode } from '../../../src/components/dev/is-dev-mode';
import App from '../../../src/App';

import { parse } from '../../../src/core/markdown';

describe('Task 2.6b: DevPanel & URL Dev Flag', () => {
  let editor: Editor;

  beforeEach(() => {
    window.history.pushState({}, '', '/');
    editor = new Editor({
      extensions: createExtensions(),
      content: '<p>Văn bản ban đầu</p>',
    });
  });

  afterEach(() => {
    editor.destroy();
    window.history.pushState({}, '', '/');
  });

  describe('1. isDevMode URL Query Detection', () => {
    it('returns false when dev query param is missing, empty, or false', () => {
      expect(isDevMode('')).toBe(false);
      expect(isDevMode('?')).toBe(false);
      expect(isDevMode('?dev=0')).toBe(false);
      expect(isDevMode('?dev=false')).toBe(false);
      expect(isDevMode('?mode=test')).toBe(false);
    });

    it('returns true when dev query param is 1 or true', () => {
      expect(isDevMode('?dev=1')).toBe(true);
      expect(isDevMode('?dev=true')).toBe(true);
      expect(isDevMode('?foo=bar&dev=1')).toBe(true);
      expect(isDevMode('?dev=true&lang=vi')).toBe(true);
    });
  });

  describe('2. App Mount / Dev Flag Visibility', () => {
    it('does NOT render DevPanel in normal user mode (no dev query)', () => {
      window.history.pushState({}, '', '/');
      render(<App />);
      expect(screen.queryByTestId('dev-panel')).not.toBeInTheDocument();
    });

    it('renders DevPanel when URL has ?dev=1', () => {
      window.history.pushState({}, '', '/?dev=1');
      render(<App />);
      expect(screen.getByTestId('dev-panel')).toBeInTheDocument();
    });

    it('renders DevPanel when URL has ?dev=true', () => {
      window.history.pushState({}, '', '/?dev=true');
      render(<App />);
      expect(screen.getByTestId('dev-panel')).toBeInTheDocument();
    });
  });

  describe('3. 3-Pane Debugger UI & Diff Indicator', () => {
    it('renders all 3 panes and controls', () => {
      render(<DevPanel editor={editor} />);

      expect(screen.getByTestId('dev-panel')).toBeInTheDocument();
      expect(screen.getByTestId('dev-input-md')).toBeInTheDocument();
      expect(screen.getByTestId('dev-ast-json')).toBeInTheDocument();
      expect(screen.getByTestId('dev-output-md')).toBeInTheDocument();
      expect(screen.getByTestId('dev-load-btn')).toBeInTheDocument();
      expect(screen.getByTestId('dev-diff-badge')).toBeInTheDocument();

      // Initial JSON AST and output markdown
      const astText = screen.getByTestId('dev-ast-json').textContent;
      expect(astText).toContain('"type": "paragraph"');
      expect(astText).toContain('"text": "Văn bản ban đầu"');
      expect(screen.getByTestId('dev-output-md').textContent).toContain('Văn bản ban đầu');
    });

    it('loads Markdown into Editor, updates AST JSON, and detects Idempotent match', () => {
      render(<DevPanel editor={editor} />);

      const input = screen.getByTestId('dev-input-md');
      const loadBtn = screen.getByTestId('dev-load-btn');
      const badge = screen.getByTestId('dev-diff-badge');

      // Canonical ATX heading
      act(() => {
        fireEvent.change(input, { target: { value: '# Tiêu đề thử nghiệm' } });
      });

      act(() => {
        fireEvent.click(loadBtn);
      });

      // Editor document updated
      expect(editor.getText()).toContain('Tiêu đề thử nghiệm');
      expect(editor.state.doc.firstChild?.type.name).toBe('heading');

      // Pane 2: AST updated
      const astText = screen.getByTestId('dev-ast-json').textContent;
      expect(astText).toContain('"type": "heading"');
      expect(astText).toContain('"text": "Tiêu đề thử nghiệm"');

      // Pane 3: Serialized markdown matches input
      const outputText = screen.getByTestId('dev-output-md').textContent?.trim();
      expect(outputText).toBe('# Tiêu đề thử nghiệm');

      // Diff Badge shows Idempotent match
      expect(badge.textContent).toContain('Khớp (Idempotent)');
    });

    it('detects difference/normalization when input differs from canonical serialized output', () => {
      render(<DevPanel editor={editor} />);

      const input = screen.getByTestId('dev-input-md');
      const loadBtn = screen.getByTestId('dev-load-btn');
      const badge = screen.getByTestId('dev-diff-badge');

      // Setext heading (normalized to ATX # in canonical output)
      act(() => {
        fireEvent.change(input, { target: { value: 'Tiêu đề Setext\n===' } });
      });

      act(() => {
        fireEvent.click(loadBtn);
      });

      const outputText = screen.getByTestId('dev-output-md').textContent?.trim();
      expect(outputText).toBe('# Tiêu đề Setext');

      // Input was 'Tiêu đề Setext\n===', output is '# Tiêu đề Setext' -> Different
      expect(badge.textContent).toContain('Có khác biệt (Normalized/Changed)');
    });

    it('syncs AST and output markdown when editor document updates via transaction', () => {
      render(<DevPanel editor={editor} />);

      act(() => {
        editor.commands.setContent(parse('## Cập nhật trực tiếp').doc);
      });

      const astText = screen.getByTestId('dev-ast-json').textContent;
      expect(astText).toContain('"type": "heading"');
      expect(astText).toContain('"level": 2');
      expect(screen.getByTestId('dev-output-md').textContent?.trim()).toBe('## Cập nhật trực tiếp');
    });
  });
});
