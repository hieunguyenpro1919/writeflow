---
title: "Building a Markdown Editor in 2026"
date: 2026-10-05
author: WriteFlow Team
tags: [editor, markdown, tauri]
description: A practical guide to building a WYSIWYG Markdown editor.
---

# Building a Markdown Editor in 2026

Markdown editors have been around for decades, but building one
that is both **simple for beginners** and **faithful to the
format** remains a hard problem.

## Why another editor?

Existing tools either sacrifice simplicity for power, or power
for simplicity. WriteFlow aims for both: an editor that a
non-technical user can open and use without ever typing `#`.

> "The best tool is the one that disappears while you use it."
> — Anonymous

## Core architecture

The editor is split into four layers:

1. **UI Layer** — React components
2. **Command Registry** — a single source of truth for actions
3. **Editor Engine** — Tiptap on ProseMirror
4. **File Service** — Tauri bindings for disk I/O

<figure>
  <img src="./assets/architecture.png" alt="WriteFlow architecture diagram" width="640">
  <figcaption>Figure 1: The four layers of WriteFlow.</figcaption>
</figure>

## A tricky case: round-trip fidelity

When you open a Markdown file, edit it, and save it back, every
byte matters. Consider this equation:

$$
f(x) = \sum_{n=0}^{\infty} \frac{x^n}{n!} = e^x
$$

The serializer must not touch it.

### What can go wrong

| Problem | Example | Fix |
| --- | --- | --- |
| Lost frontmatter | YAML at top | Preserve as raw block[^fm] |
| Broken tables | Nested pipes | Escape `\|` |
| Rewritten math | `$x$` → `\(x\)` | Keep delimiters |
| Stripped HTML | `<div>` removed | Preserve as raw block |

[^fm]: Frontmatter is preserved as an opaque block since it is
    not part of the ProseMirror schema.

## Code example

```typescript
export function roundTrip(md: string): string {
  const doc = parseMarkdown(md);
  return serializeMarkdown(doc);
}
