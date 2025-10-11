---
'@deepracticex/vitest-cucumber-plugin': major
'@deepracticex/vitest-cucumber': major
---

**BREAKING CHANGE**: Split package into plugin and runtime API

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
