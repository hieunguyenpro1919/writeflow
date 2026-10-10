# WriteFlow

A WYSIWYG Markdown editor built on Tiptap / ProseMirror.

## Features

- **Lossless round-trip**: your `.md` file stays yours
- **Vietnamese IME protection**: works with Unikey and EVKey
- **Simple by default**: no Markdown syntax required
- Open source under the MIT license

## Installation

```bash
npm install -g writeflow
```

## Usage

Run the editor from the command line:

```bash
writeflow open notes.md
writeflow --help
```

The `open` subcommand accepts relative or absolute paths. Use `--read-only`
to open a file without allowing edits.

## Documentation

See the [full documentation](https://writeflow.example.com/docs) for details
on configuration, themes, and extensions.

---

## License

MIT © 2026 WriteFlow Team
