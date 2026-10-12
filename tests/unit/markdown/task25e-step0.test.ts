import { describe, it, expect } from 'vitest';
import { parse, serialize } from '../../../src/core/markdown';

describe('Task 2.5e+g Step 0: Scope entity, footnote, and reference escaping to plain text nodes', () => {
  it('1. Fenced code block: preserves &amp;copy;, &amp;#35;, &amp;lt;, \\[^1\\], and [ref] byte-for-byte', () => {
    const md1 = '```md\n&amp;copy; and &amp;#35; and &amp;lt;\n```\n';
    expect(serialize(parse(md1).doc)).toBe(md1);

    const md2 = '```md\n\\[^1\\]\ntext\n```\n';
    expect(serialize(parse(md2).doc)).toBe(md2);

    const md3 = '```md\n[ref]\n: http://x\n```\n';
    expect(serialize(parse(md3).doc)).toBe(md3);
  });

  it('2. Inline code span: preserves `&amp;copy;` and `\\[^1\\]` byte-for-byte', () => {
    const md1 = 'use `&amp;copy;` here\n';
    expect(serialize(parse(md1).doc)).toBe(md1);

    const md2 = '`\\[^1\\]`\n';
    expect(serialize(parse(md2).doc)).toBe(md2);
  });

  it('3. Raw HTML block: preserves <div>\\n&amp;copy; \\[^1\\]\\n</div> byte-for-byte', () => {
    const md = '<div>\n&amp;copy; \\[^1\\]\n</div>\n';
    expect(serialize(parse(md).doc)).toBe(md);
  });

  it('4. Plain text: preserves AT&T &copy; < and Footnote[^1] here.', () => {
    const md1 = 'AT&T &copy; <\n';
    expect(serialize(parse(md1).doc)).toBe(md1);

    const md2 = 'Footnote[^1] here.\n\n[^1]: The note.\n';
    expect(serialize(parse(md2).doc)).toBe(md2);
  });

  it('5. Manual plain text reference in editor: [ref]: http://x serializes to \\[ref]: http://x (golden)', () => {
    const inputDoc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: '[ref]: http://x',
            },
          ],
        },
      ],
    };
    expect(serialize(inputDoc)).toBe('\\[ref]: http://x\n');
  });
});
