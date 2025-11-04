# @deepracticex/vitest-cucumber

## 1.4.0

### Patch Changes

- 2722654: feat: add flexible support directory configuration with intelligent auto-discovery

  This enhancement makes support directory configuration much more flexible and user-friendly.

  **New `support` Configuration Option**

  Added optional `support` parameter to plugin configuration:

  ```typescript
  vitestCucumber({
    steps: 'tests/steps',
    support: 'tests/support', // Single directory
    // OR
    support: ['tests/support', 'src/fixtures'], // Multiple directories
  });
  ```

  **Intelligent Auto-Discovery**

  When `support` is not specified, the plugin now intelligently discovers support files:
  1. **Smart sibling detection** - Automatically finds support directory next to steps:
     - `steps='tests/bdd/steps'` → checks `tests/bdd/support`
     - `steps='tests/e2e/steps'` → checks `tests/e2e/support`
     - `steps='src/test/steps'` → checks `src/test/support`
  2. **Enhanced fallback locations**:
     - `tests/e2e/support/**/*.ts` (existing)
     - `tests/support/**/*.ts` (new)
     - `tests/bdd/support/**/*.ts` (new)
     - `${steps}/support/**/*.ts` (existing)

  **Benefits**
  - Works with any directory structure out of the box
  - No configuration needed for standard layouts
  - Explicit configuration available when needed
  - Supports multiple support directories
  - Backward compatible - existing projects work unchanged

  **Documentation Updates**
  - Updated README with clear examples of auto-discovery
  - Added configuration examples for explicit setup
  - Explained loading order guarantees

  **Test Coverage**
  - Added comprehensive test suite (9 tests)
  - Tests auto-discovery scenarios
  - Tests explicit configuration
  - Tests loading order and de-duplication

- Updated dependencies [2722654]
  - @deepracticex/vitest-cucumber-plugin@1.4.0

## 1.3.1

### Patch Changes

- 9c93445: Fix setWorldConstructor API to support standard Cucumber.js class constructor pattern

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
  - @deepracticex/vitest-cucumber-plugin@1.3.1

## 1.3.0

### Minor Changes

- 8a06efb: Add support directory auto-loading (Cucumber.js compatible)

  Support files in `support/` directories are now automatically loaded before step definitions, ensuring hooks and world setup are available when steps execute. This resolves the issue where hooks defined in support files were not registered before step definitions.

  **Key Features:**
  - Automatically detects and prioritizes `**/support/**/*.ts` files
  - Loads support files first, then step definition files
  - Deterministic loading order (alphabetically sorted)
  - Zero configuration required - follows Cucumber.js conventions
  - Backward compatible with existing projects

  **Loading Order:**
  1. `${steps}/**/support/**/*.ts` (support files - FIRST)
  2. `${steps}/**/*.ts` (step definitions - SECOND)
  3. Fallback: `tests/e2e/support/**/*.ts`

  **Example:**

  ```
  tests/e2e/
  ├── support/       # Loaded FIRST
  │   ├── hooks.ts
  │   └── world.ts
  └── steps/         # Loaded SECOND
      └── *.steps.ts
  ```

  This fixes migration friction from Cucumber.js where users expect support files to work automatically without manual imports.

  Fixes #23

### Patch Changes

- Updated dependencies [8a06efb]
  - @deepracticex/vitest-cucumber-plugin@1.3.0

## 1.2.4

### Patch Changes

- e4b502c: fix: StepExecutor now uses feature-scoped registry

  Fixed issue where step definitions were not found during test execution. The StepExecutor now accepts an optional registry parameter and the CodeGenerator passes the feature-scoped registry to ensure step definitions are properly registered and found at runtime.

- Updated dependencies [e4b502c]
  - @deepracticex/vitest-cucumber-plugin@1.2.4

## 1.2.3

### Patch Changes

