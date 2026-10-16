import { describe, it, expect } from 'vitest';
import { Editor } from '@tiptap/core';
import { parse, serialize } from '../../../src/core/markdown';
import { createExtensions } from '../../../src/core/editor/extensions';

function roundtrip(input: string, times = 3): string {
  let current = input;
  for (let i = 0; i < times; i++) {
    const parsed = parse(current);
    current = serialize(parsed.doc);
  }
  return current;
}

describe('Task 2.5d-fix: Inline HTML tags as atomic rawHtmlTag nodes', () => {
  it('preserves existing task25d baseline inline HTML tags byte-for-byte and idempotent', () => {
    const baselines = [
      'H<sub>2</sub>O\n',
      'E=mc<sup>2</sup>\n',
      '<mark>x</mark>\n',
      '<small>s</small>\n',
      '<u>x</u>\n',
      '<abbr title="W3C">W3C</abbr>\n',
      '<span class="a">x</span>\n',
      'press <kbd>Ctrl</kbd>\n',
      '<mark>**b**</mark>\n',
    ];

    for (const text of baselines) {
      const res = roundtrip(text, 3);
      expect(res).toBe(text);
    }
  });

  it('1. preserves nested tags <b><span class="x">y</span></b>', () => {
    const input = '<b><span class="x">y</span></b>\n';
    expect(roundtrip(input, 3)).toBe(input);
  });

  it('2. preserves nested tags <kbd><b>x</b></kbd>', () => {
    const input = '<kbd><b>x</b></kbd>\n';
    expect(roundtrip(input, 3)).toBe(input);
  });

  it('3. preserves nested same tags <span class="a"><span class="b">x</span></span>', () => {
    const input = '<span class="a"><span class="b">x</span></span>\n';
    expect(roundtrip(input, 3)).toBe(input);
  });

  it('4. preserves <sub><mark>x</mark></sub> and <abbr title="t"><sup>2</sup></abbr>', () => {
    const c1 = '<sub><mark>x</mark></sub>\n';
    const c2 = '<abbr title="t"><sup>2</sup></abbr>\n';
    expect(roundtrip(c1, 3)).toBe(c1);
    expect(roundtrip(c2, 3)).toBe(c2);
  });

  it('5. preserves <span style="color:red">press <kbd>Ctrl</kbd></span> in proper order', () => {
    const input = '<span style="color:red">press <kbd>Ctrl</kbd></span>\n';
    expect(roundtrip(input, 3)).toBe(input);
  });

  it('6. normalizes <b><i>x</i></b> to <b>*x*</b>', () => {
    const input = '<b><i>x</i></b>\n';
    const expected = '<b>*x*</b>\n';
    expect(roundtrip(input, 3)).toBe(expected);
  });

  it('7. normalizes text<sup><a href="#fn1">1</a></sup> end to text<sup>[1](#fn1)</sup> end', () => {
    const input = 'text<sup><a href="#fn1">1</a></sup> end\n';
    const expected = 'text<sup>[1](#fn1)</sup> end\n';
    expect(roundtrip(input, 3)).toBe(expected);
  });

  it('8. preserves unsupported tags verbatim (script, style, iframe, object, embed, video, svg, wbr, custom elements)', () => {
    const unsupported = [
      'a <script>alert(1)</script> b\n',
      'a <style>p{color:red}</style> b\n',
      'a <iframe src="http://x"></iframe> b\n',
      'a <object data="x"></object> b\n',
      'a <embed src="x"> b\n',
      'a <video src="x"></video> b\n',
      'a <svg><circle/></svg> b\n',
      'a <wbr> b\n',
      'a <custom-el foo="1">x</custom-el> b\n',
    ];

    for (const text of unsupported) {
      expect(roundtrip(text, 3)).toBe(text);
    }
  });

  it('9. preserves unclosed tag <b>chưa đóng and mismatched <b>x</i>', () => {
    const c1 = '<b>chưa đóng\n';
    const c2 = '<b>x</i>\n';
    expect(roundtrip(c1, 3)).toBe(c1);
    expect(roundtrip(c2, 3)).toBe(c2);
  });

  it('10. preserves single quotes and &amp; in attributes: <abbr title="a &amp; b" data-x=\'1\'>W</abbr>', () => {
    const input = '<abbr title="a &amp; b" data-x=\'1\'>W</abbr>\n';
    expect(roundtrip(input, 3)).toBe(input);
  });

  it('11. DOM Safety: Real editor with getHTML() creates no executable/dangerous elements and no on* attributes', () => {
    const dangerousTexts = [
      'a <script>alert(1)</script> b',
      'a <style>p{color:red}</style> b',
      'a <iframe src="http://x"></iframe> b',
      'a <object data="x"></object> b',
      'a <embed src="x"> b',
      'a <video src="x"></video> b',
      'a <svg><circle/></svg> b',
      '<form action="x"><input name=a><button>b</button></form>',
      '<textarea>x</textarea>',
      '<select><option>x</option></select>',
      '<span onclick="alert(1)">x</span>',
    ];

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

    for (const text of dangerousTexts) {
      const parsed = parse(text);
      const editor = new Editor({
        extensions: createExtensions(),
        content: parsed.doc,
      });

      const html = editor.getHTML();
      const dom = new DOMParser().parseFromString(html, 'text/html');

      for (const tag of forbiddenTags) {
        expect(dom.querySelectorAll(tag).length).toBe(0);
      }

      const allElements = dom.querySelectorAll('*');
      for (const el of Array.from(allElements)) {
        for (const attr of Array.from(el.attributes)) {
          expect(attr.name.toLowerCase().startsWith('on')).toBe(false);
        }
      }

      editor.destroy();
    }
  });

  it('12. Heading hard break: # a<br>b is preserved and idempotent across N saves', () => {
    const input = '# a<br>b\n';
    expect(roundtrip(input, 3)).toBe(input);

    const h2 = '## heading<br>second line\n';
    expect(roundtrip(h2, 3)).toBe(h2);
  });

  it('13. Paste safety: pasting arbitrary HTML does not create rawHtmlTag or rawInline', () => {
    const editor = new Editor({
      extensions: createExtensions(),
    });

    // Simulate pasting HTML: <p>Hello <span style="color:red">x</span> <font color="red">y</font> <b>z</b></p>
    const pasteHtml = '<p>Hello <span style="color:red">x</span> <font color="red">y</font> <b>z</b></p>';
    editor.commands.setContent(pasteHtml, { emitUpdate: false });

    const json = editor.getJSON();
    const strJson = JSON.stringify(json);

    expect(strJson).not.toContain('"rawHtmlTag"');
    expect(strJson).not.toContain('"rawInline"');

    editor.destroy();
  });
});
