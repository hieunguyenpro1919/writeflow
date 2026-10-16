# Extended Link and Image Attributes

## Anchor with target

<a href="https://example.com" target="_blank">Open in new tab</a>

## Anchor with rel

<a href="https://example.com" rel="noopener noreferrer">Safe external link</a>

## Anchor with multiple attributes

<a href="https://example.com/docs" target="_blank" rel="noopener" class="btn primary" title="Documentation">Documentation</a>

## Anchor to local file

<a href="./other.md">Local file</a>

<a href="#section-heading">Jump to section</a>

## Image with width and height

<img src="./assets/logo.png" alt="Logo" width="200" height="80">

## Image with style

<img src="./assets/banner.jpg" alt="Banner" style="border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">

## Image with loading and decoding

<img src="./assets/photo.jpg" alt="Photo" loading="lazy" decoding="async">

## Image with srcset

<img src="./assets/small.jpg" srcset="./assets/small.jpg 1x, ./assets/large.jpg 2x" alt="Responsive">

## Image wrapped in anchor

<a href="https://example.com" target="_blank">
  <img src="./assets/clickable.png" alt="Click me" width="120" height="40">
</a>

## Figure with figcaption

<figure>
  <img src="./assets/diagram.png" alt="Architecture diagram" width="600">
  <figcaption>Figure 1: WriteFlow architecture</figcaption>
</figure>

## Markdown-style image with title

![Alt text](./assets/md-image.png "Title text")

## Markdown-style link with title

[Markdown link](./file.md "Link title")

## Long attribute values

<a href="https://example.com/very/long/path/that/keeps/going/and/going?query=value&other=value2&third=value3" target="_blank" rel="noopener noreferrer nofollow" class="external-link styled-link" data-track="click" data-category="documentation">A link with many attributes</a>
