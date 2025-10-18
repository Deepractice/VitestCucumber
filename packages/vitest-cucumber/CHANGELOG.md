# @deepracticex/vitest-cucumber

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
