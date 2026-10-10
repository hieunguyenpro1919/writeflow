# Tutorial: Tic-Tac-Toe with React

This tutorial will guide you through building a small Tic-Tac-Toe game with React.

## Setup Instructions

Follow these numbered steps to get your environment configured:

1. Setup the project directory and package file:

   ```bash
   mkdir my-tic-tac-toe
   cd my-tic-tac-toe
   npm init -y
   ```

2. Install React and React-DOM:

   ```bash
   npm install react react-dom
   ```

3. Create the main application component:

   ```tsx
   import React, { useState } from 'react';

   export function Square({ value, onSquareClick }: { value: string; onSquareClick: () => void }) {
     return (
       <button className="square" onClick={onSquareClick}>
         {value}
       </button>
     );
   }
   ```

4. Verify your build:

   ```bash
   npm run build
   ```

## Key Concepts Learned

- React components are JavaScript functions returning JSX.
- State is preserved across re-renders using `useState`.
- Lifting state up allows sharing state between siblings.

## License

MIT License (c) Meta Platforms, Inc.
