# @deepracticex/vitest-cucumber

Run Cucumber BDD tests seamlessly within Vitest.

## Features

- 🔥 **Native Vitest Integration** - Feature files run as regular Vitest tests
- 🥒 **Full Gherkin Support** - All Cucumber features: Scenarios, Scenario Outlines, Backgrounds, Rules, Data Tables, Doc Strings
- 🎯 **TypeScript First** - Full type safety with parameter type inference
- ⚡ **Fast** - Leverages Vitest's parallel execution and watch mode
- 🧪 **Test Context (World)** - Custom context objects with `setWorldConstructor`
- 🪝 **Hooks** - Before/After, BeforeAll/AfterAll support
- 🔍 **Auto Discovery** - Automatically finds and loads step definitions
- 📝 **Parameter Types** - Built-in support for {string}, {int}, {float}, {word}

## Installation

```bash
# Using pnpm (recommended)
pnpm add -D @deepracticex/vitest-cucumber vitest @cucumber/cucumber

# Using npm
npm install -D @deepracticex/vitest-cucumber vitest @cucumber/cucumber
```

## Quick Start

### 1. Configure Vitest

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import { vitestCucumber } from '@deepracticex/vitest-cucumber';

export default defineConfig({
  plugins: [vitestCucumber()],
  test: {
    include: ['**/*.feature'],
  },
});
```

### 2. Write a Feature

```gherkin
# features/calculator.feature
Feature: Calculator
  Scenario: Add two numbers
    Given I have entered 50 into the calculator
    And I have entered 70 into the calculator
    When I press add
    Then the result should be 120
```

### 3. Define Steps

```typescript
// tests/e2e/steps/calculator.steps.ts
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

## Advanced Usage

### Custom World Context

Define your own context object with helper methods:

```typescript
// tests/e2e/support/world.ts
import { setWorldConstructor } from '@deepracticex/vitest-cucumber';

export interface MyWorld {
  calculator: Calculator;
  result: number;
  set(key: string, value: any): void;
  get(key: string): any;
}

setWorldConstructor(function (): MyWorld {
  return {
    calculator: new Calculator(),
    result: 0,
    set(key, val) {
      this[key] = val;
    },
    get(key) {
      return this[key];
    },
  };
});
```

Then use it in hooks:

```typescript
// tests/e2e/support/hooks.ts
import { Before, After } from '@deepracticex/vitest-cucumber';
import type { MyWorld } from './world';

Before(async function (this: MyWorld) {
  this.calculator.reset();
});

After(async function (this: MyWorld) {
  // Cleanup
});
```

### Data Tables

```gherkin
Scenario: Multiple users
  Given the following users exist:
    | name  | email          | role  |
    | Alice | alice@test.com | admin |
    | Bob   | bob@test.com   | user  |
```

```typescript
import { Given, DataTable } from '@deepracticex/vitest-cucumber';

Given('the following users exist:', function (table: DataTable) {
  const users = table.hashes(); // Array of objects
  users.forEach((user) => {
    createUser(user.name, user.email, user.role);
  });
});
```

### Doc Strings

```gherkin
Scenario: Process JSON
  Given I have the following JSON:
    """
    {
      "name": "Test",
      "value": 42
    }
    """
```

```typescript
import { Given } from '@deepracticex/vitest-cucumber';

Given('I have the following JSON:', function (docString: string) {
  this.data = JSON.parse(docString);
});
```

### Configuration Options

```typescript
vitestCucumber({
  features: ['features/**/*.feature'], // Feature file patterns
  steps: 'tests/e2e/steps', // Step definitions directory
  verbose: true, // Enable detailed logging
});
```

## Plugin Architecture

This plugin works by transforming `.feature` files into Vitest test files at build time:

```
.feature file → Feature Parser → Code Generator → Vitest test
```

Each scenario becomes a Vitest `test()`, and steps are executed through the StepRegistry.

## Requirements

- Node.js >= 18
- Vitest >= 2.0
- @cucumber/cucumber >= 11.0
- tsx (for TypeScript step definitions)

## License

MIT
