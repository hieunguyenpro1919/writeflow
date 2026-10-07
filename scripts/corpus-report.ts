import fs from 'node:fs';
import path from 'node:path';
import { marked, type Token, type Tokens } from 'marked';
import { parse } from '../src/core/markdown/parser';
import { serialize } from '../src/core/markdown/serializer';

export interface FileReport {
  filename: string;
  sourceDesc: string;
  originalBytes: number;
  s1Bytes: number;
  s2Bytes: number;
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
    details: string[];
  };
  group: 1 | 2 | 3 | 'CLEAN';
  differences: string[];
}

interface Inventory {
  words: string[];
  links: string[];
  images: string[];
  codeBlocks: string[];
  tables: string[];
  htmlBlocks: string[];
}

function extractInventory(md: string): Inventory {
  const tokens = marked.lexer(md);
  const inv: Inventory = {
    words: [],
    links: [],
    images: [],
    codeBlocks: [],
    tables: [],
    htmlBlocks: [],
  };

  function walk(tokenList: Tokens.Generic[] | Token[]) {
    for (const t of tokenList) {
      if (t.type === 'code') {
        inv.codeBlocks.push(`${t.lang || ''}:${t.text.trim()}`);
      } else if (t.type === 'table') {
        const header = (t as Tokens.Table).header.map((c) => c.text.trim()).join('|');
        const rows = (t as Tokens.Table).rows.map((r) => r.map((c) => c.text.trim()).join('|')).join(';');
        inv.tables.push(`${header}---${rows}`);
      } else if (t.type === 'html') {
        inv.htmlBlocks.push(t.text.trim());
      } else if (t.type === 'link') {
        inv.links.push((t as Tokens.Link).href);
      } else if (t.type === 'image') {
        const img = t as Tokens.Image;
        inv.images.push(`${img.href}|${img.text || ''}|${img.title || ''}`);
      }

      if ('text' in t && typeof t.text === 'string' && t.type !== 'code' && t.type !== 'html') {
        // Extract words (Vietnamese & Latin words)
        const words = t.text
          .replace(/[\\`*_[\]~#+\-><|]/g, ' ')
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

function compareInventories(inv1: Inventory, inv2: Inventory) {
  const details: string[] = [];

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
    details,
  };
}

export function runCorpusEvaluation(corpusDir: string): FileReport[] {
  const files = fs.readdirSync(corpusDir).filter((f) => f.endsWith('.md') && f !== 'SOURCES.md').sort();
  const reports: FileReport[] = [];

  for (const filename of files) {
    const filePath = path.join(corpusDir, filename);
    const rawBuffer = fs.readFileSync(filePath);
    const originalContent = rawBuffer.toString('utf8');

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
    let error: string | undefined;

    try {
      const parsed1 = parse(originalContent);
      s1 = serialize(parsed1.doc, parsed1.frontmatter, options);
      const parsed2 = parse(s1);
      s2 = serialize(parsed2.doc, parsed2.frontmatter, options);
    } catch (e: any) {
      parseThrows = true;
      serializeThrows = true;
      error = e.message || String(e);
    }

    const isIdempotent = s1 === s2 && !parseThrows;
    const isByteExact = s1 === originalContent && !parseThrows;

    let invDiff = {
      wordsMismatch: false,
      linksMismatch: false,
      imagesMismatch: false,
      codeBlocksMismatch: false,
      tablesMismatch: false,
      htmlMismatch: false,
      details: [] as string[],
    };

    const differences: string[] = [];

    if (!parseThrows) {
      try {
        const invOrig = extractInventory(originalContent);
        const invS1 = extractInventory(s1);
        invDiff = compareInventories(invOrig, invS1);
      } catch (e: any) {
        invDiff.details.push(`Inventory extraction error: ${e.message}`);
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
    } else if (invDiff.codeBlocksMismatch || invDiff.tablesMismatch || invDiff.htmlMismatch) {
      group = 1; // Severe data loss
    } else {
      group = 2; // Non-byte exact but semantically preserved
    }

    reports.push({
      filename,
      sourceDesc: '',
      originalBytes: Buffer.byteLength(originalContent, 'utf8'),
      s1Bytes: Buffer.byteLength(s1, 'utf8'),
      s2Bytes: Buffer.byteLength(s2, 'utf8'),
      parseThrows,
      serializeThrows,
      error,
      isIdempotent,
      isByteExact,
      inventoryDiff: invDiff,
      group,
      differences,
    });
  }

  return reports;
}

if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes('corpus-report')) {
  const corpusDir = path.resolve(process.cwd(), 'tests/fixtures/markdown/corpus');
  const reports = runCorpusEvaluation(corpusDir);

  console.log('='.repeat(80));
  console.log('WRITEFLOW CORPUS ROUNDTRIP EVALUATION REPORT (30 FILES)');
  console.log('='.repeat(80));

  let cleanCount = 0;
  let g1Count = 0;
  let g2Count = 0;
  let g3Count = 0;

  for (const r of reports) {
    const status = r.group === 'CLEAN' ? '✅ CLEAN' : r.group === 2 ? '⚠️ GROUP 2 (Norm)' : r.group === 3 ? '❌ GROUP 3 (Non-Idem)' : '🚨 GROUP 1 (Loss)';
    console.log(`[${status}] ${r.filename} | Orig: ${r.originalBytes}B -> S1: ${r.s1Bytes}B -> S2: ${r.s2Bytes}B | Idempotent: ${r.isIdempotent}`);
    if (r.differences.length > 0) {
      console.log(`    Diffs: ${r.differences.join('; ')}`);
    }
    if (r.inventoryDiff.details.length > 0) {
      console.log(`    Inv: ${r.inventoryDiff.details.join('; ')}`);
    }
    if (r.error) {
      console.log(`    Error: ${r.error}`);
    }

    if (r.group === 'CLEAN') cleanCount++;
    else if (r.group === 2) g2Count++;
    else if (r.group === 3) g3Count++;
    else if (r.group === 1) g1Count++;
  }

  console.log('-'.repeat(80));
  console.log(`TOTAL: ${reports.length} files | CLEAN (100% byte-match): ${cleanCount} | GROUP 2: ${g2Count} | GROUP 3: ${g3Count} | GROUP 1: ${g1Count}`);
  console.log('='.repeat(80));
}
