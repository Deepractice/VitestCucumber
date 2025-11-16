<div align="center">
  <h1>VitestCucumber</h1>
  <p><strong>Native Cucumber BDD experience for Vitest</strong></p>
  <p>Write standard Gherkin features with authentic Cucumber APIs</p>

  <p>
    <a href="https://www.npmjs.com/package/@deepracticex/vitest-cucumber"><img src="https://img.shields.io/npm/v/@deepracticex/vitest-cucumber" alt="npm version"/></a>
    <a href="https://github.com/Deepractice/VitestCucumber"><img src="https://img.shields.io/github/stars/Deepractice/VitestCucumber?style=social" alt="Stars"/></a>
    <a href="LICENSE"><img src="https://img.shields.io/github/license/Deepractice/VitestCucumber?color=blue" alt="License"/></a>
  </p>
</div>

---

## Features

- ✨ **100% Cucumber-compliant** - Standard execution order, familiar APIs, no compromises
- 🚀 **Zero configuration** - Works with Vitest out of the box
- 📝 **Real Gherkin** - Use `.feature` files, not wrapped test code
- 🎯 **Type-safe** - Full TypeScript support with type inference
- ⚡ **Vitest Native** - Full compatibility with Vitest ecosystem (UI, coverage, watch mode)

## Quick Start

### 1. Installation

```bash
pnpm add -D @deepracticex/vitest-cucumber vitest
```

### 2. Configure Plugin

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import { vitestCucumber } from '@deepracticex/vitest-cucumber/plugin';

export default defineConfig({
  plugins: [
    vitestCucumber({
      features: ['features/**/*.feature'],
      steps: 'tests/e2e/steps',
    }),
  ],
  test: {
    include: ['**/*.feature'],
  },
});
```

### 3. Write Feature

```gherkin
# features/calculator.feature
Feature: Calculator
  Scenario: Add two numbers
    Given I have entered 50 into the calculator
    And I have entered 70 into the calculator
    When I press add
    Then the result should be 120
```

### 4. Define Steps

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

### 5. Run Tests

```bash
pnpm vitest
```

## Core Concepts

### Step Definitions

Use `Given`, `When`, `Then` to define steps with parameter extraction:

```typescript
import { Given, When, Then } from '@deepracticex/vitest-cucumber';

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

Standard Cucumber lifecycle hooks with guaranteed execution order:

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
  // Runs before each scenario (before Background steps)
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

### Custom World Context

Define a custom World class to share state across steps:

```typescript
import { setWorldConstructor } from '@deepracticex/vitest-cucumber';

class CustomWorld {
  calculator: Calculator;
  result: number;

  constructor() {
    this.calculator = new Calculator();
    this.result = 0;
  }

  async performCalculation() {
    // Custom helper methods
  }
}

setWorldConstructor(CustomWorld);

// Use in steps with type safety
Given('...', function (this: CustomWorld) {
  this.calculator.add(5);
});
```

### Data Tables

Work with tabular data in your scenarios:

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
  const users = table.hashes();
  users.forEach((user) => {
    console.log(user.name, user.email, user.role);
  });
});
```

## Project Structure

### Recommended Layout

```
project/
├── features/              # Feature files
│   ├── auth.feature
│   └── user.feature
└── tests/
    └── e2e/
        ├── support/       # Hooks, world, custom types (loaded first)
        │   ├── hooks.ts
        │   └── world.ts
        └── steps/         # Step definitions (loaded second)
            ├── auth.steps.ts
            └── user.steps.ts
```

Support files are automatically discovered and loaded before step definitions, ensuring hooks and world setup are available when steps execute.

## Documentation

- [vitest-cucumber](./packages/vitest-cucumber) - Full API documentation and advanced usage
- [vitest-cucumber-plugin](./packages/vitest-cucumber-plugin) - Plugin configuration options

## Why VitestCucumber?

### Authentic Cucumber Experience

- **Real `.feature` files** parsed with official `@cucumber/gherkin`
- **Standard Cucumber APIs** - Same APIs as Cucumber.js
- **Spec-compliant execution order** - Hooks run exactly as documented
- **Support directory convention** - Follows Cucumber.js patterns

### Vitest Native

- Built for Vitest from the ground up
- No extra test runners needed
- Full Vitest ecosystem compatibility
- TypeScript with proper type inference

## Requirements

- Node.js >= 18
- Vitest >= 2.0 || >= 3.0

## License

MIT © Deepractice
