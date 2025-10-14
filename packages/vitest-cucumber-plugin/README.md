# @deepracticex/vitest-cucumber-plugin

> **Internal implementation package** - Users should install [@deepracticex/vitest-cucumber](https://www.npmjs.com/package/@deepracticex/vitest-cucumber) instead.

## For Users

This package contains the build-time transformation logic for Cucumber feature files. You don't need to install it directly.

**Install the main package instead:**

```bash
pnpm add -D @deepracticex/vitest-cucumber
```

**See the [main documentation](https://github.com/Deepractice/EnhancedVitest/tree/main/packages/vitest-cucumber#readme) for usage guide.**

---

## For Contributors & Advanced Users

This package is the **compile-time plugin** that transforms `.feature` files into Vitest test code.

### Architecture Role

```
User Code (.feature files)
    ↓
vitest-cucumber-plugin (this package)
    • Parses Gherkin with @cucumber/gherkin
    • Generates Vitest test code
    • Handles step discovery
    ↓
Generated Test Code
    ↓
vitest-cucumber (runtime)
    • Executes steps
    • Manages hooks
    • Provides DataTable API
```

### Key Features

- **Build-time transformation** - Zero runtime overhead
- **Official Gherkin parser** - Uses `@cucumber/gherkin`
- **Auto-discovery** - Finds step definitions automatically
- **Configurable runtime** - Support for wrapper packages via `runtimeModule` option

### Plugin Configuration

```typescript
import { vitestCucumber } from '@deepracticex/vitest-cucumber-plugin';

vitestCucumber({
  features: ['features/**/*.feature'],
  steps: ['tests/steps/**/*.ts'],
  runtimeModule: '@deepracticex/vitest-cucumber', // default
  verbose: false,
});
```

### Implementation Details

**Transformation Pipeline:**

1. Parse `.feature` file with `@cucumber/gherkin`
2. Extract scenarios, backgrounds, examples
3. Generate Vitest test code with proper imports
4. Auto-discover and import step definitions

**Code Generation:**

- Each Feature → `describe()` block
- Each Scenario → `it()` test
- Background steps → Run before each scenario
- Scenario Outline → Multiple `it()` tests with data

### Custom Runtime Module

For wrapper packages, use `runtimeModule` to redirect imports:

```typescript
vitestCucumber({
  runtimeModule: '@your-org/testing-utils',
});
```

Generated code will import from your package instead:

```typescript
import { StepExecutor } from '@your-org/testing-utils/runtime';
```

Your package re-exports from `@deepracticex/vitest-cucumber`:

```typescript
export * from '@deepracticex/vitest-cucumber/runtime';
```

### Contributing

See the [main repository](https://github.com/Deepractice/EnhancedVitest) for contribution guidelines.

### License

MIT
