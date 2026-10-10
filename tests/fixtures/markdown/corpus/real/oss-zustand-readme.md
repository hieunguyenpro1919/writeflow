# Zustand

[![Build Status](https://img.shields.io/github/actions/workflow/status/pmndrs/zustand/lint-and-typecheck.yml?branch=main)](https://github.com/pmndrs/zustand/actions)
[![Version](https://img.shields.io/npm/v/zustand.svg)](https://www.npmjs.com/package/zustand)
[![Downloads](https://img.shields.io/npm/dm/zustand.svg)](https://www.npmjs.com/package/zustand)

A small, fast and scalable bearbones state-management solution using simplified flux principles. Has a comfy API based on hooks, isn't boilerplatey or opinionated.

## Installation

```bash
npm install zustand # or pnpm add zustand or yarn add zustand
```

## First create a store

Your store is a hook! You can put anything in it: primitives, objects, functions. State has to be updated immutably and the `set` function merges state to help it.

```tsx
import { create } from 'zustand'

interface BearState {
  bears: number
  increase: (by: number) => void
}

const useBearStore = create<BearState>()((set) => ({
  bears: 0,
  increase: (by) => set((state) => ({ bears: state.bears + by })),
}))
```

## Then bind your components, and that's it!

```tsx
function BearCounter() {
  const bears = useBearStore((state) => state.bears)
  return <h1>{bears} around here ...</h1>
}

function Controls() {
  const increase = useBearStore((state) => state.increase)
  return <button onClick={() => increase(1)}>one up</button>
}
```

## License

MIT License (c) 2019 Paul Henschel
