import type { Node as ProseMirrorNode } from '@tiptap/pm/model';

export interface DocumentStats {
  words: number;
  chars: number;
}

/**
 * Extracts plain text from a ProseMirror document node using '\n' as block separator
 * and ' ' as leaf separator to prevent words in adjacent blocks from concatenating.
 */
export function getDocumentText(doc: ProseMirrorNode): string {
  if (!doc || doc.content.size === 0) {
    return '';
  }
  return doc.textBetween(0, doc.content.size, '\n', ' ');
}

/**
 * Computes word and character count from text.
 *
 * NOTE ON VIETNAMESE TYPOGRAPHY:
 * Words are calculated as non-empty sequences of characters separated by whitespace (\\s+).
 * For Vietnamese text, this counts syllables (âm tiết), which is the universally accepted
 * standard in word processors (Word, Google Docs, VS Code), not grammatical compound words.
 *
 * Character count is based on Unicode characters (code points), not raw byte lengths.
 */
export function countWordsAndChars(text: string): DocumentStats {
  const trimmed = text.trim();
  if (!trimmed) {
    return { words: 0, chars: 0 };
  }

  // Count words separated by whitespace
  const words = trimmed.split(/\s+/).filter(Boolean).length;

  // Count Unicode code points (handles accents and multi-byte characters accurately)
  const chars = Array.from(text).length;

  return { words, chars };
}

/**
 * Convenience helper to count stats directly from a ProseMirror document node.
 */
export function countDocStats(doc: ProseMirrorNode): DocumentStats {
  const text = getDocumentText(doc);
  return countWordsAndChars(text);
}
