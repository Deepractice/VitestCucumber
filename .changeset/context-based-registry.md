---
'@deepracticex/vitest-cucumber': patch
'@deepracticex/vitest-cucumber-plugin': patch
---

Implement feature-scoped registry for memory leak prevention

This change introduces feature-scoped registries to prevent memory leaks and ensure worker processes can exit cleanly:

**Key Changes:**

- Each `.feature` file now has its own isolated StepRegistry and HookRegistry
- Registries are automatically cleaned up after each feature execution
- Worker processes can now exit properly, preventing the infinite GC loop issue (#16)

**User Impact:**

- **Zero breaking changes**: Existing user code continues to work without modifications
- Step definitions (`Given/When/Then`) work exactly as before
- No configuration changes required - just update the package

**Technical Details:**

- Introduced `StepRegistry.createFeatureScoped()` and `HookRegistry.createFeatureScoped()`
- CodeGenerator now creates feature-scoped registries instead of using global singletons
- Added intelligent warning system to detect legacy usage patterns
- Feature context is set during step file loading via `__setCurrentFeatureContext__()`

**Migration:**
Users only need to update the package - no code changes required:

```bash
pnpm update @deepracticex/vitest-cucumber
```

**Deprecation Notice:**

- Direct use of `StepRegistry.getInstance()` outside of feature context is now deprecated
- Generated code uses feature-scoped registries (`__featureStepRegistry__`, `__featureHookRegistry__`)
- Legacy global singleton mode is still supported for backward compatibility

This resolves #16 by ensuring worker processes properly clean up and exit after test execution.
