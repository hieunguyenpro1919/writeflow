import fs from 'node:fs';
import path from 'node:path';
import { marked, type Token, type Tokens } from 'marked';
import { extractFrontmatter, parse } from '../src/core/markdown/parser';
import { serialize } from '../src/core/markdown/serializer';

export interface FileReport {
  filename: string;
  category: 'oss' | 'real' | 'synthetic';
  sourceDesc: string;
  originalBytes: number;
  s1Bytes: number;
  s2Bytes: number;
  s3Bytes: number;
  parseThrows: boolean;
  serializeThrows: boolean;
  error?: string;
  isIdempotent: boolean;
  isByteExact: boolean;
  inventoryDiff: {
    wordsMismatch: boolean;
    linksMismatch: boolean;
    imagesMismatch: boolean;
    codeBlocksMismatch: boolean;
    tablesMismatch: boolean;
    htmlMismatch: boolean;
    frontmatterMismatch: boolean;
    details: string[];
  };
  group: 1 | 2 | 3 | 'CLEAN';
  differences: string[];
  defects: string[];
}

export interface AstTokenCounts {
  strong: number;
  em: number;
  codespan: number;
  link: number;
  image: number;
  table: number;
  listItem: number;
  code: number;
}

export const ACCEPTED_NORMALIZATIONS = [
  'HTML anchor <a> normalized to markdown link [text](url)',
  'HTML emphasis <i> / <em> normalized to markdown *emphasis*',
  'HTML line break <br> normalized to trailing backslash \\',
  'Reference link definition [text][ref] normalized to inline link [text](url)',
  'Bare URL autolinked to [url](url)',
  'Adjacent bullet lists merged into a single list block',
  'Code block indentation in list items normalized to canonical markdown indent',
];

export interface Inventory {
  frontmatter: string;
  words: string[];
  links: string[];
  images: string[];
  codeBlocks: string[];
  tables: string[];
  htmlBlocks: string[];
  astTokens: AstTokenCounts;
}