- 19ac6e0: Fix missing runtime exports for feature-scoped registry functions

  This is a critical bug fix for the feature-scoped registry feature introduced in 1.2.2.

  **Problem:**

  The published 1.2.2 package was missing essential runtime exports (`__setCurrentFeatureContext__`, `__getCurrentFeatureContext__`, `__resetWarningFlag__`) that the CodeGenerator was trying to use. This caused all tests using the `Rule:` keyword to fail with:

  ```
  TypeError: (0 , __setCurrentFeatureContext__) is not a function
  ```

  **Root Cause:**
  - PR #19 added feature-scoped registry support
  - CodeGenerator was updated to use `__setCurrentFeatureContext__` in generated test code
  - The function was implemented in `StepRegistry.ts` and exported in `core/runtime/index.ts`
  - However, `src/runtime.ts` (the public runtime entry point) was not updated to export these functions
  - This caused the build to exclude these functions from the published npm package

  **Fix:**

  Updated `src/runtime.ts` to properly export all feature-scoped registry functions:
  - `__setCurrentFeatureContext__`
  - `__getCurrentFeatureContext__`
  - `__resetWarningFlag__`
  - Types: `ExtendedStepDefinition`, `FeatureContext`

  **Impact:**

  This fixes #21 and allows all feature files (especially those using `Rule:` blocks) to work correctly with vitest 3.x.

  Users experiencing the `__setCurrentFeatureContext__ is not a function` error should upgrade to this version.
  - @deepracticex/vitest-cucumber-plugin@1.2.3

## 1.2.2

### Patch Changes

