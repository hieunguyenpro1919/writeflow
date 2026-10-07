# HTML Block Elements

## Plain div

<div>
  This is a paragraph inside a plain div.
</div>

## Div with attributes

<div class="callout warning" data-level="high" role="alert">
  <strong>Warning:</strong> This block uses attributes.
</div>

## Nested divs

<div class="outer">
  <div class="middle">
    <div class="inner">
      Deeply nested block content.
    </div>
  </div>
</div>

## Details and summary

<details>
<summary>Click to expand</summary>

Hidden content. Regular Markdown inside an HTML block may or may not
be parsed, depending on the implementation.

- item one
- item two

</details>

<details open>
<summary>Already open by default</summary>
Always visible until collapsed.
</details>

## HTML table with attributes

<table border="1" cellpadding="8" cellspacing="0">
  <thead>
    <tr>
      <th scope="col">Column A</th>
      <th scope="col">Column B</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>value 1</td>
      <td>value 2</td>
    </tr>
    <tr>
      <td>value 3</td>
      <td>value 4</td>
    </tr>
  </tbody>
</table>

## HTML comment

<!-- This comment must be preserved verbatim -->

Regular paragraph after the comment.

## Multi-line comment spanning several lines

<!--
  Block comment
  spanning multiple lines
  with indentation
-->

## Section with id

<section id="intro" class="chapter">
  <h2>Introduction</h2>
  <p>Content inside a section element.</p>
</section>

## After all blocks

Back to plain Markdown.
