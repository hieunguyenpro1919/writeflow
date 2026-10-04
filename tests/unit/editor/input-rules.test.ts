import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Editor } from '@tiptap/core';
import { createExtensions } from '../../../src/core/editor/extensions';

describe('Task 1.10: Input Rules (Kiểm chứng & Đo đạc hoàn tác)', () => {
  let editor: Editor;

  beforeEach(() => {
    editor = new Editor({
      extensions: createExtensions(),
      content: '<p></p>',
    });
  });

  afterEach(() => {
    editor.destroy();
  });

  /**
   * Simulates real browser character-by-character typing via ProseMirror's handleTextInput
   */
  function typeText(text: string): void {
    for (const char of text) {
      const { from, to } = editor.state.selection;
      const handled = editor.view.someProp('handleTextInput', (f) =>
        f(editor.view, from, to, char, () => editor.state.tr.insertText(char, from, to)),
      );
      if (!handled) {
        editor.view.dispatch(editor.state.tr.insertText(char, from, to));
      }
    }
  }

  function pressKey(key: string, modifiers?: { ctrlKey?: boolean; shiftKey?: boolean }): boolean {
    const event = new KeyboardEvent('keydown', {
      key,
      bubbles: true,
      cancelable: true,
      ctrlKey: modifiers?.ctrlKey ?? false,
      shiftKey: modifiers?.shiftKey ?? false,
    });
    return editor.view.dom.dispatchEvent(event);
  }

  describe('1. Kiểm chứng các Input Rules hoạt động ở vị trí hợp lệ', () => {
    it('# biến thành heading 1', () => {
      typeText('# ');
      expect(editor.isActive('heading', { level: 1 })).toBe(true);
      expect(editor.getHTML()).toBe('<h1></h1>');
    });

    it('## biến thành heading 2', () => {
      typeText('## ');
      expect(editor.isActive('heading', { level: 2 })).toBe(true);
      expect(editor.getHTML()).toBe('<h2></h2>');
    });

    it('### biến thành heading 3', () => {
      typeText('### ');
      expect(editor.isActive('heading', { level: 3 })).toBe(true);
      expect(editor.getHTML()).toBe('<h3></h3>');
    });

    it('#### đến ###### biến thành heading 4 đến 6', () => {
      typeText('#### ');
      expect(editor.isActive('heading', { level: 4 })).toBe(true);
      editor.commands.setContent('<p></p>');

      typeText('##### ');
      expect(editor.isActive('heading', { level: 5 })).toBe(true);
      editor.commands.setContent('<p></p>');

      typeText('###### ');
      expect(editor.isActive('heading', { level: 6 })).toBe(true);
    });

    it('- và * biến thành bullet list', () => {
      typeText('- ');
      expect(editor.isActive('bulletList')).toBe(true);
      expect(editor.getHTML()).toBe('<ul><li><p></p></li></ul>');

      editor.commands.setContent('<p></p>');
      typeText('* ');
      expect(editor.isActive('bulletList')).toBe(true);
      expect(editor.getHTML()).toBe('<ul><li><p></p></li></ul>');
    });

    it('1. biến thành ordered list', () => {
      typeText('1. ');
      expect(editor.isActive('orderedList')).toBe(true);
      expect(editor.getHTML()).toBe('<ol><li><p></p></li></ol>');
    });

    it('> biến thành blockquote', () => {
      typeText('> ');
      expect(editor.isActive('blockquote')).toBe(true);
      expect(editor.getHTML()).toBe('<blockquote><p></p></blockquote>');
    });

    it('**x** biến thành in đậm (bold)', () => {
      typeText('**từ đậm**');
      expect(editor.getHTML()).toBe('<p><strong>từ đậm</strong></p>');
      editor.commands.setTextSelection(3);
      expect(editor.isActive('bold')).toBe(true);
    });

    it('*x* biến thành in nghiêng (italic)', () => {
      typeText('*từ nghiêng*');
      expect(editor.getHTML()).toBe('<p><em>từ nghiêng</em></p>');
      editor.commands.setTextSelection(3);
      expect(editor.isActive('italic')).toBe(true);
    });

    it('~~x~~ biến thành gạch ngang (strike)', () => {
      typeText('~~gạch ngang~~');
      expect(editor.getHTML()).toBe('<p><s>gạch ngang</s></p>');
      editor.commands.setTextSelection(3);
      expect(editor.isActive('strike')).toBe(true);
    });

    it('`x` biến thành mã nội dòng (code)', () => {
      typeText('`mã code`');
      expect(editor.getHTML()).toBe('<p><code>mã code</code></p>');
      editor.commands.setTextSelection(3);
      expect(editor.isActive('code')).toBe(true);
    });
  });

  describe('2. Ca âm & Vị trí không hợp lệ', () => {
    it('# ở giữa dòng không kích hoạt heading', () => {
      editor.commands.setContent('<p>Chữ trước</p>');
      editor.commands.setTextSelection(editor.state.doc.content.size - 1);

      typeText(' # ');
      expect(editor.isActive('heading')).toBe(false);
      expect(editor.getText()).toBe('Chữ trước # ');
    });

    it('ký tự *, _, # cạnh chữ tiếng Việt có dấu không gây kích hoạt ngoài ý muốn', () => {
      editor.commands.setContent('<p></p>');
      typeText('việt*');
      expect(editor.isActive('italic')).toBe(false);
      expect(editor.getText()).toBe('việt*');

      editor.commands.setContent('<p></p>');
      typeText('nguyên_âm_');
      expect(editor.isActive('italic')).toBe(false);
    });

    it('các cú pháp Phase sau (``` và ---) không kích hoạt gì (nhập chữ thường)', () => {
      editor.commands.setContent('<p></p>');
      typeText('```');
      expect(editor.getHTML()).toBe('<p>```</p>');

      editor.commands.setContent('<p></p>');
      typeText('---');
      expect(editor.getHTML()).toBe('<p>---</p>');
    });
  });

  describe('3. Khóa Input Rules khi IME đang soạn dấu (view.composing)', () => {
    it('không kích hoạt # khi view.composing = true', () => {
      Object.defineProperty(editor.view, 'composing', {
        value: true,
        configurable: true,
        writable: true,
      });

      try {
        typeText('# ');
        // Must NOT transform into heading
        expect(editor.isActive('heading')).toBe(false);
      } finally {
        Object.defineProperty(editor.view, 'composing', {
          value: false,
          configurable: true,
          writable: true,
        });
      }
    });

    it('không kích hoạt **bold** khi view.composing = true', () => {
      Object.defineProperty(editor.view, 'composing', {
        value: true,
        configurable: true,
        writable: true,
      });

      try {
        typeText('**chữ**');
        expect(editor.isActive('bold')).toBe(false);
      } finally {
        Object.defineProperty(editor.view, 'composing', {
          value: false,
          configurable: true,
          writable: true,
        });
      }
    });
  });

  describe('4. ĐO ĐẠC HÀNH VI: Backspace và Ctrl+Z ngay sau khi Input Rule kích hoạt', () => {
    it('Đo hành vi (a): Backspace ngay sau khi gõ "# "', () => {
      typeText('# ');
      expect(editor.isActive('heading', { level: 1 })).toBe(true);

      // Press Backspace immediately
      pressKey('Backspace');

      // Record what is returned
      const resultHtml = editor.getHTML();
      const resultText = editor.getText();
      const isHeading = editor.isActive('heading');

      expect(resultHtml).toBe('<p></p>');
      expect(resultText).toBe('');
      expect(isHeading).toBe(false);
    });

    it('Đo hành vi (b): Ctrl+Z ngay sau khi gõ "# "', () => {
      typeText('# ');
      expect(editor.isActive('heading', { level: 1 })).toBe(true);

      // Press Ctrl+Z immediately
      pressKey('z', { ctrlKey: true });

      // Record what is returned
      const resultHtml = editor.getHTML();
      const resultText = editor.getText();
      const isHeading = editor.isActive('heading');

      expect(resultHtml).toBe('<p># </p>');
      expect(resultText).toBe('# ');
      expect(isHeading).toBe(false);
    });

    it('Đo hành vi Backspace và Ctrl+Z ngay sau khi gõ "> "', () => {
      typeText('> ');
      expect(editor.isActive('blockquote')).toBe(true);

      pressKey('Backspace');
      expect(editor.getHTML()).toBe('<p></p>');
      expect(editor.isActive('blockquote')).toBe(false);

      editor.commands.setContent('<p></p>');
      typeText('> ');
      expect(editor.isActive('blockquote')).toBe(true);

      pressKey('z', { ctrlKey: true });
      expect(editor.getHTML()).toBe('<p>&gt; </p>');
      expect(editor.getText()).toBe('> ');
      expect(editor.isActive('blockquote')).toBe(false);
    });

    it('Đo hành vi Backspace và Ctrl+Z ngay sau khi gõ "- "', () => {
      typeText('- ');
      expect(editor.isActive('bulletList')).toBe(true);

      pressKey('Backspace');
      expect(editor.getHTML()).toBe('<p></p>');
      expect(editor.isActive('bulletList')).toBe(false);

      editor.commands.setContent('<p></p>');
      typeText('- ');
      expect(editor.isActive('bulletList')).toBe(true);

      pressKey('z', { ctrlKey: true });
      expect(editor.getHTML()).toBe('<p>- </p>');
      expect(editor.getText()).toBe('- ');
      expect(editor.isActive('bulletList')).toBe(false);
    });
  });
});
