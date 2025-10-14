# @deepracticex/vitest-cucumber

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
