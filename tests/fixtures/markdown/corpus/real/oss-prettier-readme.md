# Prettier

[![Build Status](https://github.com/prettier/prettier/workflows/Dev/badge.svg)](https://github.com/prettier/prettier/actions)
[![codecov](https://codecov.io/gh/prettier/prettier/branch/main/graph/badge.svg)](https://codecov.io/gh/prettier/prettier)
[![npm version](https://badge.fury.io/js/prettier.svg)](https://badge.fury.io/js/prettier)

Prettier is an opinionated code formatter. It enforces a consistent style by parsing your code and re-printing it with its own rules that take the maximum line length into account, wrapping code when necessary.

### Input

```js
foo(reallyLongArg(), omgSoManyParameters(), INeedToMakeThisSmaller(),
    evenMoreArguments());
```

### Output

```js
foo(
  reallyLongArg(),
  omgSoManyParameters(),
  INeedToMakeThisSmaller(),
  evenMoreArguments(),
);
```

## Install

```bash
npm install --save-dev --save-exact prettier
```

## Table of Editors

| Editor | Plugin |
| :--- | :--- |
| VS Code | Prettier - Code formatter |
| Sublime Text | JsPrettier |
| Atom | prettier-atom |
| Vim | neoformat |

## License

MIT
