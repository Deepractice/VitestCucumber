---
'@deepracticex/vitest-cucumber': patch
---

Fix missing runtime exports for feature-scoped registry functions

This is a critical bug fix for the feature-scoped registry feature introduced in 1.2.2.

**Problem:**

The published 1.2.2 package was missing essential runtime exports (`__setCurrentFeatureContext__`, `__getCurrentFeatureContext__`, `__resetWarningFlag__`) that the CodeGenerator was trying to use. This caused all tests using the `Rule:` keyword to fail with:

```
TypeError: (0 , __setCurrentFeatureContext__) is not a function
```

**Root Cause:**

- PR #19 added feature-scoped registry support
- CodeGenerator was updated to use `__setCurrentFeatureContext__` in generated test code
- The function was implemented in `StepRegistry.ts` and exported in `core/runtime/index.ts`
- However, `src/runtime.ts` (the public runtime entry point) was not updated to export these functions
- This caused the build to exclude these functions from the published npm package

**Fix:**

Updated `src/runtime.ts` to properly export all feature-scoped registry functions:

- `__setCurrentFeatureContext__`
- `__getCurrentFeatureContext__`
- `__resetWarningFlag__`
- Types: `ExtendedStepDefinition`, `FeatureContext`

**Impact:**

This fixes #21 and allows all feature files (especially those using `Rule:` blocks) to work correctly with vitest 3.x.

Users experiencing the `__setCurrentFeatureContext__ is not a function` error should upgrade to this version.
