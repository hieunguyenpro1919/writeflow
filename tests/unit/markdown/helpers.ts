import type { JSONContent } from '@tiptap/core';

/**
 * Checks if two mark arrays are deeply identical.
 */
function areMarksEqual(
  marks1?: JSONContent['marks'],
  marks2?: JSONContent['marks'],
): boolean {
  if (!marks1 && !marks2) return true;
  if (!marks1 || !marks2) return false;
  if (marks1.length !== marks2.length) return false;

  const sorted1 = [...marks1].sort((a, b) => a.type.localeCompare(b.type));
  const sorted2 = [...marks2].sort((a, b) => a.type.localeCompare(b.type));

  return JSON.stringify(sorted1) === JSON.stringify(sorted2);
}

/**
 * Clean up attributes: remove nulls and default values.
 */
function cleanAttrs(
  nodeType: string,
  attrs?: Record<string, unknown>,
): Record<string, unknown> | undefined {
  if (!attrs || typeof attrs !== 'object') return undefined;

  const cleaned: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(attrs)) {
    // Drop null and undefined
    if (val === null || val === undefined) continue;

    // Drop known default values
    if (nodeType === 'orderedList' && key === 'start' && val === 1) continue;
    if (nodeType === 'codeBlock' && key === 'language' && (val === null || val === '')) continue;
    if (key === 'title' && val === null) continue;
    if (key === 'isComment' && val === false) continue;
    if (key === 'inline' && val === false) continue;

    cleaned[key] = val;
  }

  if (Object.keys(cleaned).length === 0) return undefined;

  // Sort keys for deterministic serialization
  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(cleaned).sort()) {
    sorted[key] = cleaned[key];
  }
  return sorted;
}

/**
 * Clean up marks on inline nodes.
 */
function cleanMarks(marks?: JSONContent['marks'], nodeText?: string): JSONContent['marks'] | undefined {
  if (!marks || !Array.isArray(marks) || marks.length === 0) return undefined;

  const cleanedMarks = marks
    .filter((mark) => {
      // Normalize bare URLs autolinked by GFM where text matches href
      if (mark.type === 'link' && mark.attrs?.href && mark.attrs.href === nodeText) {
        return false;
      }
      return true;
    })
    .map((mark) => {
      const cleaned: Record<string, unknown> = { type: mark.type };
      if (mark.attrs) {
        const cleanedAttr = cleanAttrs(mark.type, mark.attrs as Record<string, unknown>);
        if (cleanedAttr) {
          cleaned.attrs = cleanedAttr;
        }
      }
      return cleaned as { type: string; attrs?: Record<string, unknown> };
    })
    .sort((a, b) => a.type.localeCompare(b.type));

  return cleanedMarks.length > 0 ? (cleanedMarks as JSONContent['marks']) : undefined;
}

/**
 * Normalizes a ProseMirror / Tiptap JSONContent tree:
 * 1. Treats content: [] as missing content.
 * 2. Omit null or default attributes (title: null, orderedList.start: 1, language: null, etc.).
 * 3. Merges contiguous text nodes with identical marks.
 * 4. Deterministic key order.
 */
export function normalizeTree(node: JSONContent): JSONContent {
  if (!node || typeof node !== 'object') return node;

  // Treat rawBlock reference_def and footnote as equivalent to plain text paragraph
  if (
    node.type === 'rawBlock' &&
    (node.attrs?.format === 'reference_def' || node.attrs?.format === 'footnote') &&
    typeof node.attrs?.content === 'string'
  ) {
    return {
      type: 'paragraph',
      content: [{ type: 'text', text: node.attrs.content }],
    };
  }

  const result: JSONContent = {
    type: node.type,
  };

  const cleanedAttrs = cleanAttrs(node.type ?? '', node.attrs);
  if (cleanedAttrs) {
    result.attrs = cleanedAttrs;
  }

  if (typeof node.text === 'string') {
    result.text = node.text;
  }

  const cleanedMarks = cleanMarks(node.marks, node.text);
  if (cleanedMarks) {
    result.marks = cleanedMarks;
  }

  if (Array.isArray(node.content) && node.content.length > 0) {
    const normalizedChildren: JSONContent[] = [];

    for (const child of node.content) {
      const normalizedChild = normalizeTree(child);
      if (!normalizedChild) continue;

      // Merge contiguous text nodes with identical marks
      const prev = normalizedChildren[normalizedChildren.length - 1];
      if (
        prev &&
        prev.type === 'text' &&
        normalizedChild.type === 'text' &&
        areMarksEqual(prev.marks, normalizedChild.marks)
      ) {
        prev.text = (prev.text || '') + (normalizedChild.text || '');
      } else {
        normalizedChildren.push(normalizedChild);
      }
    }

    if (normalizedChildren.length > 0) {
      result.content = normalizedChildren;
    }
  }

  return result;
}

/**
 * Helper to compare two JSONContent trees structurally (Task 2.4c).
 */
export function sameTree(a: JSONContent, b: JSONContent): boolean {
  const normA = normalizeTree(a);
  const normB = normalizeTree(b);
  return JSON.stringify(normA) === JSON.stringify(normB);
}
