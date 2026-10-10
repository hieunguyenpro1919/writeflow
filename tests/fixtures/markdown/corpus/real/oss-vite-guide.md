# Vite: Next Generation Frontend Tooling

[![npm package](https://img.shields.io/npm/v/vite.svg)](https://www.npmjs.com/package/vite)
[![build](https://github.com/vitejs/vite/actions/workflows/ci.yml/badge.svg)](https://github.com/vitejs/vite/actions)

Vite (French word for "quick", pronounced `/vit/`, like "veet") is a build tool that aims to provide a faster and leaner development experience for modern web projects.

[![Vite Architecture Diagram](https://vite.dev/logo.svg)](https://vite.dev/)

## Overview

It consists of two major parts:

- A dev server that provides rich feature enhancements over native ES modules, for example extremely fast Hot Module Replacement (HMR).
- A build command that bundles your code with Rollup, pre-configured to output highly optimized static assets for production.

## Configuration Table

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `root` | `string` | `process.cwd()` | Project root directory |
| `base` | `string` | `'/'` | Base public path |
| `mode` | `string` | `'development'` | Environment mode |

## License

MIT License (c) 2019-present Evan You & Vite Contributors
