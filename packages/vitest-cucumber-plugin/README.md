# @deepracticex/vitest-cucumber-plugin

**Vitest plugin that brings Cucumber BDD to your tests** - Write `.feature` files, get native Vitest tests.

🥒 **Real Gherkin** - Standard `.feature` files parsed with `@cucumber/gherkin`
⚡ **Build-time transformation** - Zero runtime overhead
🎯 **Auto-discovery** - Automatically finds step definitions
🔧 **Vitest native** - Full ecosystem compatibility (UI, watch, coverage)

> **Note**: This is the **plugin** package. You also need `@deepracticex/vitest-cucumber` for step definitions (Given/When/Then/Before/After).

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

## Quick Start

### 1. Install

```bash
# Install both packages together
pnpm add -D @deepracticex/vitest-cucumber-plugin @deepracticex/vitest-cucumber vitest
```

### 2. Configure Vitest

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import { vitestCucumber } from '@deepracticex/vitest-cucumber-plugin';

export default defineConfig({
  plugins: [
    vitestCucumber({
      features: ['features/**/*.feature'], // Where your .feature files are
      steps: ['tests/steps/**/*.ts'], // Where your step definitions are
    }),
  ],
  test: {
    include: ['**/*.feature'], // Tell Vitest to run .feature files
  },
});
```

### 3. Write a Feature

```gherkin
# features/login.feature
Feature: User Login
  As a user
  I want to log in to the application
  So that I can access my account

  Background:
    Given the application is running
    And the database is seeded

  Scenario: Successful login
    Given I am on the login page
    When I enter username "john@example.com"
    And I enter password "secret123"
    And I click the login button
    Then I should see the dashboard
    And I should see "Welcome, John"

  Scenario: Failed login
    Given I am on the login page
    When I enter username "wrong@example.com"
    And I enter password "wrongpass"
    And I click the login button
    Then I should see an error "Invalid credentials"
    And I should remain on the login page
```

### 4. Define Steps

```typescript
// tests/steps/login.steps.ts
import {
  Given,
  When,
  Then,
  Before,
  setWorldConstructor,
} from '@deepracticex/vitest-cucumber';
import { expect } from 'vitest';

// Define your test context
interface LoginWorld {
  page: Page;
  user: User | null;
  error: string | null;
}

setWorldConstructor(function (): LoginWorld {
  return {
    page: new Page(),
    user: null,
    error: null,
  };
});

// Before hook runs before Background
Before(function (this: LoginWorld) {
  this.user = null;
  this.error = null;
});

// Background steps
Given('the application is running', async function (this: LoginWorld) {
  await this.page.navigate('/');
});

Given('the database is seeded', async function (this: LoginWorld) {
  await seedDatabase();
});

// Scenario steps
Given('I am on the login page', async function (this: LoginWorld) {
  await this.page.navigate('/login');
});

When(
  'I enter username {string}',
  async function (this: LoginWorld, username: string) {
    await this.page.fill('#username', username);
  },
);

When(
  'I enter password {string}',
  async function (this: LoginWorld, password: string) {
    await this.page.fill('#password', password);
  },
);

When('I click the login button', async function (this: LoginWorld) {
  await this.page.click('#login-btn');
});

Then('I should see the dashboard', async function (this: LoginWorld) {
  expect(await this.page.url()).toBe('/dashboard');
});

Then('I should see {string}', async function (this: LoginWorld, text: string) {
  expect(await this.page.textContent('body')).toContain(text);
});

Then(
  'I should see an error {string}',
  async function (this: LoginWorld, error: string) {
    expect(await this.page.textContent('.error')).toBe(error);
  },
);

Then('I should remain on the login page', async function (this: LoginWorld) {
  expect(await this.page.url()).toBe('/login');
});
```

### 5. Run Tests

```bash
# Run all feature tests
pnpm vitest

# Run specific feature
pnpm vitest features/login.feature

# Watch mode
pnpm vitest --watch

