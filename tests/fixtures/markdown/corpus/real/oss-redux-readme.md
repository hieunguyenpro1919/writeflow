# Redux

[![build status](https://img.shields.io/github/actions/workflow/status/reduxjs/redux/test.yaml?branch=master)](https://github.com/reduxjs/redux)
[![npm version](https://img.shields.io/npm/v/redux.svg)](https://www.npmjs.com/package/redux)

Redux is a predictable state container for JavaScript apps.

## Key Terminology

- Press <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>I</kbd> to inspect state in DevTools.
- Mathematical complexity: O(n<sup>2</sup>) for deep clone vs O(1) for shallow diff.
- Chemical representation: H<sub>2</sub>O is just an analogy for immutable states.
- <mark>Important highlight:</mark> Never mutate state directly in reducers.
- The acronym <abbr title="Application Programming Interface">API</abbr> is standard across all Redux toolkits.

## Basic Example

```javascript
import { createStore } from 'redux'

function counterReducer(state = { value: 0 }, action) {
  switch (action.type) {
    case 'counter/incremented':
      return { value: state.value + 1 }
    case 'counter/decremented':
      return { value: state.value - 1 }
    default:
      return state
  }
}

let store = createStore(counterReducer)
store.subscribe(() => console.log(store.getState()))
```

## License

MIT
