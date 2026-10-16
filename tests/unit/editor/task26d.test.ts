import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Editor } from '@tiptap/core';
import { createExtensions } from '../../../src/core/editor/extensions';
import { sanitizePastedHtml } from '../../../src/core/editor/paste-sanitizer';
import { isValidLinkHref } from '../../../src/core/markdown/extensions';

describe('Task 2.6d: Restore IME Text Composition & Sanitize Link Control Characters', () => {
  let editor: Editor;

  beforeEach(() => {
    editor = new Editor({
      extensions: createExtensions(),
      content: '<p>Nội dung ban đầu</p>',
    });
  });

  afterEach(() => {
    editor.destroy();
  });

  describe('1. Restore IME Text Composition (B-IME Fix)', () => {
    it('ensures PasteSanitizerExtension does NOT register a blocking handleTextInput hook', () => {
      // Find the plugin provided by PasteSanitizerExtension via its transformPastedHTML prop
      const plugins = editor.state.plugins;
      const pastePlugin = plugins.find((p) => typeof p.props.transformPastedHTML === 'function');
      expect(pastePlugin).toBeDefined();
      // Ensure handleTextInput prop is undefined on pasteSanitizer
      expect(pastePlugin?.props.handleTextInput).toBeUndefined();
    });

    it('does not block handleTextInput during IME composition', () => {
      editor.commands.setContent('<p></p>');
      editor.commands.setTextSelection(1);

      // Simulate IME compositionstart
      const dom = editor.view.dom;
      dom.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
      expect(editor.view.composing).toBe(true);

      // handleTextInput should not be blocked/intercepted by pasteSanitizer
      let defaultInsertCalled = false;
      const handled = editor.view.someProp('handleTextInput', (f) =>
        f(editor.view, 1, 1, 'v', () => {
          defaultInsertCalled = true;
          return editor.state.tr.insertText('v', 1, 1);
        }),
      );

      // No extension should block 'v' from inserting
      expect(handled).toBeFalsy();
      expect(defaultInsertCalled).toBe(false);

      dom.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true }));
      expect(editor.view.composing).toBe(false);
    });

    it('does not trigger InputRules when typing formatting markers while composing', () => {
      editor.commands.setContent('<p></p>');
      editor.commands.setTextSelection(1);

      const dom = editor.view.dom;
      dom.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
      expect(editor.view.composing).toBe(true);

      // Typing '# ' while composing should NOT turn paragraph into heading
      editor.view.someProp('handleTextInput', (f) =>
        f(editor.view, 1, 1, '# ', () => editor.state.tr.insertText('# ', 1, 1)),
      );

      expect(editor.isActive('heading')).toBe(false);
      expect(editor.state.doc.firstChild?.type.name).toBe('paragraph');

      // Typing '*text*' while composing should NOT activate italic mark
      editor.view.someProp('handleTextInput', (f) =>
        f(editor.view, 1, 1, '*chữ*', () => editor.state.tr.insertText('*chữ*', 1, 1)),
      );

      expect(editor.isActive('italic')).toBe(false);

      dom.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true }));
    });
  });

  describe('2. Sanitize Link Control Characters in isValidLinkHref', () => {
    it('rejects javascript: URLs containing control characters (\t, \n, \r, \u0000-\u0020)', () => {
      expect(isValidLinkHref('java\tscript:alert(1)')).toBe(false);
      expect(isValidLinkHref('java\nscript:alert(1)')).toBe(false);
      expect(isValidLinkHref('java\rscript:alert(1)')).toBe(false);
      expect(isValidLinkHref('\u0001javascript:alert(1)')).toBe(false);
      expect(isValidLinkHref('\u0000javascript:alert(1)')).toBe(false);
      expect(isValidLinkHref('\u001fjavascript:alert(1)')).toBe(false);
      expect(isValidLinkHref(' JaVa\rScRiPt:alert(1)')).toBe(false);
      expect(isValidLinkHref('j\ta\nv\ra\u0000script:alert(1)')).toBe(false);
    });

    it('rejects data: and vbscript: URLs containing control characters', () => {
      expect(isValidLinkHref('vb\tscript:msgbox(1)')).toBe(false);
      expect(isValidLinkHref('vb\nscript:msgbox(1)')).toBe(false);
      expect(isValidLinkHref('\u0005vbscript:msgbox(1)')).toBe(false);
      expect(isValidLinkHref('da\tta:text/html,alert(1)')).toBe(false);
      expect(isValidLinkHref('da\nta:text/html,alert(1)')).toBe(false);
      expect(isValidLinkHref(' d\ra\nt\u0001a:text/plain;base64,x')).toBe(false);
    });

    it('allows valid URLs with encoded spaces, relative paths, queries, and fragments', () => {
      expect(isValidLinkHref('https://x.y/a b')).toBe(true);
      expect(isValidLinkHref('./path/to/file')).toBe(true);
      expect(isValidLinkHref('../relative/path')).toBe(true);
      expect(isValidLinkHref('/docs')).toBe(true);
      expect(isValidLinkHref('#heading')).toBe(true);
      expect(isValidLinkHref('?query=1')).toBe(true);
      expect(isValidLinkHref('mailto:user@example.com')).toBe(true);
      expect(isValidLinkHref('https://example.com/path?q=search#section')).toBe(true);
    });
  });

  describe('3. Paste Sanitization with Control Characters', () => {
    it('strips href and src attributes containing control character bypasses', () => {
      const maliciousHtml = `
        <p>
          <a href="java\tscript:alert(1)">Link Tab</a>
          <a href="java\nscript:alert(2)">Link Newline</a>
          <a href="\u0001javascript:alert(3)">Link Ctrl</a>
          <a href=" JaVa\rScRiPt:alert(4)">Link Mixed</a>
          <a href="jav&#x09;ascript:alert(5)">Link Entity</a>
          <img src="java\tscript:alert(6)" alt="img" />
          <a href="https://example.com/valid">Valid Link</a>
        </p>
      `;

      const sanitized = sanitizePastedHtml(maliciousHtml);

      // Dangerous hrefs and srcs must be stripped
      expect(sanitized).not.toContain('alert(');
      expect(sanitized).not.toContain('javascript');

      // Valid link must remain
      expect(sanitized).toContain('href="https://example.com/valid"');
      expect(sanitized).toContain('Valid Link');
    });

    it('blocks setting unsafe links with control characters via Editor commands', () => {
      editor.commands.setContent('<p>Văn bản liên kết</p>');
      editor.commands.selectAll();

      // Attempt to set unsafe link
      editor.commands.setLink({ href: 'java\tscript:alert(1)' });
      expect(editor.isActive('link')).toBe(false);

      editor.commands.setLink({ href: ' JaVa\rScRiPt:alert(1)' });
      expect(editor.isActive('link')).toBe(false);

      // Setting valid link should succeed
      editor.commands.setLink({ href: 'https://example.com' });
      expect(editor.isActive('link')).toBe(true);
      expect(editor.getAttributes('link').href).toBe('https://example.com');
    });
  });
});
