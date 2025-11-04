# @deepracticex/vitest-cucumber-plugin

## 1.3.1

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

## 1.2.4

### Patch Changes

- e4b502c: fix: StepExecutor now uses feature-scoped registry

  Fixed issue where step definitions were not found during test execution. The StepExecutor now accepts an optional registry parameter and the CodeGenerator passes the feature-scoped registry to ensure step definitions are properly registered and found at runtime.

## 1.2.3

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

## 1.2.1

### Patch Changes

- c2c185a: fix: clean up global registries to prevent worker process hanging

  Vitest worker processes now properly exit after tests complete by clearing global registries (StepRegistry, HookRegistry) in the generated afterAll hook. This prevents orphaned processes that consume excessive memory and can lead to infinite GC loops.

## 1.2.0

### Patch Changes

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

## 1.1.1

### Patch Changes

- 4ca3229: Fix Before hook execution order to comply with Cucumber standard

  Before hooks now execute before Background steps, following the official Cucumber execution order:
  1. Before hooks
  2. Background steps
  3. Scenario steps
  4. After hooks

  This fixes issue #10 where Before hooks were incorrectly executing after Background steps, causing Background data to be cleared by the hooks.

## 1.1.0

### Minor Changes

- b9b328c: Share context between Background and Scenario steps to match Cucumber.js behavior

  Background and Scenario steps now share the same ContextManager instance by leveraging Vitest's native context parameter mechanism. This ensures that state set in Background steps is accessible in Scenario steps, matching standard Cucumber.js behavior.

  **Changes:**
  - Modified `CodeGenerator.generateBackground()` to accept Vitest context and store ContextManager
  - Modified `CodeGenerator.generateScenario()` to reuse ContextManager from context
  - Modified `CodeGenerator.generateScenarioOutline()` to reuse ContextManager from context
  - Added comprehensive tests for context sharing across different scenarios

  **Impact:**
  - Fixes issue #6: Background steps now properly share state with Scenario steps
  - Reduces learning curve for users familiar with Cucumber.js
  - Eliminates need for workarounds using Before hooks
  - Background now works as expected in standard Cucumber usage patterns

  **Migration:**
  - Existing tests will continue to work
  - Users who implemented workarounds in Before hooks can now rely on Background
  - No breaking changes to user-facing APIs

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
