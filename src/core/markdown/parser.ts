import { MarkdownManager } from '@tiptap/markdown';
import { getSchema } from '@tiptap/core';
import type { Schema } from '@tiptap/pm/model';
import { createMarkdownEngineExtensions } from './extensions';
import type {
  FrontmatterData,
  MarkdownOptions,
  MarkdownParser,
  MarkdownParseResult,
} from './types';

/**
 * Regex matching YAML frontmatter:
 * - Multi-line standard YAML header: ^---\r?\n([\s\S]*?)\r?\n---\r?\n?
 * - Single-line YAML header (fallback/compact): ^---\s*([^\r\n]+?)\s*---\r?\n?
 */
const FRONTMATTER_REGEX = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?|^---\s*([^\r\n]+?)\s*---\r?\n?/;

/**
 * Lazily initialized MarkdownManager and ProseMirror Schema singleton.
 */
let sharedManager: MarkdownManager | null = null;
let sharedSchema: Schema | null = null;

export function getSharedMarkdownManager(): MarkdownManager {
  if (!sharedManager) {
    sharedManager = new MarkdownManager({
      extensions: createMarkdownEngineExtensions(),
      indentation: {
        style: 'space',
        size: 2,
      },
    });
  }
  return sharedManager;
}

export function getSharedMarkdownSchema(): Schema {
  if (!sharedSchema) {
    sharedSchema = getSchema(createMarkdownEngineExtensions());
  }
  return sharedSchema;
}

/**
 * Simple key-value parser for basic YAML frontmatter headers.
 * Preserves raw frontmatter text verbatim while providing structured attributes.
 */
export function parseYamlAttributes(yamlText: string): Record<string, unknown> {
  const attrs: Record<string, unknown> = {};
  const lines = yamlText.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const colonIndex = trimmed.indexOf(':');
    if (colonIndex > 0) {
      const key = trimmed.slice(0, colonIndex).trim();
      let val = trimmed.slice(colonIndex + 1).trim();

      // Strip surrounding single or double quotes
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }

      if (val === 'true') {
        attrs[key] = true;
      } else if (val === 'false') {
        attrs[key] = false;
      } else if (/^-?\d+(\.\d+)?$/.test(val)) {
        attrs[key] = Number(val);
      } else {
        attrs[key] = val;
      }
    }
  }

  return attrs;
}

export interface ExtractedFrontmatterResult {
  frontmatter?: FrontmatterData;
  body: string;
  hasBOM: boolean;
  detectedEol: 'lf' | 'crlf';
}

/**
 * Separates YAML frontmatter from Markdown body, protecting frontmatter
 * from being mangled or parsed as markdown formatting (Plan 9.1 & 9.2).
 */
export function extractFrontmatter(rawMarkdown: string): ExtractedFrontmatterResult {
  let text = rawMarkdown;
  let hasBOM = false;

  // Detect and strip UTF-8 BOM if present (Plan 9.6)
  if (text.charCodeAt(0) === 0xfeff) {
    hasBOM = true;
    text = text.slice(1);
  }

  // Detect EOL (Plan 9.6)
  const detectedEol: 'lf' | 'crlf' = text.includes('\r\n') ? 'crlf' : 'lf';

  const match = FRONTMATTER_REGEX.exec(text);
  if (!match) {
    return {
      body: text,
      hasBOM,
      detectedEol,
    };
  }

  const rawYaml = match[1] ?? match[2] ?? '';
  const body = text.slice(match[0].length);

  return {
    frontmatter: {
      raw: rawYaml.trim(),
      attributes: parseYamlAttributes(rawYaml),
      delimiter: '---',
    },
    body,
    hasBOM,
    detectedEol,
  };
}

/**
 * Main parse function: extracts frontmatter, parses Markdown body into Tiptap JSONContent
 * and ProseMirror Node tree.
 */
export function parse(rawMarkdown: string, options?: MarkdownOptions): MarkdownParseResult {
  const { frontmatter, body, hasBOM, detectedEol } = extractFrontmatter(rawMarkdown);
  const manager = getSharedMarkdownManager();
  const schema = getSharedMarkdownSchema();

  const finalEol = options?.eol && options.eol !== 'auto' ? options.eol : detectedEol;
  const finalBOM = options?.preserveBOM !== undefined ? options.preserveBOM && hasBOM : hasBOM;

  // Parse markdown body using schema-aware MarkdownManager
  const doc = manager.parse(body);

  // Convert to ProseMirror Node instance for roundtrip validation
  let pmNode;
  try {
    pmNode = schema.nodeFromJSON(doc);
  } catch {
    // If schema translation fails, keep pmNode undefined
    pmNode = undefined;
  }

  return {
    doc,
    pmNode,
    frontmatter,
    content: body,
    detectedEol: finalEol,
    hasBOM: finalBOM,
  };
}

export class DefaultMarkdownParser implements MarkdownParser {
  parse(rawMarkdown: string, options?: MarkdownOptions): MarkdownParseResult {
    return parse(rawMarkdown, options);
  }
}

export const markdownParser: MarkdownParser = new DefaultMarkdownParser();
