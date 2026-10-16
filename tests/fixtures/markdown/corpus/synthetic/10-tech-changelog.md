# Changelog

All notable changes to this project are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Markdown engine skeleton with parser and serializer stubs
- Command Registry with 14 built-in commands
- Vietnamese IME protection layer

### Changed

- Moved from `npm` workspaces to single-package layout

### Fixed

- IME state no longer leaks across block boundaries

## [1.0.0] — 2026-09-15

### Added

- Initial public release
- WYSIWYG editor with bold, italic, strike, inline code
- Heading levels 1–3, bullet and ordered lists, blockquote
- Keyboard shortcuts for all formatting commands
- Status bar with word and character counts
- Vietnamese-aware word counter (handles diacritics)

### Fixed

- Crash when pressing Enter at end of nested list
- Undo stack corruption after paste from Word

### Security

- Restricted link protocols to `http`, `https`, `mailto`
- Blocked remote images by default

## [0.9.0] — 2026-09-01

### Added

- First internal preview
- Basic editor shell

## [0.1.0] — 2026-08-20

### Added

- Project bootstrap
- Repository structure
- CI pipeline with typecheck, lint, test
