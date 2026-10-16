# UTF-8 with BOM

## About this file

This file begins with a UTF-8 Byte Order Mark (BOM):
three bytes `EF BB BF` at the very start, before the first `#`.

When WriteFlow opens this file, it must:

1. Detect the BOM.
2. Preserve it when saving.
3. Not display the BOM as a visible character.

## Content

Regular Markdown content follows.

- item one
- item two
- item three

## Vietnamese content

Tiếng Việt có dấu: nghiêng, thương, thuyền, nguyễn.

## Code
