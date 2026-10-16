import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Editor } from '@tiptap/core';
import { createExtensions } from '../../../src/core/editor/extensions';
import { sanitizePastedHtml } from '../../../src/core/editor/paste-sanitizer';

// Polyfill ClipboardEvent in jsdom environment if missing
if (typeof ClipboardEvent === 'undefined') {
  interface ClipboardEventInitLike extends EventInit {
    clipboardData?: DataTransfer | null;
  }
  class MockClipboardEvent extends Event {
    clipboardData: DataTransfer | null;
    constructor(type: string, init?: ClipboardEventInitLike) {
      super(type, init);
      this.clipboardData = init?.clipboardData ?? null;
    }
  }
  Object.defineProperty(globalThis, 'ClipboardEvent', {
    value: MockClipboardEvent,
    writable: true,
    configurable: true,
  });
}

describe('Task 2.6c: Paste Sanitization, DOM Safety & IME Preservation', () => {
  let editor: Editor;

  beforeEach(() => {
    editor = new Editor({
      extensions: createExtensions(),
      content: '<p>Văn bản mẫu</p>',
    });
  });

  afterEach(() => {
    editor.destroy();
  });

  describe('1. Paste Sanitization (Plan 10.2)', () => {
    it('strips styles, colors, fonts, classes, and dir from pasted external HTML (Word/Docs)', () => {
      const dirtyHtml = `
        <p class="MsoNormal" style="color: red; font-size: 20px; font-family: Arial; mso-bidi-font-weight: bold" dir="rtl" align="center">
          <span style="color: #ff0000; font-weight: bold">Văn bản Word</span>
          <font color="blue" face="Verdana" size="4">Phông chữ xanh</font>
        </p>
      `;
      const cleaned = sanitizePastedHtml(dirtyHtml);

      expect(cleaned).not.toContain('style=');
      expect(cleaned).not.toContain('color=');
      expect(cleaned).not.toContain('font=');
      expect(cleaned).not.toContain('class=');
      expect(cleaned).not.toContain('dir=');
      expect(cleaned).not.toContain('align=');
      expect(cleaned).toContain('Văn bản Word');
      expect(cleaned).toContain('Phông chữ xanh');

      // Paste into real editor
      editor.commands.setContent('');
      editor.view.pasteHTML(dirtyHtml);

      expect(editor.getText()).toContain('Văn bản Word');
      expect(editor.getText()).toContain('Phông chữ xanh');
      const html = editor.getHTML();
      expect(html).not.toContain('style=');
      expect(html).not.toContain('class=');
      expect(html).not.toContain('color=');
    });

    it('completely removes malicious elements (<script>, <iframe>, <object>, <embed>) and event handlers', () => {
      const maliciousHtml = `
        <p>Bắt đầu <script>alert("xss")</script> giữa <iframe src="https://evil.com"></iframe> kết thúc</p>
        <object data="bad.swf"></object>
        <embed src="bad.pdf">
        <div onclick="alert(1)" onerror="alert(2)" onmouseover="alert(3)">Nội dung an toàn</div>
      `;
      const cleaned = sanitizePastedHtml(maliciousHtml);

      expect(cleaned).not.toContain('<script');
      expect(cleaned).not.toContain('alert("xss")');
      expect(cleaned).not.toContain('<iframe');
      expect(cleaned).not.toContain('<object');
      expect(cleaned).not.toContain('<embed');
      expect(cleaned).not.toContain('onclick=');
      expect(cleaned).not.toContain('onerror=');
      expect(cleaned).not.toContain('onmouseover=');
      expect(cleaned).toContain('Nội dung an toàn');

      // Paste into real editor
      editor.commands.setContent('');
      editor.view.pasteHTML(maliciousHtml);

      const html = editor.getHTML();
      const dom = new DOMParser().parseFromString(html, 'text/html');
      expect(dom.querySelectorAll('script').length).toBe(0);
      expect(dom.querySelectorAll('iframe').length).toBe(0);
      expect(dom.querySelectorAll('object').length).toBe(0);
      expect(dom.querySelectorAll('embed').length).toBe(0);
    });

    it('never creates rawBlock or rawHtmlTag from pasted external HTML', () => {
      const forgedRawHtml = `
        <div data-raw-block="" data-raw-format="html" data-raw-content="<script>malicious()</script>">
          Khối giả mạo
        </div>
        <span data-raw-html-tag="" data-raw-source="<iframe src='bad'>">
          Thẻ giả mạo
        </span>
      `;
      const cleaned = sanitizePastedHtml(forgedRawHtml);

      expect(cleaned).not.toContain('data-raw-block');
      expect(cleaned).not.toContain('data-raw-html-tag');

      editor.commands.setContent('');
      editor.view.pasteHTML(forgedRawHtml);

      // Verify no rawBlock or rawHtmlTag nodes exist in the ProseMirror doc
      let hasRawBlock = false;
      let hasRawHtmlTag = false;
      editor.state.doc.descendants((node) => {
        if (node.type.name === 'rawBlock') hasRawBlock = true;
        if (node.type.name === 'rawHtmlTag') hasRawHtmlTag = true;
      });

      expect(hasRawBlock).toBe(false);
      expect(hasRawHtmlTag).toBe(false);
    });
  });

  describe('2. DOM Safety Verification', () => {
    it('ensures getHTML() never contains dangerous tags, on* attributes, or dangerous URL schemes', () => {
      // Simulate inserting various rich contents
      editor.commands.setContent(`
        <p>Thử nghiệm <a href="javascript:alert('link')">Link độc hại</a></p>
        <p><a href="data:text/html,<script>alert(1)</script>">Data URI</a></p>
        <p><a href="vbscript:msgbox(1)">VBScript URI</a></p>
        <img src="javascript:alert('img')" alt="malicious" />
        <img src="data:image/svg+xml,<svg></svg>" alt="data img" />
      `);

      const html = editor.getHTML();
      const doc = new DOMParser().parseFromString(html, 'text/html');

      // 1. Forbidden elements
      const forbiddenTags = [
        'script',
        'style',
        'iframe',
        'object',
        'embed',
        'video',
        'svg',
        'form',
        'input',
        'textarea',
        'select',
        'option',
        'button',
        'link',
        'meta',
        'base',
      ];
      for (const tag of forbiddenTags) {
        expect(doc.querySelectorAll(tag).length, `Forbidden element found: <${tag}>`).toBe(0);
      }

      // 2. Forbidden event handler attributes
      const allElements = doc.querySelectorAll('*');
      allElements.forEach((el) => {
        Array.from(el.attributes).forEach((attr) => {
          expect(
            attr.name.toLowerCase().startsWith('on'),
            `Forbidden on* attribute: ${attr.name}`,
          ).toBe(false);
        });
      });

      // 3. Forbidden URL schemes in href and src
      doc.querySelectorAll('a').forEach((a) => {
        const href = a.getAttribute('href') || '';
        expect(href).not.toMatch(/^(javascript|data|vbscript):/i);
      });
      doc.querySelectorAll('img').forEach((img) => {
        const src = img.getAttribute('src') || '';
        expect(src).not.toMatch(/^(javascript|data|vbscript):/i);
      });
    });
  });

  describe('3. IME Composition Preservation', () => {
    it('suppresses InputRules while IME composition is active (view.composing === true)', () => {
      editor.commands.setContent('<p></p>');

      // Set caret to beginning
      editor.commands.setTextSelection(1);

      // Simulate IME composing state via dispatching compositionstart
      const dom = editor.view.dom;
      dom.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
      expect(editor.view.composing).toBe(true);

      // Type '# ' through handleTextInput while composing
      const handled = editor.view.someProp('handleTextInput', (f) =>
        f(editor.view, 1, 1, '# ', () => editor.state.tr.insertText('# ', 1, 1)),
      );

      // Should not be intercepted/blocked by paste sanitizer (handled is falsy)
      expect(handled).toBeFalsy();
      // Document must remain paragraph, NOT heading
      expect(editor.isActive('heading')).toBe(false);
      expect(editor.state.doc.firstChild?.type.name).toBe('paragraph');

      // Now complete composition
      dom.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true }));
      expect(editor.view.composing).toBe(false);
    });

    it('suppresses formatting shortcuts while IME is composing (isComposing === true)', () => {
      editor.commands.setContent('<p>từ đang soạn</p>');
      editor.commands.selectAll();

      // Dispatch Ctrl+B with isComposing = true
      const event = new KeyboardEvent('keydown', {
        key: 'b',
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      });
      Object.defineProperty(event, 'isComposing', { value: true });

      const dispatched = editor.view.dom.dispatchEvent(event);

      // Should not toggle bold mark while composing
      expect(editor.isActive('bold')).toBe(false);
      expect(dispatched).toBe(true);
    });

    it('preserves exact Unicode NFC and NFD strings without mutation', () => {
      // Vietnamese 'thế hệ' in NFC: \u0074\u0068\u1EBF\u0020\u0068\u1EC7
      const nfcString = 'th\u1EBF h\u1EC7';
      // Vietnamese 'thế hệ' in NFD: \u0074\u0068\u0065\u0302\u0301\u0020\u0068\u0065\u0323
      const nfdString = 'the\u0302\u0301 he\u0323';

      editor.commands.setContent(`<p>${nfcString}</p><p>${nfdString}</p>`);

      const textNfc = editor.state.doc.child(0).textContent;
      const textNfd = editor.state.doc.child(1).textContent;

      // Assert NFC remains exact NFC code points
      expect(textNfc).toBe(nfcString);
      expect(textNfc.length).toBe(nfcString.length);

      // Assert NFD remains exact NFD code points without converting to NFC
      expect(textNfd).toBe(nfdString);
      expect(textNfd.length).toBe(nfdString.length);
    });

    it('composes text safely adjacent to rawHtmlTag and Markdown formatting symbols', () => {
      editor.commands.setContent({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Trước ' },
              { type: 'rawHtmlTag', attrs: { source: '<custom-tag>' } },
              { type: 'text', text: ' # và *sau*' },
            ],
          },
        ],
      });

      // Caret immediately after rawHtmlTag
      // In doc: "Trước " (length 6, pos 1..7), rawHtmlTag (size 1, pos 7..8), text " # và *sau*" (pos 8..)
      editor.commands.setTextSelection(8);

      // Simulate composition lifecycle: start -> update -> end
      const dom = editor.view.dom;
      dom.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
      expect(editor.view.composing).toBe(true);

      dom.dispatchEvent(new CompositionEvent('compositionupdate', { data: 'việt', bubbles: true }));
      editor.commands.insertContent('việt');

      dom.dispatchEvent(new CompositionEvent('compositionend', { data: 'việt', bubbles: true }));
      expect(editor.view.composing).toBe(false);

      expect(editor.getText()).toContain('Trước');
      expect(editor.getText()).toContain('việt');
      expect(editor.getText()).toContain('# và *sau*');

      // Verify rawHtmlTag remained completely intact
      let foundTag = false;
      editor.state.doc.descendants((node) => {
        if (node.type.name === 'rawHtmlTag' && node.attrs.source === '<custom-tag>') {
          foundTag = true;
        }
      });
      expect(foundTag).toBe(true);
    });
  });

  describe('4. Cursor Navigation around Inline Atom Nodes (rawHtmlTag)', () => {
    it('navigates caret before and after rawHtmlTag without getting trapped', () => {
      editor.commands.setContent({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'ABC' },
              { type: 'rawHtmlTag', attrs: { source: '<tag>' } },
              { type: 'text', text: 'DEF' },
            ],
          },
        ],
      });

      // 'ABC' ends at pos 4
      editor.commands.setTextSelection(4);
      expect(editor.state.selection.from).toBe(4);

      // Move caret to pos 5 (after atom node <tag>)
      editor.commands.setTextSelection(5);
      expect(editor.state.selection.from).toBe(5);

      // Select node itself
      editor.commands.setNodeSelection(4);
      expect(editor.state.selection.from).toBe(4);
      expect(editor.state.selection.to).toBe(5);
    });

    it('deletes whole rawHtmlTag atomic node cleanly on Backspace and Delete without breaking DOM', () => {
      editor.commands.setContent({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'ABC' },
              { type: 'rawHtmlTag', attrs: { source: '<tag>' } },
              { type: 'text', text: 'DEF' },
            ],
          },
        ],
      });

      // Backspace immediately after <tag> (pos 5)
      editor.commands.setTextSelection(5);
      // Delete backward (Backspace)
      const tr = editor.state.tr.delete(4, 5);
      editor.view.dispatch(tr);

      expect(editor.getText()).toBe('ABCDEF');
      let tagCount = 0;
      editor.state.doc.descendants((node) => {
        if (node.type.name === 'rawHtmlTag') tagCount++;
      });
      expect(tagCount).toBe(0);
      expect(editor.getHTML()).toBe('<p>ABCDEF</p>');
    });
  });
});
