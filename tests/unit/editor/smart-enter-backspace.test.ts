import { describe, it, expect, afterEach } from 'vitest';
import { Editor } from '@tiptap/core';
import { createExtensions } from '../../../src/core/editor/extensions';

describe('Task 1.9: Enter thông minh & Backspace', () => {
  let editor: Editor;

  function pressKey(key: string, modifiers?: { shiftKey?: boolean; ctrlKey?: boolean }): boolean {
    const event = new KeyboardEvent('keydown', {
      key,
      bubbles: true,
      cancelable: true,
      shiftKey: modifiers?.shiftKey ?? false,
      ctrlKey: modifiers?.ctrlKey ?? false,
    });
    return editor.view.dom.dispatchEvent(event);
  }

  function findTextPos(textToFind: string): number {
    let target = 0;
    editor.state.doc.descendants((node, pos) => {
      if (node.isText && node.text?.includes(textToFind)) {
        target = pos + node.text.indexOf(textToFind);
        return false;
      }
    });
    return target;
  }

  function findEmptyParagraphPos(): number {
    let target = 0;
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'paragraph' && node.content.size === 0) {
        target = pos + 1;
        return false;
      }
    });
    return target;
  }

  afterEach(() => {
    if (editor) {
      editor.destroy();
    }
  });

  describe('1. Enter trên mục danh sách rỗng', () => {
    it('thoát danh sách về đoạn thường khi bấm Enter trên mục rỗng', () => {
      editor = new Editor({
        extensions: createExtensions(),
        content: '<ul><li><p>Mục 1</p></li><li><p></p></li></ul>',
      });

      const emptyPos = findEmptyParagraphPos();
      editor.commands.setTextSelection(emptyPos);
      expect(editor.isActive('bulletList')).toBe(true);

      pressKey('Enter');

      // The second empty item must have exited the list to become a normal paragraph
      expect(editor.isActive('bulletList')).toBe(false);
      expect(editor.isActive('paragraph')).toBe(true);
      expect(editor.getHTML()).toBe('<ul><li><p>Mục 1</p></li></ul><p></p>');

      // Undo brings back the empty list item
      editor.commands.undo();
      expect(editor.getHTML()).toBe('<ul><li><p>Mục 1</p></li><li><p></p></li></ul>');
    });

    it('lùi một cấp rồi mới thoát khi ở danh sách lồng nhiều cấp', () => {
      editor = new Editor({
        extensions: createExtensions(),
        content: '<ul><li><p>Cấp 1</p><ul><li><p></p></li></ul></li></ul>',
      });

      const emptyPos = findEmptyParagraphPos();
      editor.commands.setTextSelection(emptyPos);

      // First Enter: lifts nested item to outer list
      pressKey('Enter');
      expect(editor.getHTML()).toBe('<ul><li><p>Cấp 1</p></li><li><p></p></li></ul>');

      // Second Enter: exits outer list to paragraph
      pressKey('Enter');
      expect(editor.getHTML()).toBe('<ul><li><p>Cấp 1</p></li></ul><p></p>');
    });
  });

  describe('2. Enter trên dòng trống trong trích dẫn', () => {
    it('thoát trích dẫn về đoạn văn thường khi bấm Enter trên dòng trống', () => {
      editor = new Editor({
        extensions: createExtensions(),
        content: '<blockquote><p>Dòng trích dẫn đầu</p><p></p></blockquote>',
      });

      const emptyPos = findEmptyParagraphPos();
      editor.commands.setTextSelection(emptyPos);
      expect(editor.isActive('blockquote')).toBe(true);

      pressKey('Enter');

      // Must have exited blockquote to a standard paragraph below
      expect(editor.isActive('blockquote')).toBe(false);
      expect(editor.isActive('paragraph')).toBe(true);
      expect(editor.getHTML()).toBe('<blockquote><p>Dòng trích dẫn đầu</p></blockquote><p></p>');

      // Undo restores the empty paragraph inside blockquote
      editor.commands.undo();
      expect(editor.getHTML()).toBe('<blockquote><p>Dòng trích dẫn đầu</p><p></p></blockquote>');
    });
  });

  describe('3. Enter ở cuối tiêu đề & giữa tiêu đề', () => {
    it('Enter ở cuối tiêu đề tạo đoạn thường bên dưới (không tạo tiêu đề mới)', () => {
      editor = new Editor({
        extensions: createExtensions(),
        content: '<h1>Tiêu đề tiếng Việt chính</h1>',
      });

      // Cursor at the very end of the heading
      const endPos = editor.state.doc.content.size - 1;
      editor.commands.setTextSelection(endPos);
      expect(editor.isActive('heading', { level: 1 })).toBe(true);

      pressKey('Enter');

      // New line must be a paragraph, NOT a new heading
      expect(editor.isActive('heading')).toBe(false);
      expect(editor.isActive('paragraph')).toBe(true);
      expect(editor.getHTML()).toBe('<h1>Tiêu đề tiếng Việt chính</h1><p></p>');
    });

    it('Enter ở giữa tiêu đề tách thành hai tiêu đề mà không mất chữ', () => {
      editor = new Editor({
        extensions: createExtensions(),
        content: '<h1>Phần một Phần hai</h1>',
      });

      const splitPos = findTextPos('Phần hai');
      editor.commands.setTextSelection(splitPos);

      pressKey('Enter');

      // Both must remain heading 1 and preserve text
      expect(editor.getHTML()).toBe('<h1>Phần một </h1><h1>Phần hai</h1>');

      // Undo restores original combined heading
      editor.commands.undo();
      expect(editor.getHTML()).toBe('<h1>Phần một Phần hai</h1>');
    });
  });

  describe('4. Backspace ở đầu tiêu đề', () => {
    it('chuyển tiêu đề thành đoạn thường khi Backspace ở đầu tiêu đề không chọn chữ', () => {
      editor = new Editor({
        extensions: createExtensions(),
        content: '<p>Đoạn trên</p><h1>Tiêu đề cần hạ</h1>',
      });

      const headingStartPos = findTextPos('Tiêu đề cần hạ');
      editor.commands.setTextSelection(headingStartPos);
      expect(editor.isActive('heading', { level: 1 })).toBe(true);

      pressKey('Backspace');

      // Must convert to paragraph first (Task 1.9 behavior 4)
      expect(editor.isActive('heading')).toBe(false);
      expect(editor.isActive('paragraph')).toBe(true);
      expect(editor.getHTML()).toBe('<p>Đoạn trên</p><p>Tiêu đề cần hạ</p>');

      // Second Backspace: merges with previous paragraph
      pressKey('Backspace');
      expect(editor.getHTML()).toBe('<p>Đoạn trênTiêu đề cần hạ</p>');

      // Undo restores back to heading
      editor.commands.undo();
      editor.commands.undo();
      expect(editor.getHTML()).toBe('<p>Đoạn trên</p><h1>Tiêu đề cần hạ</h1>');
    });
  });

  describe('5. Backspace ở đầu mục danh sách / đầu trích dẫn', () => {
    it('thoát/lùi khối danh sách khi Backspace ở đầu mục mà không xóa chữ khối trước', () => {
      editor = new Editor({
        extensions: createExtensions(),
        content: '<p>Đoạn văn trước</p><ul><li><p>Mục danh sách</p></li></ul>',
      });

      const listStartPos = findTextPos('Mục danh sách');
      editor.commands.setTextSelection(listStartPos);

      pressKey('Backspace');

      // Lifts out of list into paragraph, keeping text intact
      expect(editor.isActive('bulletList')).toBe(false);
      expect(editor.getHTML()).toBe('<p>Đoạn văn trước</p><p>Mục danh sách</p>');
    });

    it('thoát trích dẫn khi Backspace ở đầu trích dẫn mà không xóa chữ khối trước', () => {
      editor = new Editor({
        extensions: createExtensions(),
        content: '<p>Đoạn văn trước</p><blockquote><p>Văn bản trích dẫn</p></blockquote>',
      });

      const quoteStartPos = findTextPos('Văn bản trích dẫn');
      editor.commands.setTextSelection(quoteStartPos);

      pressKey('Backspace');

      // Lifts out of blockquote into paragraph
      expect(editor.isActive('blockquote')).toBe(false);
      expect(editor.getHTML()).toBe('<p>Đoạn văn trước</p><p>Văn bản trích dẫn</p>');
    });
  });

  describe('6. Shift+Enter ngắt dòng cứng', () => {
    it('ngắt dòng cứng (hard break) trong cùng đoạn văn', () => {
      editor = new Editor({
        extensions: createExtensions(),
        content: '<p>Dòng một Dòng hai</p>',
      });

      const breakPos = findTextPos('Dòng hai');
      editor.commands.setTextSelection(breakPos);

      pressKey('Enter', { shiftKey: true });

      expect(editor.getHTML()).toBe('<p>Dòng một <br>Dòng hai</p>');

      editor.commands.undo();
      expect(editor.getHTML()).toBe('<p>Dòng một Dòng hai</p>');
    });

    it('ngắt dòng cứng bên trong mục danh sách và trích dẫn', () => {
      editor = new Editor({
        extensions: createExtensions(),
        content: '<ul><li><p>Mục một Mục hai</p></li></ul>',
      });

      const breakPos = findTextPos('Mục hai');
      editor.commands.setTextSelection(breakPos);

      pressKey('Enter', { shiftKey: true });

      expect(editor.getHTML()).toBe('<ul><li><p>Mục một <br>Mục hai</p></li></ul>');
    });
  });

  describe('7. Tab và Shift+Tab trong và ngoài danh sách', () => {
    it('Tab thụt vào và Shift+Tab lùi ra trong danh sách', () => {
      editor = new Editor({
        extensions: createExtensions(),
        content: '<ul><li><p>Mục 1</p></li><li><p>Mục 2 thụt lề</p></li></ul>',
      });

      const item2Pos = findTextPos('Mục 2 thụt lề');
      editor.commands.setTextSelection(item2Pos);

      // Press Tab: sinks item 2 into nested sublist under item 1
      pressKey('Tab');
      expect(editor.getHTML()).toBe(
        '<ul><li><p>Mục 1</p><ul><li><p>Mục 2 thụt lề</p></li></ul></li></ul>',
      );

      // Press Shift+Tab: lifts item 2 back out
      pressKey('Tab', { shiftKey: true });
      expect(editor.getHTML()).toBe('<ul><li><p>Mục 1</p></li><li><p>Mục 2 thụt lề</p></li></ul>');
    });

    it('Tab ngoài danh sách không làm mất focus bất ngờ', () => {
      const container = document.createElement('div');
      document.body.appendChild(container);

      editor = new Editor({
        element: container,
        extensions: createExtensions(),
        content: '<p>Văn bản ngoài danh sách</p>',
      });

      editor.view.focus();
      editor.commands.setTextSelection(3);
      pressKey('Tab');

      // Check document text unchanged and cursor still valid
      expect(editor.getText()).toBe('Văn bản ngoài danh sách');
      expect(editor.state.selection.from).toBe(3);

      document.body.removeChild(container);
    });
  });

  describe('8. Bảo vệ bộ gõ tiếng Việt (IME composition) cho phím Backspace', () => {
    it('không can thiệp hoặc chuyển đổi khối khi view.composing đang là true', () => {
      editor = new Editor({
        extensions: createExtensions(),
        content: '<h1>Tiêu đề thử nghiệm</h1>',
      });

      // Position cursor at start of heading (where SmartKeys would normally convert to paragraph)
      editor.commands.setTextSelection(1);
      expect(editor.isActive('heading', { level: 1 })).toBe(true);

      // Simulate IME composition (e.g. Unikey is composing a Vietnamese character)
      Object.defineProperty(editor.view, 'composing', { value: true, configurable: true });

      // Press Backspace while composing
      pressKey('Backspace');

      // The heading must NOT be converted to a paragraph because IME is composing
      expect(editor.isActive('heading', { level: 1 })).toBe(true);
      expect(editor.getHTML()).toContain('<h1>Tiêu đề thử nghiệm</h1>');

      // Reset composing
      Object.defineProperty(editor.view, 'composing', { value: false, configurable: true });
    });
  });
});
