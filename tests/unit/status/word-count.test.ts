import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Editor } from '@tiptap/core';
import { createExtensions } from '../../../src/core/editor/extensions';
import { countWordsAndChars, countDocStats, getDocumentText } from '../../../src/components/status/word-count';

describe('Task 1.11: Word & Character Counting (Pure logic)', () => {
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

  describe('countWordsAndChars pure function', () => {
    it('returns 0 words and 0 chars for empty or whitespace-only text', () => {
      expect(countWordsAndChars('')).toEqual({ words: 0, chars: 0 });
      expect(countWordsAndChars('   \n  \t  ')).toEqual({ words: 0, chars: 0 });
    });

    it('counts words and characters accurately across multiple spaces and newlines', () => {
      const stats = countWordsAndChars('Từ một   từ hai\ntừ ba\t\ntừ bốn');
      expect(stats.words).toBe(8);
      expect(stats.chars).toBe('Từ một   từ hai\ntừ ba\t\ntừ bốn'.length);
    });

    it('handles Vietnamese accented characters without counting by raw bytes', () => {
      // In UTF-8, "Tiếng Việt" is 11 bytes, but is exactly 10 Unicode characters
      const sample = 'Tiếng Việt';
      const stats = countWordsAndChars(sample);
      expect(stats.words).toBe(2);
      expect(stats.chars).toBe(10);

      const complex = 'Nguyên âm: ươ, ê, ô, ắ, ặ, ỗ, ỷ';
      const complexStats = countWordsAndChars(complex);
      expect(complexStats.words).toBe(9); // "Nguyên", "âm:", "ươ,", "ê,", "ô,", "ắ,", "ặ,", "ỗ,", "ỷ"
      expect(complexStats.chars).toBe(complex.length);
    });
  });

  describe('countDocStats on ProseMirror documents', () => {
    it('separates adjacent block nodes with newlines so words do not concatenate', () => {
      // Requirement: <h1>Xin chào</h1><p>các bạn</p> -> 4 words (NOT 3)
      editor.commands.setContent('<h1>Xin chào</h1><p>các bạn</p>');

      const extractedText = getDocumentText(editor.state.doc);
      expect(extractedText).toBe('Xin chào\ncác bạn');

      const stats = countDocStats(editor.state.doc);
      expect(stats.words).toBe(4);
      expect(stats.chars).toBe('Xin chào\ncác bạn'.length);
    });

    it('returns 0 for an empty document', () => {
      editor.commands.setContent('<p></p>');
      const stats = countDocStats(editor.state.doc);
      expect(stats.words).toBe(0);
      expect(stats.chars).toBe(0);
    });

    it('accurately counts text across headings, lists, and blockquotes', () => {
      editor.commands.setContent(
        '<h1>Tiêu đề lớn</h1>' +
          '<blockquote><p>Đoạn trích dẫn</p></blockquote>' +
          '<ul><li><p>Mục thứ nhất</p></li><li><p>Mục thứ hai</p></li></ul>',
      );

      // "Tiêu đề lớn" (3) + "Đoạn trích dẫn" (3) + "Mục thứ nhất" (3) + "Mục thứ hai" (3) = 12 words
      const stats = countDocStats(editor.state.doc);
      expect(stats.words).toBe(12);
    });
  });
});
