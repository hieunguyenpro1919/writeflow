# GFM Tables

## Default alignment (left)

| Name | Age | City |
| --- | --- | --- |
| An | 25 | Hanoi |
| Binh | 30 | Da Nang |
| Cuong | 28 | Ho Chi Minh City |

## Explicit left / center / right

| Left | Center | Right |
| :--- | :---: | ---: |
| a | b | c |
| 100 | 200 | 300 |
| longer cell content | mid | short |

## Table with inline formatting

| Format | Example | Notes |
| --- | --- | --- |
| Bold | **bold text** | uses `**` |
| Italic | *italic text* | uses `*` |
| Code | `console.log()` | inline backticks |
| Link | [docs](./docs.md) | relative path |
| Strike | ~~removed~~ | uses `~~` |

## Table with empty cells

| Col A | Col B | Col C |
| --- | --- | --- |
| 1 |  | 3 |
|  | 2 |  |
| 4 | 5 | 6 |

## Single-column table

| Only column |
| --- |
| Row one |
| Row two |
| Row three |

## Escaped pipe inside cells

| Symbol | Meaning |
| --- | --- |
| `\|` | pipe character |
| `\\` | backslash |
| `*` | asterisk |
| `_` | underscore |

## Wide table with mixed content

| ID | Name | Description | Status | Priority | Owner |
| :---: | --- | --- | :---: | :---: | --- |
| 001 | Alpha | Initial release of the core module | ✅ | High | [An](./team/an.md) |
| 002 | Beta | Currently in **testing** phase | 🚧 | Medium | `binh@example.com` |
| 003 | Gamma | Not started, blocked by *dependency* | ⏳ | Low | [Cuong](./team/cuong.md) |
| 004 | Delta | Cancelled after review | ❌ | — | — |
