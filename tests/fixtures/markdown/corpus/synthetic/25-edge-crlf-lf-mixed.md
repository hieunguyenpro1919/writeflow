# Mixed Line Endings

This file uses both CRLF (Windows) and LF (Unix) line endings
interleaved, deliberately.

## Purpose

Test that the editor:

1. Detects the dominant or original line ending on open.
2. Preserves the original pattern on save.
3. Does not silently normalize everything to LF or CRLF.

## Content

Paragraph one.
Paragraph two.
Paragraph three.
Paragraph four.
Paragraph five.

## List

- item A
- item B
- item C

## Code
