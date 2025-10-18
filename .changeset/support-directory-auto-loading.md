---
'@deepracticex/vitest-cucumber-plugin': minor
'@deepracticex/vitest-cucumber': minor
'@deepracticex/example': patch
---

Add support directory auto-loading (Cucumber.js compatible)

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
