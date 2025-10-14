# @deepracticex/vitest-cucumber

**Native Cucumber BDD experience for Vitest** - Write standard Gherkin features with authentic Cucumber APIs.

✨ **100% Cucumber-compliant** - Standard execution order, familiar APIs, no compromises
🚀 **Zero configuration** - Works with Vitest out of the box
📝 **Real Gherkin** - Use `.feature` files, not wrapped test code
🎯 **Type-safe** - Full TypeScript support with type inference

> **Note**: This package provides the runtime API. You need `@deepracticex/vitest-cucumber-plugin` for transforming `.feature` files.

## What's This Package?

This is the **runtime library** that provides:

- `Given`, `When`, `Then` - Step definition APIs
- `Before`, `After`, `BeforeAll`, `AfterAll` - Lifecycle hooks
- `DataTable` - Rich API for tabular data
- `setWorldConstructor` - Custom test context

The generated test code (from `.feature` files) imports from this package.

## Installation

```bash
# Install the package
pnpm add -D @deepracticex/vitest-cucumber vitest

# Or use npm
npm install -D @deepracticex/vitest-cucumber vitest
```

## Architecture

```
┌─────────────────────────────────────┐
│  @deepracticex/vitest-cucumber      │
│                                     │
│  • Given/When/Then (main export)    │
│  • vitestCucumber (/plugin)         │
│  • Runtime APIs (/runtime)          │
└─────────────────────────────────────┘

One package, everything included.
```

## Quick Start

### 1. Configure Plugin

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import { vitestCucumber } from '@deepracticex/vitest-cucumber/plugin';

export default defineConfig({
  plugins: [vitestCucumber()],
  test: {
    include: ['**/*.feature'],
  },
});
```

### 2. Write Feature

```gherkin
# features/calculator.feature
Feature: Calculator
  Scenario: Add two numbers
    Given I have entered 50 into the calculator
    And I have entered 70 into the calculator
    When I press add
    Then the result should be 120
```

### 3. Define Steps (This Package)

```typescript
// tests/steps/calculator.steps.ts
import { Given, When, Then } from '@deepracticex/vitest-cucumber';
import { expect } from 'vitest';

Given('I have entered {int} into the calculator', function (num: number) {
  this.numbers = this.numbers || [];
  this.numbers.push(num);
});

When('I press add', function () {
  this.result = this.numbers.reduce((a, b) => a + b, 0);
});

Then('the result should be {int}', function (expected: number) {
  expect(this.result).toBe(expected);
});
```

### 4. Run Tests

```bash
pnpm vitest
```

## Core APIs

### Step Definitions

```typescript
import { Given, When, Then, And, But } from '@deepracticex/vitest-cucumber';

// Parameter types: {int}, {float}, {string}, {word}
Given('I have {int} items', function (count: number) {
  this.count = count;
});

When('I add {int} more', function (more: number) {
  this.count += more;
});

Then('I should have {int} items', function (expected: number) {
  expect(this.count).toBe(expected);
});
```

### Hooks

**Cucumber-standard execution order** (verified against official spec):

```typescript
import {
  Before,
  After,
  BeforeAll,
  AfterAll,
} from '@deepracticex/vitest-cucumber';

BeforeAll(async function () {
  // Runs once before all scenarios
});

Before(async function () {
  // Runs before each scenario (and before Background steps)
  // Perfect for cleanup/reset operations
});

After(async function () {
  // Runs after each scenario
});

AfterAll(async function () {
  // Runs once after all scenarios
});
```

**Execution order per scenario:**

1. `Before` hooks
2. `Background` steps (if defined)
3. Scenario steps
4. `After` hooks

This follows the [official Cucumber specification](https://cucumber.io/docs/cucumber/api/#hooks), ensuring your tests behave identically to other Cucumber implementations.

### Custom World Context

```typescript
import { setWorldConstructor } from '@deepracticex/vitest-cucumber';

interface MyWorld {
  calculator: Calculator;
  result: number;
}

setWorldConstructor(function (): MyWorld {
  return {
    calculator: new Calculator(),
    result: 0,
  };
});

// Use in steps
Given('...', function (this: MyWorld) {
  this.calculator.add(5);
});
```

### Data Tables

```gherkin
Scenario: Multiple users
  Given the following users:
    | name  | email          | role  |
    | Alice | alice@test.com | admin |
    | Bob   | bob@test.com   | user  |
```

```typescript
import { Given, DataTable } from '@deepracticex/vitest-cucumber';

Given('the following users:', function (table: DataTable) {
  // Get as array of objects
  const users = table.hashes();
  users.forEach((user) => {
    console.log(user.name, user.email, user.role);
  });

  // Or raw 2D array
  const rows = table.raw();
});
```

### Doc Strings

```gherkin
Scenario: Process JSON
  Given I have the following JSON:
    """json
    {
      "name": "Test",
      "value": 42
    }
    """
```

```typescript
Given('I have the following JSON:', function (docString: string) {
  this.data = JSON.parse(docString);
});
```

## For Package Authors

If you're building a testing utilities wrapper:

```typescript
// your-package/cucumber.ts
export * from '@deepracticex/vitest-cucumber';

// Export runtime for generated code
export * from '@deepracticex/vitest-cucumber/runtime';
```

Then configure the plugin to use your package:

```typescript
// vitest.config.ts
vitestCucumber({
  runtimeModule: '@your-company/testing-utils',
});
```

Generated code will import from your package instead:

```typescript
import { StepExecutor, ... } from '@your-company/testing-utils/runtime';
```

## Why Choose This Over Alternatives?

### 🎯 Authentic Cucumber Experience

Unlike test wrappers that mimic Gherkin syntax, we provide:

- **Real `.feature` files** parsed with official `@cucumber/gherkin`
- **Standard Cucumber APIs** - `Given`, `When`, `Then`, `Before`, `After`
- **Spec-compliant execution order** - Hooks run exactly as documented in Cucumber spec
- **Familiar patterns** - If you know Cucumber, you already know this

### ⚡ Vitest Native

- Built for Vitest from the ground up
- No extra test runners or frameworks
- Full compatibility with Vitest ecosystem (UI, coverage, watch mode)
- TypeScript support with proper type inference

### 🔒 Production Ready

- Comprehensive test coverage
- Actively maintained
- Used in production applications
- Regular updates following Vitest and Cucumber standards

## Requirements

- Node.js >= 18
- Vitest >= 2.0 || >= 3.0

## License

MIT