export function extractInventory(md: string): Inventory {
  const { frontmatter, body } = extractFrontmatter(md);
  const tokens = marked.lexer(body);
  const inv: Inventory = {
    frontmatter: frontmatter?.raw ?? '',
    words: [],
    links: [],
    images: [],
    codeBlocks: [],
    tables: [],
    htmlBlocks: [],
    astTokens: {
      strong: 0,
      em: 0,
      codespan: 0,
      link: 0,
      image: 0,
      table: 0,
      listItem: 0,
      code: 0,
    },
  };

  function walk(tokenList: Tokens.Generic[] | Token[]) {
    for (const t of tokenList) {
      if (t.type === 'strong') {
        inv.astTokens.strong++;
      } else if (t.type === 'em') {
        inv.astTokens.em++;
      } else if (t.type === 'codespan') {
        inv.astTokens.codespan++;
      } else if (t.type === 'link') {
        inv.astTokens.link++;
        inv.links.push((t as Tokens.Link).href);
      } else if (t.type === 'image') {
        inv.astTokens.image++;
        const img = t as Tokens.Image;
        inv.images.push(`${img.href}|${img.text || ''}|${img.title || ''}`);
      } else if (t.type === 'table') {
        inv.astTokens.table++;
        const header = (t as Tokens.Table).header.map((c) => c.text.trim()).join('|');
        const rows = (t as Tokens.Table).rows.map((r) => r.map((c) => c.text.trim()).join('|')).join(';');
        inv.tables.push(`${header}---${rows}`);
      } else if (t.type === 'list_item') {
        inv.astTokens.listItem++;
      } else if (t.type === 'code') {
        inv.astTokens.code++;
        inv.codeBlocks.push(`${t.lang || ''}:${t.text.trim()}`);
      } else if (t.type === 'html') {
        inv.htmlBlocks.push(t.text.trim());
        const hrefMatches = t.text.matchAll(/<a\s+[^>]*href=["']([^"']+)["']/gi);
        for (const m of hrefMatches) {
          inv.links.push(m[1]);
        }
        const srcMatches = t.text.matchAll(/<img\s+[^>]*src=["']([^"']+)["']/gi);
        for (const m of srcMatches) {
          inv.images.push(m[1]);
        }
      }

      if ('text' in t && typeof t.text === 'string' && t.type !== 'code' && t.type !== 'html') {
        // Extract words (Vietnamese & Latin words, excluding pure syntax characters and bare urls)
        const words = t.text
          .replace(/[\\`*_[\]~#+\-><|()]/g, ' ')
          .split(/\s+/)
          .map((w: string) => w.trim().toLowerCase())
          .filter((w: string) => w.length > 0 && !w.startsWith('http') && !w.startsWith('www.'));
        inv.words.push(...words);
      }

      if ('tokens' in t && Array.isArray(t.tokens)) {
        walk(t.tokens as Tokens.Generic[]);
      }
      if ('items' in t && Array.isArray(t.items)) {
        walk(t.items as Tokens.Generic[]);
      }
    }
  }

  walk(tokens);

  inv.words.sort();
  inv.links.sort();
  inv.images.sort();
  inv.codeBlocks.sort();
  inv.tables.sort();
  inv.htmlBlocks.sort();

  return inv;
}

export function compareInventories(inv1: Inventory, inv2: Inventory) {
  const details: string[] = [];

  const fmMatch = inv1.frontmatter === inv2.frontmatter;
  if (!fmMatch) details.push('Frontmatter mismatch');

  const codeMatch = JSON.stringify(inv1.codeBlocks) === JSON.stringify(inv2.codeBlocks);
  if (!codeMatch) details.push(`Code blocks mismatch (orig: ${inv1.codeBlocks.length}, s1: ${inv2.codeBlocks.length})`);

  const tableMatch = JSON.stringify(inv1.tables) === JSON.stringify(inv2.tables);
  if (!tableMatch) details.push(`Tables mismatch (orig: ${inv1.tables.length}, s1: ${inv2.tables.length})`);

  const htmlMatch = JSON.stringify(inv1.htmlBlocks) === JSON.stringify(inv2.htmlBlocks);
  if (!htmlMatch) details.push(`HTML mismatch (orig: ${inv1.htmlBlocks.length}, s1: ${inv2.htmlBlocks.length})`);

  const linksMatch = JSON.stringify(inv1.links) === JSON.stringify(inv2.links);
  if (!linksMatch) details.push(`Links mismatch (orig: ${inv1.links.length}, s1: ${inv2.links.length})`);

  const imagesMatch = JSON.stringify(inv1.images) === JSON.stringify(inv2.images);
  if (!imagesMatch) details.push(`Images mismatch (orig: ${inv1.images.length}, s1: ${inv2.images.length})`);

  // AST tokens check
  if (inv2.astTokens.code !== inv1.astTokens.code) {
    details.push(`AST code count mismatch (orig: ${inv1.astTokens.code}, s1: ${inv2.astTokens.code})`);
  }
  if (inv2.astTokens.table !== inv1.astTokens.table) {
    details.push(`AST table count mismatch (orig: ${inv1.astTokens.table}, s1: ${inv2.astTokens.table})`);
  }
  if (inv2.astTokens.listItem !== inv1.astTokens.listItem) {
    details.push(`AST listItem count mismatch (orig: ${inv1.astTokens.listItem}, s1: ${inv2.astTokens.listItem})`);
  }
  if (inv2.astTokens.strong < inv1.astTokens.strong) {
    details.push(`AST strong lost (orig: ${inv1.astTokens.strong}, s1: ${inv2.astTokens.strong})`);
  }
  if (inv2.astTokens.em < inv1.astTokens.em) {
    details.push(`AST em lost (orig: ${inv1.astTokens.em}, s1: ${inv2.astTokens.em})`);
  }
  if (inv2.astTokens.codespan < inv1.astTokens.codespan) {
    details.push(`AST codespan lost (orig: ${inv1.astTokens.codespan}, s1: ${inv2.astTokens.codespan})`);
  }

  // Words multiset difference
  const words1 = [...inv1.words];
  const words2 = [...inv2.words];
  const missingWords: string[] = [];
  for (const w of words1) {
    const idx = words2.indexOf(w);
    if (idx >= 0) {
      words2.splice(idx, 1);
    } else {
      missingWords.push(w);
    }
  }
  const wordsMatch = missingWords.length === 0 && words2.length === 0;
  if (!wordsMatch && (missingWords.length > 0 || words2.length > 0)) {
    details.push(`Word multiset diff: missing [${missingWords.slice(0, 5).join(', ')}], extra [${words2.slice(0, 5).join(', ')}]`);
  }

  return {
    wordsMismatch: !wordsMatch,
    linksMismatch: !linksMatch,
    imagesMismatch: !imagesMatch,
    codeBlocksMismatch: !codeMatch,
    tablesMismatch: !tableMatch,
    htmlMismatch: !htmlMatch,
    frontmatterMismatch: !fmMatch,
    details,
  };
}

export function getAllCorpusFiles(dir: string, baseDir = dir): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const result: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      result.push(...getAllCorpusFiles(fullPath, baseDir));
    } else if (entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'SOURCES.md') {
      result.push(path.relative(baseDir, fullPath).replace(/\\/g, '/'));
    }
  }
  return result.sort();
}

export function runCorpusEvaluation(corpusDir: string): FileReport[] {
  const files = getAllCorpusFiles(corpusDir);
  const reports: FileReport[] = [];

  for (const filename of files) {
    const filePath = path.join(corpusDir, filename);
    const rawBuffer = fs.readFileSync(filePath);
    const originalContent = rawBuffer.toString('utf8');

    // Category
    const category: 'oss' | 'real' | 'synthetic' = filename.startsWith('oss/')
      ? 'oss'
      : filename.startsWith('real/')
        ? 'real'
        : 'synthetic';

    // Preserve options (BOM, EOL)
    const hasBOM = rawBuffer.length >= 3 && rawBuffer[0] === 0xef && rawBuffer[1] === 0xbb && rawBuffer[2] === 0xbf;
    const isCRLF = originalContent.includes('\r\n');
    const options = {
      eol: isCRLF ? ('crlf' as const) : ('lf' as const),
      preserveBOM: hasBOM,
    };

    let parseThrows = false;
    let serializeThrows = false;
    let s1 = '';
    let s2 = '';
    let s3 = '';
    let error: string | undefined;

    try {
      const parsed1 = parse(originalContent);
      s1 = serialize(parsed1.doc, parsed1.frontmatter, options);
      const parsed2 = parse(s1);
      s2 = serialize(parsed2.doc, parsed2.frontmatter, options);
      const parsed3 = parse(s2);
      s3 = serialize(parsed3.doc, parsed3.frontmatter, options);
    } catch (e: any) {
      parseThrows = true;
      serializeThrows = true;
      error = e.message || String(e);
    }

    const isIdempotent = s1 === s2 && s2 === s3 && !parseThrows;
    const isByteExact = s1 === originalContent && !parseThrows;

    let invDiff = {
      wordsMismatch: false,
      linksMismatch: false,
      imagesMismatch: false,
      codeBlocksMismatch: false,
      tablesMismatch: false,
      htmlMismatch: false,
      frontmatterMismatch: false,
      details: [] as string[],
    };

    const differences: string[] = [];
    const defects: string[] = [];

    if (!parseThrows) {
      try {
        const invOrig = extractInventory(originalContent);
        const invS1 = extractInventory(s1);
        invDiff = compareInventories(invOrig, invS1);
      } catch (e: any) {
        invDiff.details.push(`Inventory extraction error: ${e.message}`);
      }

      // Check defect patterns B2, B6, B1b, B8, N1
      const origBadges = (originalContent.match(/\[!\[[^\]]*\]\([^)]+\)\]\([^)]+\)/g) || []).length;
      const s1Badges = (s1.match(/\[!\[[^\]]*\]\([^)]+\)\]\([^)]+\)/g) || []).length;
      if (origBadges > 0 && s1Badges < origBadges) {
        defects.push(`B2: Badge link lost (${origBadges} -> ${s1Badges})`);
      }

      const origAImg = (originalContent.match(/<a\s+[^>]*href[^>]*>[\s\S]*?<img[\s\S]*?<\/a>/gi) || []).length;
      const s1AImg = (s1.match(/<a\s+[^>]*href[^>]*>[\s\S]*?<img[\s\S]*?<\/a>/gi) || []).length;
      if (origAImg > 0 && s1AImg < origAImg) {
        defects.push(`B6: HTML <a><img></a> to bare img (${origAImg} -> ${s1AImg})`);
      }

      if (/(?:<br\s*\/?>|\\\n|  \n)/i.test(originalContent) && (s1.includes('\\\n\n') || !isIdempotent)) {
        defects.push('B1b: Trailing backslash / br line break');
      }

      if (/>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i.test(originalContent) && />\s*\\\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)/i.test(s1)) {
        defects.push('B8: Callout alert escaped');
      }

      if (/(\s&|\w&|&\w|&\s)/.test(originalContent) && !originalContent.includes('&amp;') && s1.includes('&amp;')) {
        defects.push('N1: Bare & converted to &amp;');
      }

      if (!isByteExact) {
        // Classify standard byte differences
        if (originalContent.includes('***') && s1.includes('---')) differences.push('HR normalized (*** -> ---)');
        if (originalContent.includes('_') && !s1.includes('_') && s1.includes('*')) differences.push('Italic normalized (_italic_ -> *italic*)');
        if (/https?:\/\/[^\s<>()]+/.test(originalContent) && s1.includes('[')) differences.push('Bare URL autolinked');
        if (originalContent.includes('<br>') || originalContent.includes('<br/>') || originalContent.includes('<br />')) differences.push('Linebreak normalized (<br> -> \\)');
        if (originalContent.includes('&amp;') || originalContent.includes('&copy;') || originalContent.includes('&#')) differences.push('HTML entity normalization');
        if (s1.trimEnd() + '\n' === originalContent || s1 === originalContent + '\n') differences.push('Trailing newline normalized');
        if (originalContent.includes('  \n') && s1.includes('\\\n')) differences.push('Trailing spaces break -> backslash');
        if (differences.length === 0) differences.push('Whitespace or formatting canonicalization');
      }
    }

    // Determine Group
    let group: 1 | 2 | 3 | 'CLEAN' = 'CLEAN';
    if (parseThrows || serializeThrows) {
      group = 1;
    } else if (isByteExact) {
      group = 'CLEAN';
    } else if (!isIdempotent) {
      group = 3;
    } else if (invDiff.codeBlocksMismatch || invDiff.tablesMismatch || invDiff.htmlMismatch || invDiff.frontmatterMismatch) {
      group = 1; // Severe data loss
    } else {
      group = 2; // Non-byte exact but semantically preserved
    }

    reports.push({
      filename,
      category,
      sourceDesc: '',
      originalBytes: Buffer.byteLength(originalContent, 'utf8'),
      s1Bytes: Buffer.byteLength(s1, 'utf8'),
      s2Bytes: Buffer.byteLength(s2, 'utf8'),
      s3Bytes: Buffer.byteLength(s3, 'utf8'),
      parseThrows,
      serializeThrows,
      error,
      isIdempotent,
      isByteExact,
      inventoryDiff: invDiff,
      group,
      differences,
      defects,
    });
  }

  return reports;
}

if (import.meta.url.endsWith(process.argv[1]?.replace(/\\/g, '/')) || process.argv[1]?.includes('corpus-report')) {
  const corpusDir = path.resolve(process.cwd(), 'tests/fixtures/markdown/corpus');
  const reports = runCorpusEvaluation(corpusDir);

  console.log('='.repeat(80));
  console.log(`WRITEFLOW CORPUS ROUNDTRIP EVALUATION REPORT (${reports.length} FILES)`);
  console.log('='.repeat(80));

  const categories = [
    { key: 'oss' as const, title: 'PHẦN A: 22 FILE TÀI LIỆU UPSTREAM OSS NGUYÊN BẢN' },
    { key: 'real' as const, title: 'PHẦN B: 9 FILE TÀI LIỆU THẬT NỘI BỘ REPO WRITEFLOW' },
    { key: 'synthetic' as const, title: 'PHẦN C: 31 FILE TỰ SOẠN & CA BIÊN KỸ THUẬT' },
  ];

  let cleanTotal = 0;
  let g2Total = 0;
  let g3Total = 0;
  let g1Total = 0;

  for (const cat of categories) {
    const list = reports.filter((r) => r.category === cat.key);
    console.log(`\n${cat.title} (${list.length} files)`);
    console.log('-'.repeat(80));

    for (const r of list) {
      const status =
        r.group === 'CLEAN'
          ? '✅ CLEAN'
          : r.group === 2
            ? '⚠️ GROUP 2 (Norm)'
            : r.group === 3
              ? '❌ GROUP 3 (Non-Idem)'
              : '🚨 GROUP 1 (Loss)';
      console.log(`[${status}] ${r.filename} | Orig: ${r.originalBytes}B -> S1: ${r.s1Bytes}B -> S2: ${r.s2Bytes}B | Idempotent: ${r.isIdempotent}`);
      if (r.defects.length > 0) {
        console.log(`    Defects: ${r.defects.join('; ')}`);
      }
      if (r.differences.length > 0) {
        console.log(`    Diffs: ${r.differences.join('; ')}`);
      }
      if (r.inventoryDiff.details.length > 0) {
        console.log(`    Inv: ${r.inventoryDiff.details.join('; ')}`);
      }
      if (r.error) {
        console.log(`    Error: ${r.error}`);
      }

      if (r.group === 'CLEAN') cleanTotal++;
      else if (r.group === 2) g2Total++;
      else if (r.group === 3) g3Total++;
      else if (r.group === 1) g1Total++;
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log(`TỔNG KẾT TOÀN DIỆN: ${reports.length} files | CLEAN: ${cleanTotal} | GROUP 2: ${g2Total} | GROUP 3: ${g3Total} | GROUP 1: ${g1Total}`);
  console.log('='.repeat(80));
}
