---
'@deepracticex/vitest-cucumber': patch
---

Fix setWorldConstructor API to support standard Cucumber.js class constructor pattern

This change addresses a critical compatibility issue where setWorldConstructor only accepted factory functions, breaking the standard Cucumber.js pattern of passing class constructors.

**What changed:**

- setWorldConstructor now accepts both class constructors (ES6 classes, ES5 constructor functions) and factory functions
- Added intelligent detection to distinguish between constructors and factories
- Class constructors are automatically wrapped into factory functions internally
- Exported WorldConstructor type for better TypeScript support

**Supported patterns:**

1. ES6 Class (Standard Cucumber.js) - NEW ✨

   ```typescript
   class CustomWorld {
     constructor() {
       this.value = 0;
     }
     increment() {
       this.value++;
     }
   }
   setWorldConstructor(CustomWorld);
   ```

2. ES5 Constructor Function - NEW ✨

   ```typescript
   function CustomWorld() {
     this.value = 0;
   }
   CustomWorld.prototype.increment = function () {
     this.value++;
   };
   setWorldConstructor(CustomWorld);
   ```

3. Arrow Function Factory (existing pattern, still supported)

   ```typescript
   setWorldConstructor(() => ({ value: 0 }));
   ```

4. Regular Function Factory (existing pattern, still supported)
   ```typescript
   setWorldConstructor(function () {
     return { value: 0 };
   });
   ```

**Benefits:**

- True Cucumber.js compatibility - can now migrate projects without rewriting World classes
- Better TypeScript support with proper class types and IDE autocompletion
- More reliable `this` binding with class methods
- Backward compatible - existing factory function code works unchanged

**Documentation:**

- Updated README with class-first examples
- Updated example project to demonstrate standard Cucumber.js pattern
- Added comprehensive test coverage for all supported patterns

Fixes #27
