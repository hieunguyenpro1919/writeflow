import { MarkdownManager } from '@tiptap/markdown';
import { getSchema, type JSONContent } from '@tiptap/core';
import type { Schema } from '@tiptap/pm/model';
import { createMarkdownEngineExtensions } from './extensions';
import type {
  FrontmatterData,
  MarkdownOptions,
  MarkdownParser,
  MarkdownParseResult,
} from './types';

/**
 * Strict regex matching YAML frontmatter:
 * Requires opening '---' and closing '---' to each stand on their own lines at the beginning of the file.
 * Single-line matches (e.g. '--- text ---') are strictly eliminated.
 */
const STRICT_FRONTMATTER_REGEX = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/;

/**
 * Validates whether the content between opening and closing '---'
 * is authentic YAML frontmatter (contains valid key-value pairs and no prose lines).
 */
export function isValidYamlFrontmatter(content: string): boolean {
  const trimmed = content.trim();
  if (!trimmed) return false;

  const lines = trimmed.split(/\r?\n/);
  let hasKeyValue = false;

  for (const line of lines) {
    const lineTrimmed = line.trim();
    if (!lineTrimmed) continue;

    // YAML comment line
    if (lineTrimmed.startsWith('#')) continue;

    // Indented child line (nested mapping or list)
    if (/^\s+/.test(line)) continue;

    // YAML list item at root
    if (/^-\s+/.test(lineTrimmed)) continue;

    // Key-value pair at root: "key: value" or "key:"
    const kvMatch = /^[a-zA-Z0-9_.-]+:\s*(.*)$/.exec(lineTrimmed);
    if (kvMatch) {
      hasKeyValue = true;
      continue;
    }

    // Top-level unindented prose line -> Not valid YAML frontmatter!
    return false;
  }

  return hasKeyValue;
}

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

  const match = STRICT_FRONTMATTER_REGEX.exec(text);
  if (!match) {
    return {
      body: text,
      hasBOM,
      detectedEol,
    };
  }

  const rawYaml = match[1] ?? '';
  // Task 2.4: If content is not valid YAML structure (e.g. plain prose between rules), do not swallow as frontmatter
  if (!isValidYamlFrontmatter(rawYaml)) {
    return {
      body: text,
      hasBOM,
      detectedEol,
    };
  }

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
 * Encapsulates special block syntax (footnotes, reference links, math blocks)
 * into rawBlock nodes if they were parsed as simple paragraphs.
 */
function wrapSpecialBlocks(doc: JSONContent): JSONContent {
  if (!doc || !Array.isArray(doc.content)) return doc;

  const newContent = doc.content.map((node: JSONContent) => {
    if (
      node.type === 'paragraph' &&
      Array.isArray(node.content) &&
      node.content.length === 1 &&
      node.content[0].type === 'text' &&
      typeof node.content[0].text === 'string'
    ) {
      const text = node.content[0].text;

      // Footnote definition: [^id]: ...
      if (/^\[\^[^\]]+\]:\s*/.test(text)) {
        return {
          type: 'rawBlock',
          attrs: {
            content: text,
            format: 'footnote',
            inline: false,
          },
        };
      }

      // Reference link definition: [id]: ...
      if (/^\[[^\]]+\]:\s*(?:https?:\/\/|<|\/|\w)/.test(text)) {
        return {
          type: 'rawBlock',
          attrs: {
            content: text,
            format: 'reference_def',
            inline: false,
          },
        };
      }

      // Math block: $$ ... $$
      if (/^\$\$[\s\S]*\$\$$/.test(text.trim())) {
        return {
          type: 'rawBlock',
          attrs: {
            content: text.trim(),
            format: 'math',
            inline: false,
          },
        };
      }
    }
    return node;
  });

  return { ...doc, content: newContent };
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
  let doc = manager.parse(body);
  doc = wrapSpecialBlocks(doc);

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
