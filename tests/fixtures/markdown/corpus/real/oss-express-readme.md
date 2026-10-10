# Express

[![NPM Version](https://img.shields.io/npm/v/express.svg)](https://npmjs.org/package/express)
[![NPM Downloads](https://img.shields.io/npm/dm/express.svg)](https://npmjs.org/package/express)
[![Build Status](https://github.com/expressjs/express/workflows/ci/badge.svg)](https://github.com/expressjs/express/actions)

Fast, unopinionated, minimalist web framework for [Node.js](https://nodejs.org).

```js
const express = require('express')
const app = express()

app.get('/', function (req, res) {
  res.send('Hello World')
})

app.listen(3000)
```

## Installation

This is a Node.js module available through the npm registry. Installation is done using the `npm install` command:

```bash
$ npm install express
```

## Features

- Robust routing
- Focus on high performance
- Super-high test coverage
- HTTP helpers (redirection, caching, etc)
- View system supporting 14+ template engines
- Content negotiation
- Executable for generating applications quickly

## Philosophy

The Express philosophy is to provide small, robust tooling for HTTP servers, making it a great solution for single page applications, web sites, hybrids, or public HTTP APIs.

## License

[MIT](LICENSE)
