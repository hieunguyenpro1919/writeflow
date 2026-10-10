# Getting Started with Jest

Jest is a delightful JavaScript Testing Framework with a focus on simplicity.

## Step-by-Step Guide

1. Install Jest using your package manager:

   ```bash
   npm install --save-dev jest
   ```

2. Write a test for a hypothetical function that adds two numbers:

   ```javascript
   function sum(a, b) {
     return a + b;
   }
   module.exports = sum;
   ```

3. Create a test file named `sum.test.js`:

   ```javascript
   const sum = require('./sum');

   test('adds 1 + 2 to equal 3', () => {
     expect(sum(1, 2)).toBe(3);
   });
   ```

4. Add the test script to your `package.json`:

   ```json
   {
     "scripts": {
       "test": "jest"
     }
   }
   ```

5. Finally, run your test suite:

   ```bash
   npm test
   ```

## Additional Configuration

> Note: Jest comes with zero-config defaults for most JavaScript projects.

## License

MIT License
