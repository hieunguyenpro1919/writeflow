# Code Blocks Across Languages

## TypeScript

```typescript
interface CommandDef {
  id: string;
  labelKey: string;
  category: "format" | "block" | "insert" | "file";
  run(ctx: CommandContext, args?: unknown): boolean;
  isEnabled?(ctx: CommandContext): boolean;
  isActive?(ctx: CommandContext): boolean;
}

export function registerCommand(def: CommandDef): void {
  if (registry.has(def.id)) {
    throw new Error(`Duplicate command id: ${def.id}`);
  }
  registry.set(def.id, def);
}
```

## Python

```python
from dataclasses import dataclass
from typing import Optional

@dataclass
class Document:
    path: Optional[str] = None
    content: str = ""
    dirty: bool = False

    def mark_dirty(self) -> None:
        self.dirty = True

    def save(self, new_content: str) -> None:
        self.content = new_content
        self.dirty = False
```

## Bash

```bash
#!/usr/bin/env bash
set -euo pipefail

TARGET_DIR="${1:-.}"
if [[ ! -d "$TARGET_DIR" ]]; then
  echo "Error: directory not found: $TARGET_DIR" >&2
  exit 1
fi

find "$TARGET_DIR" -type f -name '*.md' -print0 \
  | xargs -0 -n1 -I{} sh -c 'echo "Processing: {}"'
```

## JSON

```json
{
  "name": "writeflow",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "test": "vitest run"
  },
  "dependencies": {
    "@tiptap/core": "3.0.0",
    "@tiptap/starter-kit": "3.0.0",
    "react": "18.3.0"
  }
}
```

## SQL

```sql
SELECT
  d.id,
  d.title,
  COUNT(c.id) AS comment_count
FROM documents d
LEFT JOIN comments c ON c.document_id = d.id
WHERE d.created_at >= '2026-01-01'
GROUP BY d.id, d.title
HAVING COUNT(c.id) > 5
ORDER BY comment_count DESC
LIMIT 20;
```

## Rust

```rust
#[derive(Debug, Clone)]
pub struct Settings {
    pub language: String,
    pub font_size: u16,
    pub autosave: bool,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            language: "vi".to_string(),
            font_size: 16,
            autosave: false,
        }
    }
}
```

## Code block without a language tag

```
plain text content
no syntax highlighting
multiple lines
    with indentation preserved
```

## Code block with special characters

```text
Symbols: * _ # > [ ] ` | \ < > & " '
Quotes: 'single' "double" `backtick`
Vietnamese: xin chào, nghiêng, thương
Emoji: 🎉 ✨ 🚀
```
