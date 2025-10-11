# @deepracticex/vitest-cucumber-plugin

Vitest plugin for transforming Cucumber feature files to test code.

> **Note**: This package provides the Vitest plugin only. You also need `@deepracticex/vitest-cucumber` for the runtime API (Given/When/Then).

## Features

- 🔥 **Vitest Plugin** - Transforms `.feature` files into Vitest tests at build time
- 🥒 **Full Gherkin Support** - Scenarios, Scenario Outlines, Backgrounds, Rules, Data Tables, Doc Strings
- ⚙️ **Configurable Runtime** - Use custom runtime module for wrapper packages
- 🔍 **Auto Discovery** - Automatically finds and loads step definitions
- ⚡ **Zero Runtime Overhead** - Pure build-time transformation

## Installation

```bash
# Install both plugin and runtime
pnpm add -D @deepracticex/vitest-cucumber-plugin @deepracticex/vitest-cucumber vitest

# Or use npm
npm install -D @deepracticex/vitest-cucumber-plugin @deepracticex/vitest-cucumber vitest
```

## Usage

### Basic Setup

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import { vitestCucumber } from '@deepracticex/vitest-cucumber-plugin';

export default defineConfig({
  plugins: [
    vitestCucumber({
      steps: 'tests/steps',
    }),
  ],
  test: {
    include: ['**/*.feature'],
  },
});
```

### Advanced: Custom Runtime Module

For wrapper packages that want to encapsulate the runtime dependency:

```typescript
// vitest.config.ts
vitestCucumber({
  steps: 'tests/steps',
  runtimeModule: '@my-company/testing-utils', // Use your wrapper package
});
```

Generated code will import from your custom module:

```typescript
import { StepExecutor, ... } from '@my-company/testing-utils/runtime';
```

## Options

| Option          | Type      | Default                           | Description                                |
| --------------- | --------- | --------------------------------- | ------------------------------------------ |
| `steps`         | `string`  | `'tests/steps'`                   | Directory containing step definition files |
| `runtimeModule` | `string`  | `'@deepracticex/vitest-cucumber'` | Module path for runtime imports            |
| `verbose`       | `boolean` | `false`                           | Enable verbose logging                     |

## How It Works

The plugin transforms `.feature` files at build time:

```
.feature file → Gherkin Parser → Code Generator → Vitest test
```

Each scenario becomes a `it()` test, and steps are executed through the runtime API.

## Requirements

- Node.js >= 18
- Vitest >= 2.0

## License

MIT