- a99952f: Implement feature-scoped registry for memory leak prevention

  This change introduces feature-scoped registries to prevent memory leaks and ensure worker processes can exit cleanly:

  **Key Changes:**
  - Each `.feature` file now has its own isolated StepRegistry and HookRegistry
  - Registries are automatically cleaned up after each feature execution
  - Worker processes can now exit properly, preventing the infinite GC loop issue (#16)

  **User Impact:**
  - **Zero breaking changes**: Existing user code continues to work without modifications
  - Step definitions (`Given/When/Then`) work exactly as before
  - No configuration changes required - just update the package

  **Technical Details:**
  - Introduced `StepRegistry.createFeatureScoped()` and `HookRegistry.createFeatureScoped()`
  - CodeGenerator now creates feature-scoped registries instead of using global singletons
  - Added intelligent warning system to detect legacy usage patterns
  - Feature context is set during step file loading via `__setCurrentFeatureContext__()`

  **Migration:**
  Users only need to update the package - no code changes required:

  ```bash
  pnpm update @deepracticex/vitest-cucumber
  ```

  **Deprecation Notice:**
  - Direct use of `StepRegistry.getInstance()` outside of feature context is now deprecated
  - Generated code uses feature-scoped registries (`__featureStepRegistry__`, `__featureHookRegistry__`)
  - Legacy global singleton mode is still supported for backward compatibility

  This resolves #16 by ensuring worker processes properly clean up and exit after test execution.

- Updated dependencies [a99952f]
  - @deepracticex/vitest-cucumber-plugin@1.2.2

## 1.2.1

### Patch Changes

- c2c185a: fix: clean up global registries to prevent worker process hanging

  Vitest worker processes now properly exit after tests complete by clearing global registries (StepRegistry, HookRegistry) in the generated afterAll hook. This prevents orphaned processes that consume excessive memory and can lead to infinite GC loops.

- Updated dependencies [c2c185a]
  - @deepracticex/vitest-cucumber-plugin@1.2.1

## 1.2.0

### Minor Changes

- aeb0932: Unified package architecture: users now only need to install `@deepracticex/vitest-cucumber`

  **Breaking Change (User Experience Improvement):**
  - Users now install only `@deepracticex/vitest-cucumber` instead of two separate packages
  - Plugin is imported from `@deepracticex/vitest-cucumber/plugin` instead of `@deepracticex/vitest-cucumber-plugin`
  - Runtime APIs still imported from `@deepracticex/vitest-cucumber` (no change)

  **Migration Guide:**

  Before:

  ```bash
  pnpm add -D @deepracticex/vitest-cucumber-plugin @deepracticex/vitest-cucumber
  ```

  ```typescript
  import { vitestCucumber } from '@deepracticex/vitest-cucumber-plugin';
  import { Given, When, Then } from '@deepracticex/vitest-cucumber';
  ```

  After:

  ```bash
  pnpm add -D @deepracticex/vitest-cucumber
  ```

  ```typescript
  import { vitestCucumber } from '@deepracticex/vitest-cucumber/plugin';
  import { Given, When, Then } from '@deepracticex/vitest-cucumber';
  ```

  **Internal Changes:**
  - Removed console.log from Given step registration
  - Removed console.error from StepExecutor failure path
  - Updated documentation to reflect new architecture
  - vitest-cucumber now depends on vitest-cucumber-plugin internally

### Patch Changes

- Updated dependencies [aeb0932]
  - @deepracticex/vitest-cucumber-plugin@1.2.0

## 1.1.1

## 1.1.0

### Minor Changes

- Unified version to 1.1.0 across all packages

## 1.0.1

### Patch Changes

- c4aa8c0: Fix {string} parameter expressions creating incorrect capture groups. The {string} regex now uses a single capture group instead of two, fixing parameter index mapping issues when mixed with other parameter types like {int}. This ensures {int} parameters correctly return number type instead of string.

## 1.0.0

### Major Changes

- 1cc60b4: **BREAKING CHANGE**: Split package into plugin and runtime API

  Split `@deepracticex/vitest-cucumber` into two separate packages with clear responsibilities:

  ## New Package: `@deepracticex/vitest-cucumber-plugin`

  Pure Vitest plugin for transforming `.feature` files to test code.

  **Features:**
  - Transforms `.feature` files at build time
  - Configurable runtime module via `runtimeModule` option
  - Zero runtime overhead

  **Installation:**

  ```bash
  pnpm add -D @deepracticex/vitest-cucumber-plugin
  ```

  **Usage:**

  ```typescript
  import { vitestCucumber } from '@deepracticex/vitest-cucumber-plugin';

  export default defineConfig({
    plugins: [
      vitestCucumber({
        steps: 'tests/steps',
        runtimeModule: '@deepracticex/vitest-cucumber', // default
      }),
    ],
  });
  ```

  ## Updated Package: `@deepracticex/vitest-cucumber`

  Now provides runtime API only (Given/When/Then, hooks, runtime utilities).

  **Features:**
  - Zero dependencies
  - Step definitions API (Given/When/Then/And/But)
  - Lifecycle hooks (Before/After/BeforeAll/AfterAll)
  - DataTable and World constructor
  - Runtime exports for generated code

  **Removed:**
  - Plugin functionality (moved to `@deepracticex/vitest-cucumber-plugin`)
  - Gherkin parser dependencies
  - Code generation logic

  ## Migration Guide

  **Before:**

  ```typescript
  // vitest.config.ts
  import { vitestCucumber } from '@deepracticex/vitest-cucumber';

  export default defineConfig({
    plugins: [vitestCucumber()],
  });
  ```

  ```typescript
  // steps
  import { Given, When, Then } from '@deepracticex/vitest-cucumber';
  ```

  **After:**

  ```typescript
  // vitest.config.ts
  import { vitestCucumber } from '@deepracticex/vitest-cucumber-plugin'; // Changed

  export default defineConfig({
    plugins: [vitestCucumber()],
  });
  ```

  ```typescript
  // steps - no change
  import { Given, When, Then } from '@deepracticex/vitest-cucumber';
  ```

  **Installation:**

  ```bash
  # Install both packages
  pnpm add -D @deepracticex/vitest-cucumber-plugin @deepracticex/vitest-cucumber
  ```

  ## Benefits
  1. **Clearer separation of concerns**: Plugin handles compile-time, API handles runtime
  2. **Wrapper package support**: Configure `runtimeModule` to use custom runtime
  3. **Smaller dependencies**: API package has zero dependencies
  4. **Better encapsulation**: Wrapper packages can fully encapsulate the runtime dependency

  ## For Package Authors

  Create wrapper packages that encapsulate the runtime:

  ```typescript
  // your-wrapper/vitest.config.ts
  import { vitestCucumber } from '@deepracticex/vitest-cucumber-plugin';

  export default defineConfig({
    plugins: [
      vitestCucumber({
        runtimeModule: '@your-company/testing-utils', // Your wrapper
      }),
    ],
  });
  ```

  Users only need to install your wrapper package, not the underlying vitest-cucumber.
