import type { JSONContent } from '@tiptap/core';
import type { Node as ProsemirrorNode } from '@tiptap/pm/model';
import { getSharedMarkdownManager } from './parser';
import type { FrontmatterData, MarkdownOptions, MarkdownSerializer } from './types';

/**
 * Checks whether the given document object is a ProseMirror Node.
 */
function isProseMirrorNode(doc: JSONContent | ProsemirrorNode): doc is ProsemirrorNode {
  return typeof (doc as ProsemirrorNode).toJSON === 'function';
}

/**
 * Serializes a document representation (JSONContent or ProseMirror Node) into standardized Markdown.
 * Prepend frontmatter header if provided, ensuring zero data loss (Plan 9.1 & 9.2).
 */
export function serialize(
  doc: JSONContent | ProsemirrorNode,
  frontmatter?: FrontmatterData,
  options?: MarkdownOptions,
): string {
  const jsonContent: JSONContent = isProseMirrorNode(doc) ? doc.toJSON() : doc;
  const manager = getSharedMarkdownManager();

  // 1. Serialize document body
  const bodyMarkdown = manager.serialize(jsonContent);

  // 2. Format frontmatter header if present
  let header = '';
  if (frontmatter) {
    const delimiter = frontmatter.delimiter ?? '---';
    if (frontmatter.raw && frontmatter.raw.trim().length > 0) {
      const trimmedRaw = frontmatter.raw.trim();
      if (trimmedRaw.startsWith(delimiter) && trimmedRaw.endsWith(delimiter)) {
        header = `${trimmedRaw}\n\n`;
      } else {
        header = `${delimiter}\n${trimmedRaw}\n${delimiter}\n\n`;
      }
    } else if (frontmatter.attributes && Object.keys(frontmatter.attributes).length > 0) {
      const lines = Object.entries(frontmatter.attributes).map(([key, val]) => `${key}: ${val}`);
      header = `${delimiter}\n${lines.join('\n')}\n${delimiter}\n\n`;
    }
  }

  // 3. Combine header and body
  let result = (header + bodyMarkdown).trimEnd();

  // Plan 9.3: File ends with exactly one newline
  result = result.length > 0 ? `${result}\n` : '';

  // 4. Line ending normalization (Plan 9.6)
  const targetEol = options?.eol;
  if (targetEol === 'crlf') {
    result = result.replace(/\r?\n/g, '\r\n');
  } else if (targetEol === 'lf') {
    result = result.replace(/\r\n/g, '\n');
  }

  // 5. BOM preservation (Plan 9.6)
  if (options?.preserveBOM) {
    result = `\ufeff${result}`;
  }

  return result;
}

export class DefaultMarkdownSerializer implements MarkdownSerializer {
  serialize(
    doc: JSONContent | ProsemirrorNode,
    frontmatter?: FrontmatterData,
    options?: MarkdownOptions,
  ): string {
    return serialize(doc, frontmatter, options);
  }
}

export const markdownSerializer: MarkdownSerializer = new DefaultMarkdownSerializer();
