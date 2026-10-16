import { describe, it, expect, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { Editor } from '@tiptap/core';
import { createExtensions } from '../../src/core/editor/extensions';
import { coreCommands } from '../../src/core/commands/definitions';
import viLocale from '../../src/i18n/locales/vi.json';
import enLocale from '../../src/i18n/locales/en.json';

const SRC_ROOT = path.resolve(__dirname, '../../src');

/** Recursively collect all files under a directory matching extensions */
function getFiles(dir: string, extensions: string[]): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      results = results.concat(getFiles(filePath, extensions));
    } else if (extensions.some((ext) => file.endsWith(ext))) {
      results.push(filePath);
    }
  }
  return results;
}

/** Recursively flattens nested object keys into dot-separated paths */
export function flattenKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  let keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      keys = keys.concat(flattenKeys(v as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

export interface GuardViolation {
  file: string;
  line: number;
  snippet: string;
  rule: string;
}

/**
 * Scans content for hardcoded color values:
 * - In CSS: hex colors in property values, rgb(), rgba(), hsl(), hsla()
 * - In TS/TSX: hex colors in string literals, rgb(), rgba(), hsl(), hsla()
 */
export function checkHardcodedColors(filePath: string, content: string): GuardViolation[] {
  const violations: GuardViolation[] = [];
  const lines = content.split('\n');
  const isCss = filePath.endsWith('.css');

  // Regex patterns:
  // Hex color: # followed by 3, 4, 6, or 8 hex digits, bounded
  // rgb/rgba/hsl/hsla functions
  const hexPattern = /#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})\b/;
  const funcPattern = /\b(rgba?|hsla?)\s*\(/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // Skip single-line comments in CSS or TS
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
      continue;
    }

    if (isCss) {
      // In CSS, exclude selector IDs like #shortcuts-dialog-title {
      // A hex color appears after a property colon or in a value
      const colonIdx = line.indexOf(':');
      if (colonIdx !== -1) {
        const valuePart = line.substring(colonIdx + 1);
        if (hexPattern.test(valuePart) || funcPattern.test(valuePart)) {
          violations.push({
            file: filePath,
            line: lineNum,
            snippet: trimmed,
            rule: 'No hardcoded color in CSS outside variables.css (use var(--editor-*))',
          });
        }
      }
    } else {
      // In TS/TSX, check for string literals containing colors
      // e.g. '#fff', "#ffffff", 'rgb(...)', 'rgba(...)'
      const stringLiteralPattern = /['"`](#[0-9a-fA-F]{3,8}|rgba?\([^'"`]+\)|hsla?\([^'"`]+\))['"`]/;
      if (stringLiteralPattern.test(line)) {
        violations.push({
          file: filePath,
          line: lineNum,
          snippet: trimmed,
          rule: 'No hardcoded color in TS/TSX (use CSS variables)',
        });
      }
    }
  }

  return violations;
}

/**
 * Checks for hardcoded shortcut strings ("Mod-...") outside allowed directories:
 * - src/core/commands/definitions/
 * - src/core/keymap/
 */
export function checkHardcodedShortcuts(filePath: string, content: string): GuardViolation[] {
  const normalizedPath = filePath.replace(/\\/g, '/');
  if (
    normalizedPath.includes('src/core/commands/definitions/') ||
    normalizedPath.includes('src/core/keymap/')
  ) {
    return [];
  }

  const violations: GuardViolation[] = [];
  const lines = content.split('\n');
  const modPattern = /['"`]Mod-[^'"`]+['"`]/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
      continue;
    }

    if (modPattern.test(line)) {
      violations.push({
        file: filePath,
        line: i + 1,
        snippet: trimmed,
        rule: "No hardcoded shortcut ('Mod-...') outside commands/definitions or keymap",
      });
    }
  }

  return violations;
}

/**
 * Checks that UI components in src/components/ do NOT call formatting commands directly:
 * e.g. .toggleBold(), .toggleItalic(), .toggleHeading(), .toggleBulletList(), etc.
 */
export function checkDirectFormattingCalls(filePath: string, content: string): GuardViolation[] {
  const normalizedPath = filePath.replace(/\\/g, '/');
  if (!normalizedPath.includes('src/components/')) {
    return [];
  }

  const forbiddenCalls = [
    /\.toggleBold\s*\(/,
    /\.toggleItalic\s*\(/,
    /\.toggleStrike\s*\(/,
    /\.toggleCode\s*\(/,
    /\.toggleHeading\s*\(/,
    /\.toggleBulletList\s*\(/,
    /\.toggleOrderedList\s*\(/,
    /\.toggleBlockquote\s*\(/,
    /\.setParagraph\s*\(/,
  ];

  const violations: GuardViolation[] = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
      continue;
    }

    for (const pattern of forbiddenCalls) {
      if (pattern.test(line)) {
        violations.push({
          file: filePath,
          line: i + 1,
          snippet: trimmed,
          rule: 'Direct formatting call forbidden in UI component (must use registry.run)',
        });
        break;
      }
    }
  }

  return violations;
}

describe('Task 1.13: Guard Tests & i18n Parity', () => {
  describe('1. Color Guard (AGENTS.md rule 5 & Plan Appendix C.1)', () => {
    it('passes for all src/**/*.{ts,tsx,css} files except variables.css', () => {
      const allFiles = getFiles(SRC_ROOT, ['.ts', '.tsx', '.css']);
      const violations: GuardViolation[] = [];

      for (const file of allFiles) {
        // variables.css is the ONLY authorized file for color definitions
        if (file.replace(/\\/g, '/').endsWith('/src/styles/variables.css')) {
          continue;
        }

        const content = fs.readFileSync(file, 'utf8');
        const fileViolations = checkHardcodedColors(file, content);
        violations.push(...fileViolations);
      }

      if (violations.length > 0) {
        const errorMsg = violations
          .map((v) => `[${v.rule}] ${v.file}:${v.line} -> "${v.snippet}"`)
          .join('\n');
        expect.fail(`Found ${violations.length} hardcoded color violations:\n${errorMsg}`);
      }

      expect(violations).toHaveLength(0);
    });

    it('intentionally detects hardcoded colors in CSS and TS snippets (DoD test)', () => {
      const cssSnippet = `
        .my-box {
          background-color: #ff0000;
          color: rgba(0, 0, 0, 0.8);
        }
      `;
      const cssViolations = checkHardcodedColors('src/components/Test.css', cssSnippet);
      expect(cssViolations.length).toBe(2);
      expect(cssViolations[0].line).toBe(3);
      expect(cssViolations[1].line).toBe(4);

      const tsSnippet = `
        export const red = '#f43f5e';
      `;
      const tsViolations = checkHardcodedColors('src/components/Test.tsx', tsSnippet);
      expect(tsViolations.length).toBe(1);
      expect(tsViolations[0].line).toBe(2);
    });
  });

  describe('2. Shortcuts Guard (Task 1.13 item 1 & AGENTS.md)', () => {
    it('ensures "Mod-..." only appears in commands/definitions/ and keymap/', () => {
      const allFiles = getFiles(SRC_ROOT, ['.ts', '.tsx']);
      const violations: GuardViolation[] = [];

      for (const file of allFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const fileViolations = checkHardcodedShortcuts(file, content);
        violations.push(...fileViolations);
      }

      if (violations.length > 0) {
        const errorMsg = violations
          .map((v) => `[${v.rule}] ${v.file}:${v.line} -> "${v.snippet}"`)
          .join('\n');
        expect.fail(`Found ${violations.length} hardcoded shortcut violations:\n${errorMsg}`);
      }

      expect(violations).toHaveLength(0);
    });

    it('intentionally detects unauthorized "Mod-..." in other files (DoD test)', () => {
      const snippet = `
        export const shortcut = 'Mod-b';
      `;
      const violations = checkHardcodedShortcuts('src/components/Toolbar.tsx', snippet);
      expect(violations.length).toBe(1);
      expect(violations[0].line).toBe(2);
      expect(violations[0].rule).toContain('No hardcoded shortcut');
    });
  });

  describe('3. UI Formatting Guard (AGENTS.md rule 4)', () => {
    it('ensures no UI component in src/components/ calls formatting methods directly', () => {
      const componentFiles = getFiles(path.join(SRC_ROOT, 'components'), ['.ts', '.tsx']);
      const violations: GuardViolation[] = [];

      for (const file of componentFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const fileViolations = checkDirectFormattingCalls(file, content);
        violations.push(...fileViolations);
      }

      if (violations.length > 0) {
        const errorMsg = violations
          .map((v) => `[${v.rule}] ${v.file}:${v.line} -> "${v.snippet}"`)
          .join('\n');
        expect.fail(`Found ${violations.length} direct formatting call violations:\n${errorMsg}`);
      }

      expect(violations).toHaveLength(0);
    });

    it('intentionally flags direct formatting calls in components (DoD test)', () => {
      const snippet = `
        function onBoldClick(editor) {
          editor.chain().focus().toggleBold().run();
        }
      `;
      const violations = checkDirectFormattingCalls('src/components/Toolbar.tsx', snippet);
      expect(violations.length).toBe(1);
      expect(violations[0].line).toBe(3);
      expect(violations[0].rule).toContain('Direct formatting call forbidden');
    });
  });

  describe('4. i18n Parity Guard (Task 1.13 item 4 & Appendix B)', () => {
    it('has identical keys in vi.json and en.json', () => {
      const viKeys = flattenKeys(viLocale).sort();
      const enKeys = flattenKeys(enLocale).sort();

      const missingInEn = viKeys.filter((k) => !enKeys.includes(k));
      const missingInVi = enKeys.filter((k) => !viKeys.includes(k));

      expect(missingInEn).toEqual([]);
      expect(missingInVi).toEqual([]);
      expect(viKeys).toEqual(enKeys);
    });

    it('contains all labelKey entries for registered core commands', () => {
      const viKeys = flattenKeys(viLocale);
      const enKeys = flattenKeys(enLocale);

      for (const cmd of coreCommands) {
        expect(viKeys, `Missing labelKey "${cmd.labelKey}" in vi.json`).toContain(cmd.labelKey);
        expect(enKeys, `Missing labelKey "${cmd.labelKey}" in en.json`).toContain(cmd.labelKey);

        const categoryKey = `category.${cmd.category}`;
        expect(viKeys, `Missing categoryKey "${categoryKey}" in vi.json`).toContain(categoryKey);
        expect(enKeys, `Missing categoryKey "${categoryKey}" in en.json`).toContain(categoryKey);
      }
    });

    it('intentionally detects key parity mismatch (DoD test)', () => {
      const viMock = { app: { name: 'WriteFlow', extra: 'Vi only' } };
      const enMock = { app: { name: 'WriteFlow' } };

      const viKeys = flattenKeys(viMock);
      const enKeys = flattenKeys(enMock);

      const missingInEn = viKeys.filter((k) => !enKeys.includes(k));
      expect(missingInEn).toEqual(['app.extra']);
    });
  });

  describe('5. Schema Guard (Task 1.13 item 5 & Plan 4.3 / Phase 2 Sync)', () => {
    it('ensures forbidden marks and nodes are NOT in the schema and Phase 2 schema is synced', () => {
      const editor = new Editor({
        extensions: createExtensions(),
      });

      try {
        const schema = editor.schema;

        // Forbidden marks (Underline strictly forbidden in CommonMark / WriteFlow)
        expect(schema.marks.underline, 'underline mark must not exist in schema').toBeUndefined();

        // Forbidden nodes (trailingNode disabled to prevent auto empty paragraphs)
        expect(schema.nodes.trailingNode, 'trailingNode must not exist in schema').toBeUndefined();

        // Allowed Phase 2 marks
        expect(schema.marks.bold).toBeDefined();
        expect(schema.marks.italic).toBeDefined();
        expect(schema.marks.strike).toBeDefined();
        expect(schema.marks.code).toBeDefined();
        expect(schema.marks.link).toBeDefined();
        expect(schema.marks.rawInline).toBeDefined();

        // Allowed Phase 2 synchronized nodes
        expect(schema.nodes.heading).toBeDefined();
        expect(schema.nodes.bulletList).toBeDefined();
        expect(schema.nodes.orderedList).toBeDefined();
        expect(schema.nodes.blockquote).toBeDefined();
        expect(schema.nodes.paragraph).toBeDefined();
        expect(schema.nodes.codeBlock).toBeDefined();
        expect(schema.nodes.horizontalRule).toBeDefined();
        expect(schema.nodes.taskList).toBeDefined();
        expect(schema.nodes.taskItem).toBeDefined();
        expect(schema.nodes.image).toBeDefined();
        expect(schema.nodes.rawBlock).toBeDefined();
      } finally {
        editor.destroy();
      }
    });
  });

  describe('6. Tiptap Default Shortcuts Disabled Guard (Task 1.13 item 6)', () => {
    it('ensures Mod-u is intercepted and triggers unsupported format notification', () => {
      const notifySpy = vi.fn();
      const mockUi = {
        openShortcutsDialog: vi.fn(),
        notify: notifySpy,
      };
      const editor = new Editor({
        extensions: createExtensions({ ui: mockUi, platform: 'win' }),
        content: '<p>Test text</p>',
      });

      try {
        editor.commands.setTextSelection({ from: 1, to: 5 });
        const event = new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          key: 'u',
          ctrlKey: true,
        });
        editor.view.dom.dispatchEvent(event);

        expect(notifySpy).toHaveBeenCalledWith('hint.unsupportedFormat');
      } finally {
        editor.destroy();
      }
    });

    it('ensures Mod-Shift-s does not toggle strikethrough (removed in favor of Mod-Shift-x)', () => {
      const editor = new Editor({
        extensions: createExtensions({ platform: 'win' }),
        content: '<p>Test strike text</p>',
      });

      try {
        editor.commands.setTextSelection({ from: 1, to: 5 });
        const event = new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          key: 's',
          ctrlKey: true,
          shiftKey: true,
        });
        editor.view.dom.dispatchEvent(event);

        expect(editor.isActive('strike')).toBe(false);
      } finally {
        editor.destroy();
      }
    });
  });
});

