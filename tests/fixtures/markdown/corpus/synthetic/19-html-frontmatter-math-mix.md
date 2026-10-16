---
title: "Mixed Advanced Syntax"
date: 2026-10-05
tags: [test, mixed, advanced]
math: true
footnotes: true
author: WriteFlow Team
---

# Mixed Advanced Syntax

This document combines **frontmatter**, **math**, **footnotes**,
**reference links**, and **raw HTML** in a single file.

## Math section

Inline math: $E = mc^2$.

Block math:

$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

## Footnote section

A claim that needs a source.[^source]

Another claim with more detail.[^detail]

[^source]: The source of the first claim.

[^detail]: A longer footnote that explains
    the second claim in more depth, spanning
    multiple lines.

## Reference links

See the [official docs][docs] for the API.

Visit [GitHub][gh] for the source code.

[docs]: https://example.com/docs
[gh]: https://github.com/example/writeflow

## Raw HTML section

<div class="callout">

**Bold text inside a div.**

- list item one
- list item two

</div>

Inline HTML: <kbd>Ctrl</kbd> + <kbd>B</kbd> toggles bold.

## Combined

A paragraph with $a^2 + b^2 = c^2$, a footnote[^combo], and
a [link][docs] all at once.

[^combo]: Combined footnote with math $\pi \approx 3.14$.

## Details block

<details>
<summary>Advanced content</summary>

Math inside details:

$$
\lim_{n \to \infty} \frac{1}{n} = 0
$$

And a footnote reference[^source] reused here.

</details>

## Closing

Regular paragraph to end the document.
