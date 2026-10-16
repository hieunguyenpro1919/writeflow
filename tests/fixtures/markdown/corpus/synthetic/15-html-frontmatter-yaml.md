---
title: "Complete Frontmatter Example"
description: A rich YAML frontmatter for testing round-trip.
author:
  name: Nguyễn Văn A
  email: a@example.com
  url: https://example.com/a
  affiliation: WriteFlow Team
date: 2026-10-05
lastmod: 2026-10-05T14:30:00+07:00
publishDate: 2026-10-01
expiryDate: 2027-10-01
draft: false
featured: true
weight: 100
toc: true
math: true
comments: false
layout: single
type: post
slug: complete-frontmatter-example
tags:
  - test
  - frontmatter
  - markdown
  - round-trip
categories:
  - technical
  - documentation
keywords:
  - writeflow
  - markdown
  - editor
aliases:
  - /old-path/
  - /legacy/path/
  - /another-alias/
series:
  - WriteFlow Internals
params:
  theme: dark
  sidebar: true
  search: true
  related:
    - doc-001
    - doc-002
    - doc-003
  custom:
    key1: value1
    key2: value2
    nested:
      deeper:
        deepest: true
        count: 42
numbers:
  integer: 42
  float: 3.14
  negative: -17
  zero: 0
  scientific: 1.5e10
booleans:
  yes: true
  no: false
quoted:
  single: 'single quoted'
  double: "double quoted"
  withColon: "value: with colon"
  withHash: "value # with hash"
multiline: |
  This is a literal block scalar.
  Newlines are preserved as-is.
  Third line here.
folded: >
  This is a folded block scalar.
  Newlines become spaces when parsed.
  Third line here.
nullValue: null
emptyValue:
arrayOfObjects:
  - name: first
    value: 1
  - name: second
    value: 2
  - name: third
    value: 3
---

# Content starts here

The frontmatter above must be preserved byte-for-byte.

## Section one

Regular Markdown content.

## Section two

More content.

- item a
- item b
- item c
