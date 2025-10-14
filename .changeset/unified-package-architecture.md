---
'@deepracticex/vitest-cucumber': minor
'@deepracticex/vitest-cucumber-plugin': patch
---

Unified package architecture: users now only need to install `@deepracticex/vitest-cucumber`

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
