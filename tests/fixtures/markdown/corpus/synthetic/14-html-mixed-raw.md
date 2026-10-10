# Mixed Raw HTML and Markdown

## Intro paragraph

Regular Markdown paragraph before any HTML.

## Block with HTML inside

<div class="note">

**Markdown bold inside a div.**

- list item one
- list item two

</div>

## Markdown between HTML blocks

<div class="first">
First HTML block.
</div>

A regular paragraph of Markdown sits between two HTML blocks.

<div class="second">
Second HTML block.
</div>

## HTML comment between blocks

Paragraph before comment.

<!-- interleaved comment -->

Paragraph after comment.

## Inline HTML inside Markdown paragraph

This paragraph has <span class="highlight">inline span</span> and
<kbd>Ctrl</kbd> keys and <code>code()</code> all together.

## Markdown list with inline HTML

- Item with <strong>strong</strong> inside
- Item with <em>emphasis</em> inside
  - Nested with <mark>mark</mark>
  - Nested with <code>code</code>
- Item with <a href="./link.md">link</a>

## Table mixing Markdown and HTML

| Markdown | HTML |
| --- | --- |
| **bold** | <b>bold</b> |
| *italic* | <i>italic</i> |
| `code` | <code>code</code> |

## Details block with Markdown inside

<details>
<summary>Expand me</summary>

### Heading inside details

Content with **bold** and a [link](./file.md).

```python
def hello():
    return "world"
