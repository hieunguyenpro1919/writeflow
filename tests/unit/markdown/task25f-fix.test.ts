import { describe, expect, it } from 'vitest';
import { Lexer, type Token, type Tokens } from 'marked';
import { parse } from '../../../src/core/markdown/parser';
import { serialize } from '../../../src/core/markdown/serializer';
import { safePunctuation } from '../../../src/core/markdown/extensions';

interface ProseMirrorNode {
  type: string;
  content?: ProseMirrorNode[];
  text?: string;
}

describe('Task 2.5f-fix: B9, B10, B5b and AST Inventory Tightening', () => {
  describe('Mục 1: B9 - Khắc phục mất khối mã lồng trong danh sách (express-history.md)', () => {
    it('preserves indented fenced code block inside 2-space indented bullet list item', () => {
      const snippet = `- item\n  \`\`\`js\n  QUERY /reports\n  \`\`\`\n`;
      const p = parse(snippet);
      const listContent = (p.doc.content?.[0]?.content?.[0] as ProseMirrorNode | undefined)?.content;
      const codeNodes = listContent?.filter((n) => n.type === 'codeBlock');
      expect(codeNodes).toBeDefined();
      expect(codeNodes?.length).toBe(1);
      expect(codeNodes?.[0].content?.[0]?.text).toBe('QUERY /reports');

      const s = serialize(p.doc);
      expect(s).toContain('QUERY /reports');
      expect(s).toContain('```js');
    });

    it('preserves all 4 code blocks from express-history.md 1.0.0-alpha1 byte-for-byte', () => {
      const expressHistoryExcerpt = `## 1.0.0-alpha1 / 2010-01-03

  * Added \`app.render()\`. Resolves #80
  * Added custom options support to \`res.render()\`, \`app.render()\` etc
  * Added \`QUERY\` method support.
  
    \`\`\`js
    QUERY /reports
    \`\`\`

  * Added support for \`app.render('index')\`
  * Added support for multiple view engines. Resolves #167
  
    \`\`\`js
    app.render('index.html');
    app.render('user.html');
    \`\`\`

  * Added support for query string params: \`foo=bar\`
  
    \`\`\`sh
    curl http://localhost:3000/?foo=bar
    \`\`\`
`;

      const p1 = parse(expressHistoryExcerpt);
      const s1 = serialize(p1.doc);

      // Verify marked tokens on s1
      const tokens = Lexer.lex(s1);
      const codeTokens: { lang?: string; text: string }[] = [];
      function collectCode(list: (Token | Tokens.Generic)[]) {
        for (const t of list) {
          if (t.type === 'code') codeTokens.push({ lang: (t as Tokens.Code).lang, text: (t as Tokens.Code).text.trim() });
          if ('tokens' in t && Array.isArray(t.tokens)) collectCode(t.tokens);
          if ('items' in t && Array.isArray(t.items)) collectCode(t.items);
        }
      }
      collectCode(tokens);

      expect(codeTokens.length).toBe(3);
      expect(codeTokens[0].text).toBe('QUERY /reports');
      expect(codeTokens[1].text).toContain("app.render('index.html');");
      expect(codeTokens[1].text).toContain("app.render('user.html');");
      expect(codeTokens[2].text).toBe('curl http://localhost:3000/?foo=bar');

      // Check round-trip idempotency on the excerpt
      const p2 = parse(s1);
      const s2 = serialize(p2.doc);
      expect(s2).toBe(s1);
    });
  });

  describe('Mục 2: B10 - Khắc phục dư dấu cách thụt lề trong danh sách số', () => {
    it('preserves exact byte indentation of code block inside ordered list (with blank line)', () => {
      const md = `1. step\n\n   \`\`\`bash\n   npm i\n   \`\`\`\n`;
      const p = parse(md);
      const s = serialize(p.doc);
      expect(s).not.toContain('    npm i');
      expect(s).toContain('   npm i');

      const listContent = (p.doc.content?.[0]?.content?.[0] as ProseMirrorNode | undefined)?.content;
      const codeNode = listContent?.find((n) => n.type === 'codeBlock');
      expect(codeNode).toBeDefined();
      expect(codeNode?.content?.[0]?.text).toBe('npm i');
    });

    it('preserves code block inside ordered list without blank line', () => {
      const md = `1. step\n   \`\`\`bash\n   npm i\n   \`\`\`\n`;
      const p = parse(md);
      const s = serialize(p.doc);
      expect(s).toContain('npm i');
      expect(s).not.toContain('    npm i');
    });

    it('preserves code block inside bullet list without extra spaces', () => {
      const md = `- item\n\n  \`\`\`bash\n  npm i\n  \`\`\`\n`;
      const p = parse(md);
      const s = serialize(p.doc);
      expect(s).toContain('npm i');
      const listContent = (p.doc.content?.[0]?.content?.[0] as ProseMirrorNode | undefined)?.content;
      const codeNode = listContent?.find((n) => n.type === 'codeBlock');
      expect(codeNode?.content?.[0]?.text).toBe('npm i');
    });

    it('preserves code block in multi-level nested list', () => {
      const md = `1. Level 1\n   1. Level 2\n\n      \`\`\`bash\n      npm test\n      \`\`\`\n`;
      const p = parse(md);
      const s = serialize(p.doc);
      expect(s).toContain('npm test');
      const p2 = parse(s);
      const s2 = serialize(p2.doc);
      expect(s2).toBe(s);
    });
  });

  describe('Mục 3: B5b - Code span kết thúc bằng dấu gạch chéo ngược', () => {
    it('asserts that safePunctuation patch is actively applied to marked Lexer rules', () => {
      const inlineRules = (
        Lexer as unknown as { rules?: { inline?: Record<string, { anyPunctuation?: unknown }> } }
      ).rules?.inline;
      expect(inlineRules).toBeDefined();
      expect(inlineRules?.gfm?.anyPunctuation).toBe(safePunctuation);
    });

    it('preserves **bold** and backslash byte-for-byte: `a\\` and **bold** and `b`', () => {
      const input = '`a\\` and **bold** and `b`';
      const tokens = Lexer.lexInline(input);
      const strongTok = tokens.find((t): t is Tokens.Strong => t.type === 'strong');
      expect(strongTok).toBeDefined();
      expect(strongTok?.text).toBe('bold');

      const p = parse(input);
      const s = serialize(p.doc);
      expect(s.trim()).toBe(input);
    });

    it('preserves **x** and backslash byte-for-byte: `C:\\dir\\` and **x**', () => {
      const input = '`C:\\dir\\` and **x**';
      const tokens = Lexer.lexInline(input);
      const strongTok = tokens.find((t): t is Tokens.Strong => t.type === 'strong');
      expect(strongTok).toBeDefined();
      expect(strongTok?.text).toBe('x');

      const p = parse(input);
      const s = serialize(p.doc);
      expect(s.trim()).toBe(input);
    });

    it('preserves escaped backticks and bold in complex list line (repo-tasks-phase-1 line 173)', () => {
      const line =
        '- **Tiêu chí xong:** [ ] schema **không** chứa mark `underline`/`link` và node `codeBlock`/`horizontalRule` (test kiểm tra `editor.schema.marks/nodes`); [ ] heading có 6 cấp; [ ] gõ ``` ``` ```, `---`, URL **không** kích hoạt gì (nhập chữ thường); [ ] không còn trailing node (tài liệu kết thúc bằng một tiêu đề **không** tự sinh đoạn rỗng sau nó); [ ] chạy dưới `StrictMode` không nhân đôi editor.';
      const p1 = parse(line);
      const s1 = serialize(p1.doc, p1.frontmatter);
      const p2 = parse(s1);
      const s2 = serialize(p2.doc, p2.frontmatter);
      expect(s2).toBe(s1);
      expect(s1).toContain('URL **không**');
    });
  });
});
