import type { JSONContent } from '@tiptap/core';
import type { Node as ProsemirrorNode } from '@tiptap/pm/model';

/**
 * Metadata and YAML header extracted from a Markdown frontmatter block.
 * Corresponds to Plan 9.1 & 9.2 (preserved verbatim to prevent data loss).
 */
export interface FrontmatterData {
  /** Raw YAML content between delimiters, or full delimited block */
  raw: string;
  /** Parsed attributes / metadata key-value pairs (if YAML headers are present) */
  attributes?: Record<string, unknown>;
  /** Delimiter used (default: '---') */
  delimiter?: string;
}

/**
 * Options configuring the Markdown parser and serializer.
 */
export interface MarkdownOptions {
  /** Line ending format ('lf' | 'crlf' | 'auto'). Default: 'lf' */
  eol?: 'lf' | 'crlf' | 'auto';
  /** Whether to preserve UTF-8 BOM marker if detected in input. Default: false */
  preserveBOM?: boolean;
  /** Custom indentation style ('space' | 'tab') */
  indentStyle?: 'space' | 'tab';
  /** Custom indentation size */
  indentSize?: number;
}

/**
 * Result of parsing raw Markdown input.
 */
export interface MarkdownParseResult {
  /** The parsed document tree as Tiptap JSONContent */
  doc: JSONContent;
  /** ProseMirror Document Node instance */
  pmNode?: ProsemirrorNode;
  /** Extracted frontmatter metadata, if present in input */
  frontmatter?: FrontmatterData;
  /** The Markdown body content after stripping frontmatter */
  content: string;
  /** Detected line ending in the raw input */
  detectedEol?: 'lf' | 'crlf';
  /** Whether the source raw input had a UTF-8 BOM */
  hasBOM?: boolean;
}

/**
 * MarkdownParser converts raw Markdown strings into structured document representations.
 */
export interface MarkdownParser {
  /**
   * Parses raw Markdown into a MarkdownParseResult.
   * Isolates Frontmatter from Markdown body, preserving data safety (Plan 9.1/9.2).
   */
  parse(rawMarkdown: string, options?: MarkdownOptions): MarkdownParseResult;
}

/**
 * MarkdownSerializer converts document nodes or JSONContent into standardized Markdown strings.
 */
export interface MarkdownSerializer {
  /**
   * Serializes a document node or JSONContent tree to a Markdown string,
   * prepending frontmatter if provided.
   */
  serialize(
    doc: JSONContent | ProsemirrorNode,
    frontmatter?: FrontmatterData,
    options?: MarkdownOptions,
  ): string;
}
