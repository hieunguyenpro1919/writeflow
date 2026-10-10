# WriteFlow API Reference

## Overview

The public API is exposed through the `writeflow` package. All functions
are typed and tree-shakeable.

## `createEditor(options)`

Creates a new editor instance bound to a DOM element.

### Parameters

| Name | Type | Required | Default | Description |
| --- | --- | :---: | --- | --- |
| `element` | `HTMLElement` | ✅ | — | The container element |
| `content` | `string` | ❌ | `""` | Initial Markdown content |
| `readOnly` | `boolean` | ❌ | `false` | Disable editing |
| `onChange` | `(md: string) => void` | ❌ | — | Called on every change |
| `onSave` | `(md: string) => void` | ❌ | — | Called on Ctrl+S |

### Returns

An `Editor` object with the following methods:

- `getMarkdown(): string` — serialize current state
- `setMarkdown(md: string): void` — replace content
- `focus(): void` — move cursor into the editor
- `destroy(): void` — clean up listeners and DOM

### Example

```typescript
import { createEditor } from "writeflow";

const editor = createEditor({
  element: document.getElementById("editor")!,
  content: "# Hello",
  onChange: (md) => console.log("changed:", md.length),
});

// Later
const md = editor.getMarkdown();
editor.destroy();
```

## `parseMarkdown(md)`

Parse a Markdown string into a ProseMirror document node.

**Throws** `MarkdownParseError` if the input is not a string.

```typescript
const doc = parseMarkdown("# Title\n\nBody.");
```

## `serializeMarkdown(doc)`

Serialize a ProseMirror document node back to Markdown.

```typescript
const md = serializeMarkdown(doc);
```

## Error codes

| Code | Meaning | Recovery |
| --- | --- | --- |
| `WF_PARSE_001` | Invalid input type | Pass a string |
| `WF_PARSE_002` | Unknown node type | Register handler or use raw block |
| `WF_SERIALIZE_001` | Missing markdown handler | Add handler for node type |
| `WF_IO_001` | File write failed | Retry or Save As |

## Changelog

- **1.0.0** — Initial release
- **1.0.1** — Fixed `onChange` throttle
- **1.1.0** — Added `readOnly` option