# With UI
pnpm vitest --ui
```

That's it! 🎉 You now have Cucumber BDD working in Vitest.

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

## Configuration Options

```typescript
vitestCucumber({
  features?: string | string[],  // Feature file patterns (optional, defaults to auto-discovery)
  steps?: string | string[],     // Step definition patterns (optional, defaults to 'tests/steps')
  runtimeModule?: string,        // Custom runtime module (for wrapper packages)
  verbose?: boolean,             // Enable verbose logging (default: false)
})
```

### Options Details

| Option          | Type                 | Default                           | Description                                                             |
| --------------- | -------------------- | --------------------------------- | ----------------------------------------------------------------------- |
| `features`      | `string \| string[]` | Auto-discovery                    | Glob patterns for `.feature` files (e.g., `'features/**/*.feature'`)    |
| `steps`         | `string \| string[]` | `'tests/steps'`                   | Glob patterns for step definition files (e.g., `'tests/**/*.steps.ts'`) |
| `runtimeModule` | `string`             | `'@deepracticex/vitest-cucumber'` | Module path for runtime imports (for creating wrapper packages)         |
| `verbose`       | `boolean`            | `false`                           | Log transformation details (useful for debugging)                       |

### Examples

**Minimal configuration:**

```typescript
plugins: [vitestCucumber()]; // Uses all defaults
```

**Custom paths:**

```typescript
plugins: [
  vitestCucumber({
    features: ['e2e/**/*.feature', 'integration/**/*.feature'],
    steps: ['e2e/steps/**/*.ts', 'integration/steps/**/*.ts'],
  }),
];
```

**Debug mode:**

```typescript
plugins: [
  vitestCucumber({
    verbose: true, // See what the plugin is doing
  }),
];
```

## How It Works

The plugin transforms `.feature` files at build time:

```
.feature file → Gherkin Parser → Code Generator → Vitest test
```

Each scenario becomes a `it()` test, and steps are executed through the runtime API.

## Creating Wrapper Packages

### Problem: Dependency Transmission

When creating wrapper packages, you want users to only install your package without directly depending on `@deepracticex/vitest-cucumber`. However, the plugin generates code that imports runtime APIs, and pnpm's strict dependency isolation prevents access to transitive dependencies.

### Solution: Custom Runtime Module

Use the `runtimeModule` option to generate imports from your wrapper package instead:

**Step 1: Configure the plugin**

```typescript
// @myorg/config-preset/vitest.config.ts
import { defineConfig } from 'vitest/config';
import { vitestCucumber } from '@deepracticex/vitest-cucumber-plugin';

export const vitest = {
  base: defineConfig({
    plugins: [
      vitestCucumber({
        runtimeModule: '@myorg/testing-utils', // Point to your wrapper
      }),
    ],
    test: {
      include: ['**/*.feature'],
    },
  }),
};
```

**Step 2: Re-export runtime in your wrapper**

```typescript
// @myorg/testing-utils/src/index.ts
// Re-export runtime APIs
export {
  StepExecutor,
  ContextManager,
  DataTable,
  HookRegistry,
} from '@deepracticex/vitest-cucumber/runtime';

// Re-export step definition APIs
export {
  Given,
  When,
  Then,
  Before,
  After,
} from '@deepracticex/vitest-cucumber';
```

**Step 3: User's simple dependency**

```json
{
  "devDependencies": {
    "@myorg/testing-utils": "^1.0.0"
  }
}
```

Now the generated code imports from `@myorg/testing-utils/runtime`, which users have access to through their direct dependency!

### Benefits

- ✅ **Single dependency** - Users only install your wrapper package
- ✅ **Version control** - You control which runtime version to use
- ✅ **Natural transmission** - Dependencies flow through the dependency chain
- ✅ **Backward compatible** - Direct users can still use the default runtime

## Requirements

- Node.js >= 18
- Vitest >= 2.0

## License

MIT
