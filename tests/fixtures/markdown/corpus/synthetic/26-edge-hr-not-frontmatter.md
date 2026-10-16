---

This is not frontmatter, even though it starts with ---.

The two horizontal rules at the top of this file are delimiters that
happen to look like YAML frontmatter, but there is no key-value pair
between them. A correct parser must treat the first `---` as a
horizontal rule, not as the start of a YAML block.

---

## Section after the second HR

Regular content follows.

- item one
- item two

---

Another horizontal rule.

More content.

---

Final horizontal rule near the end.

End of file.